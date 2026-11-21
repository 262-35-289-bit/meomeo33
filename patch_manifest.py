import os
import shutil
from PIL import Image

manifest_path = "android/app/src/main/AndroidManifest.xml"
with open(manifest_path, "r", encoding="utf-8") as f:
    xml = f.read()

perms = """
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.USE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />
    <uses-permission android:name="android.permission.DISABLE_KEYGUARD" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
"""

# Remove android.permission.INTERNET so the app is strictly 100% offline with zero network dependency
xml = xml.replace('<uses-permission android:name="android.permission.INTERNET" />', '')
xml = xml.replace('<uses-permission android:name="android.permission.INTERNET"/>', '')

if "SCHEDULE_EXACT_ALARM" not in xml:
    xml = xml.replace("<application", perms + "\n    <application", 1)

if "android:showWhenLocked" not in xml:
    xml = xml.replace(
        'android:name=".MainActivity"',
        'android:name=".MainActivity" android:showWhenLocked="true" android:turnScreenOn="true" android:excludeFromRecents="false"'
    )
    if 'android:launchMode="singleTask"' not in xml:
        xml = xml.replace(
            'android:name=".MainActivity"',
            'android:name=".MainActivity" android:launchMode="singleTask"'
        )

native_components = """
        <receiver
            android:name=".MeoAlarmReceiver"
            android:enabled="true"
            android:exported="false" />

        <receiver
            android:name=".MeoRoutineReceiver"
            android:enabled="true"
            android:exported="false" />

        <receiver
            android:name=".MeoBootReceiver"
            android:enabled="true"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
                <action android:name="android.intent.action.LOCKED_BOOT_COMPLETED" />
                <action android:name="android.intent.action.MY_PACKAGE_REPLACED" />
            </intent-filter>
        </receiver>

        <service
            android:name=".MeoAlarmService"
            android:enabled="true"
            android:exported="false"
            android:foregroundServiceType="mediaPlayback" />
"""

if "MeoAlarmReceiver" not in xml:
    xml = xml.replace("</application>", native_components + "\n    </application>")

with open(manifest_path, "w", encoding="utf-8") as f:
    f.write(xml)

print("AndroidManifest.xml patched with Native Alarm & Routine components.")

java_pkg_dir = None
package_name = "com.meomeo.meoalarm"
for root, dirs, files in os.walk("android/app/src/main/java"):
    if "MainActivity.java" in files:
        java_pkg_dir = root
        ma_path = os.path.join(root, "MainActivity.java")
        with open(ma_path, "r", encoding="utf-8") as f:
            first_line = f.readline().strip()
            if first_line.startswith("package "):
                package_name = first_line.replace("package ", "").replace(";", "").strip()
        break

if java_pkg_dir:
    scheduler_java = f"""package {package_name};

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Calendar;

public class MeoAlarmScheduler {{
    private static final String PREFS_NAME = "MeoNativeAlarmPrefs";
    private static final String KEY_ALARMS_JSON = "alarms_json";

    public static void saveAndScheduleAll(Context context, String alarmsJson) {{
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit().putString(KEY_ALARMS_JSON, alarmsJson).apply();
        scheduleFromPrefs(context);
    }}

    public static void scheduleFromPrefs(Context context) {{
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonStr = prefs.getString(KEY_ALARMS_JSON, "[]");
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;

        for (int i = 0; i < 20; i++) {{
            Intent cancelIntent = new Intent(context, MeoAlarmReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 7000 + i, cancelIntent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );
            if (pi != null) {{
                alarmManager.cancel(pi);
                pi.cancel();
            }}
        }}

        try {{
            JSONArray arr = new JSONArray(jsonStr);
            int slot = 0;
            for (int i = 0; i < arr.length(); i++) {{
                JSONObject obj = arr.getJSONObject(i);
                if (!obj.optBoolean("active", true)) continue;

                String alarmId = obj.optString("id", String.valueOf(i));
                String timeStr = obj.optString("time", "07:00");
                String mode = obj.optString("mode", "stop");
                int volume = obj.optInt("volume", 80);

                String[] parts = timeStr.split(":");
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);

                Calendar cal = Calendar.getInstance();
                cal.set(Calendar.HOUR_OF_DAY, hour);
                cal.set(Calendar.MINUTE, minute);
                cal.set(Calendar.SECOND, 0);
                cal.set(Calendar.MILLISECOND, 0);
                if (cal.getTimeInMillis() <= System.currentTimeMillis()) {{
                    cal.add(Calendar.DAY_OF_YEAR, 1);
                }}

                Intent intent = new Intent(context, MeoAlarmReceiver.class);
                intent.putExtra("alarmId", alarmId);
                intent.putExtra("time", timeStr);
                intent.putExtra("mode", mode);
                intent.putExtra("volume", volume);

                PendingIntent pendingIntent = PendingIntent.getBroadcast(
                    context, 7000 + slot, intent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                Intent showIntent = new Intent(context, MainActivity.class);
                showIntent.putExtra("ringingAlarmId", alarmId);
                PendingIntent showPi = PendingIntent.getActivity(
                    context, 8000 + slot, showIntent,
                    PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                );

                AlarmManager.AlarmClockInfo clockInfo = new AlarmManager.AlarmClockInfo(cal.getTimeInMillis(), showPi);
                alarmManager.setAlarmClock(clockInfo, pendingIntent);
                slot++;
            }}
        }} catch (Exception e) {{
            e.printStackTrace();
        }}
        scheduleRoutinesFromPrefs(context);
    }}

    public static void saveAndScheduleRoutines(Context context, String routinesJson, boolean meowOn, boolean vibrateOn) {{
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        prefs.edit()
            .putString("routines_json", routinesJson)
            .putBoolean("meow_on", meowOn)
            .putBoolean("vibrate_on", vibrateOn)
            .apply();
        scheduleRoutinesFromPrefs(context);
    }}

    public static void scheduleRoutinesFromPrefs(Context context) {{
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        String jsonStr = prefs.getString("routines_json", "[]");
        boolean meowOn = prefs.getBoolean("meow_on", true);
        boolean vibrateOn = prefs.getBoolean("vibrate_on", true);
        AlarmManager am = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (am == null) return;

        for (int i = 0; i < 250; i++) {{
            Intent ci = new Intent(context, MeoRoutineReceiver.class);
            PendingIntent pi = PendingIntent.getBroadcast(
                context, 20000 + i, ci,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE
            );
            if (pi != null) {{
                am.cancel(pi);
                pi.cancel();
            }}
        }}

        try {{
            JSONArray arr = new JSONArray(jsonStr);
            int[] offsets = new int[]{{60, 45, 30, 15, 0}};
            int slot = 0;
            long nowMs = System.currentTimeMillis();

            for (int i = 0; i < arr.length(); i++) {{
                JSONObject task = arr.getJSONObject(i);
                int jsDay = task.optInt("day", 0);
                int calDay = jsDay + 1;
                String name = task.optString("name", "Routine Task");
                String note = task.optString("note", "");
                String timeStr = task.optString("time", "09:00");
                String[] parts = timeStr.split(":");
                int hour = Integer.parseInt(parts[0]);
                int minute = Integer.parseInt(parts[1]);

                for (int off : offsets) {{
                    if (slot >= 250) break;
                    Calendar cal = Calendar.getInstance();
                    int todayCalDay = cal.get(Calendar.DAY_OF_WEEK);
                    int dayDiff = (calDay - todayCalDay + 7) % 7;
                    cal.add(Calendar.DAY_OF_YEAR, dayDiff);
                    cal.set(Calendar.HOUR_OF_DAY, hour);
                    cal.set(Calendar.MINUTE, minute - off);
                    cal.set(Calendar.SECOND, 0);
                    cal.set(Calendar.MILLISECOND, 0);

                    if (cal.getTimeInMillis() <= nowMs) {{
                        cal.add(Calendar.DAY_OF_YEAR, 7);
                    }}

                    String title = (off == 0)
                        ? "🐱 Meow! Starting now: " + name
                        : "🐱 Meow! " + off + "m left: " + name;
                    String body = !note.isEmpty()
                        ? note + " (" + timeStr + ")"
                        : "Scheduled at " + timeStr;

                    int reqCode = 20000 + slot;
                    Intent intent = new Intent(context, MeoRoutineReceiver.class);
                    intent.putExtra("title", title);
                    intent.putExtra("body", body);
                    intent.putExtra("notifId", reqCode);
                    intent.putExtra("meowOn", meowOn);
                    intent.putExtra("vibrateOn", vibrateOn);

                    PendingIntent pi = PendingIntent.getBroadcast(
                        context, reqCode, intent,
                        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
                    );

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES
