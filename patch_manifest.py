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

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {{
                        am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
                    }} else {{
                        am.setExact(AlarmManager.RTC_WAKEUP, cal.getTimeInMillis(), pi);
                    }}
                    slot++;
                }}
            }}
        }} catch (Exception e) {{
            e.printStackTrace();
        }}
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MeoAlarmScheduler.java"), "w", encoding="utf-8") as f:
        f.write(scheduler_java)

    receiver_java = f"""package {package_name};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.PowerManager;

public class MeoAlarmReceiver extends BroadcastReceiver {{
    @Override
    public void onReceive(Context context, Intent intent) {{
        PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
        if (pm != null) {{
            PowerManager.WakeLock wl = pm.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP | PowerManager.ON_AFTER_RELEASE,
                "MeoAlarm:WakeLock"
            );
            wl.acquire(20000);
        }}

        String alarmId = intent.getStringExtra("alarmId");
        String timeStr = intent.getStringExtra("time");
        String mode = intent.getStringExtra("mode");
        int volume = intent.getIntExtra("volume", 80);

        Intent serviceIntent = new Intent(context, MeoAlarmService.class);
        serviceIntent.putExtra("alarmId", alarmId);
        serviceIntent.putExtra("time", timeStr);
        serviceIntent.putExtra("mode", mode);
        serviceIntent.putExtra("volume", volume);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {{
            context.startForegroundService(serviceIntent);
        }} else {{
            context.startService(serviceIntent);
        }}

        Intent launchIntent = new Intent(context, MainActivity.class);
        launchIntent.addFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP |
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        );
        launchIntent.putExtra("ringingAlarmId", alarmId);
        try {{
            context.startActivity(launchIntent);
        }} catch (Exception ignored) {{}}

        MeoAlarmScheduler.scheduleFromPrefs(context);
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MeoAlarmReceiver.java"), "w", encoding="utf-8") as f:
        f.write(receiver_java)

    routine_receiver_java = f"""package {package_name};

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;
import android.media.AudioManager;
import android.os.Build;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;

public class MeoRoutineReceiver extends BroadcastReceiver {{
    @Override
    public void onReceive(Context context, Intent intent) {{
        String title = intent.getStringExtra("title");
        String body = intent.getStringExtra("body");
        int notifId = intent.getIntExtra("notifId", 50001);
        boolean meowOn = intent.getBooleanExtra("meowOn", true);
        boolean vibrateOn = intent.getBooleanExtra("vibrateOn", true);

        if (title == null) title = "🐱 MEO Routine Reminder";
        if (body == null) body = "Upcoming task reminder!";

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {{
            NotificationChannel ch = new NotificationChannel(
                "meo_native_routine_channel",
                "MEO 7-Day Routine Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            ch.setDescription("Background 7-day routine notifications with kitten meow");
            ch.enableVibration(vibrateOn);
            ch.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            nm.createNotificationChannel(ch);
        }}

        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pi = PendingIntent.getActivity(
            context, notifId, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, "meo_native_routine_channel")
            .setSmallIcon(android.R.drawable.ic_popup_reminder)
            .setContentTitle(title)
            .setContentText(body)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(pi)
            .setAutoCancel(true);

        if (nm != null) {{
            nm.notify(notifId, builder.build());
        }}

        if (vibrateOn) {{
            try {{
                Vibrator v = (Vibrator) context.getSystemService(Context.VIBRATOR_SERVICE);
                if (v != null && v.hasVibrator()) {{
                    long[] pat = new long[]{{0, 250, 120, 250}};
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {{
                        v.vibrate(VibrationEffect.createWaveform(pat, -1));
                    }} else {{
                        v.vibrate(pat, -1);
                    }}
                }}
            }} catch (Exception ignored) {{}}
        }}

        if (meowOn) {{
            new Thread(MeoRoutineReceiver::playNativeMeowSound).start();
        }}

        MeoAlarmScheduler.scheduleRoutinesFromPrefs(context);
    }}

    private static void playNativeMeowSound() {{
        try {{
            int sampleRate = 22050;
            int numSamples = (int) (sampleRate * 0.65);
            short[] buffer = new short[numSamples];
            double phase = 0.0;
            for (int i = 0; i < numSamples; i++) {{
                double t = (double) i / sampleRate;
                double freq;
                if (t < 0.18) {{
                    freq = 760 + (420 * (t / 0.18));
                }} else if (t < 0.42) {{
                    freq = 1180 - (300 * ((t - 0.18) / 0.24));
                }} else {{
                    freq = 880 - (260 * ((t - 0.42) / 0.23));
                }}
                double env = (t < 0.08) ? (t / 0.08) : Math.max(0.0, 1.0 - ((t - 0.08) / 0.57));
                phase += (2.0 * Math.PI * freq) / sampleRate;
                buffer[i] = (short) (Math.sin(phase) * 24000 * env);
            }}
            AudioTrack track = new AudioTrack(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build(),
                new AudioFormat.Builder()
                    .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                    .setSampleRate(sampleRate)
                    .setChannelMask(AudioFormat.CHANNEL_OUT_MONO)
                    .build(),
                buffer.length * 2,
                AudioTrack.MODE_STATIC,
                AudioManager.AUDIO_SESSION_ID_GENERATE
            );
            track.write(buffer, 0, buffer.length);
            track.play();
            Thread.sleep(750);
            track.release();
        }} catch (Exception ignored) {{}}
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MeoRoutineReceiver.java"), "w", encoding="utf-8") as f:
        f.write(routine_receiver_java)

    boot_java = f"""package {package_name};

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

public class MeoBootReceiver extends BroadcastReceiver {{
    @Override
    public void onReceive(Context context, Intent intent) {{
        MeoAlarmScheduler.scheduleFromPrefs(context);
        MeoAlarmScheduler.scheduleRoutinesFromPrefs(context);
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MeoBootReceiver.java"), "w", encoding="utf-8") as f:
        f.write(boot_java)

    service_java = f"""package {package_name};

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import androidx.core.app.NotificationCompat;
import java.io.File;

public class MeoAlarmService extends Service {{
    public static volatile boolean isServiceRinging = false;
    public static volatile String currentRingingAlarmId = null;

    private MediaPlayer mediaPlayer;
    private Vibrator vibrator;
    private Handler timeoutHandler;
    private PowerManager.WakeLock serviceWakeLock;

    @Override
    public IBinder onBind(Intent intent) {{
        return null;
    }}

    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {{
        if (intent != null && "STOP_ALARM".equals(intent.getAction())) {{
            stopSelf();
            return START_NOT_STICKY;
        }}

        String alarmId = intent != null ? intent.getStringExtra("alarmId") : "";
        String timeStr = intent != null ? intent.getStringExtra("time") : "";
        String mode = intent != null ? intent.getStringExtra("mode") : "stop";
        int volume = intent != null ? intent.getIntExtra("volume", 80) : 80;

        isServiceRinging = true;
        currentRingingAlarmId = alarmId;

        PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
        if (pm != null && (serviceWakeLock == null || !serviceWakeLock.isHeld())) {{
            serviceWakeLock = pm.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "MeoAlarm:ServiceWakeLock"
            );
            serviceWakeLock.acquire(6 * 60 * 1000L);
        }}

        createAlarmChannel();

        Intent fullScreenIntent = new Intent(this, MainActivity.class);
        fullScreenIntent.setFlags(
            Intent.FLAG_ACTIVITY_NEW_TASK |
            Intent.FLAG_ACTIVITY_CLEAR_TOP |
            Intent.FLAG_ACTIVITY_SINGLE_TOP |
            Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
        );
        fullScreenIntent.putExtra("ringingAlarmId", alarmId);

        PendingIntent fullScreenPendingIntent = PendingIntent.getActivity(
            this, 9001, fullScreenIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        Intent stopIntent = new Intent(this, MeoAlarmService.class);
        stopIntent.setAction("STOP_ALARM");
        PendingIntent stopPendingIntent = PendingIntent.getService(
            this, 9002, stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );

        String bodyText = "photo".equals(mode)
            ? "Scan target object (or hold 30s) to stop alarm!"
            : "Alarm ringing (" + timeStr + ") — Tap to open or Stop";

        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, "meo_native_ring_channel_v2")
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle("⏰ MEO ALARM RINGING")
            .setContentText(bodyText)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setFullScreenIntent(fullScreenPendingIntent, true)
            .setContentIntent(fullScreenPendingIntent)
            .setOngoing(true)
            .setAutoCancel(false);

        if (!"photo".equals(mode)) {{
            builder.addAction(android.R.drawable.ic_menu_close_clear_cancel, "STOP", stopPendingIntent);
        }}

        startForeground(9001, builder.build());

        try {{
            startActivity(fullScreenIntent);
        }} catch (Exception ignored) {{}}

        startAlarmAudioAndVibration(volume);

        long timeoutMs = "photo".equals(mode) ? 6 * 60 * 1000L : 1 * 60 * 1000L;
        if (timeoutHandler != null) timeoutHandler.removeCallbacksAndMessages(null);
        timeoutHandler = new Handler(Looper.getMainLooper());
        timeoutHandler.postDelayed(this::stopSelf, timeoutMs);

        return START_NOT_STICKY;
    }}

    private void startAlarmAudioAndVibration(int volumePercent) {{
        try {{
            if (mediaPlayer != null) {{
                mediaPlayer.release();
                mediaPlayer = null;
            }}

            AudioManager audioManager = (AudioManager) getSystemService(Context.AUDIO_SERVICE);
            if (audioManager != null) {{
                int maxVol = audioManager.getStreamMaxVolume(AudioManager.STREAM_ALARM);
                int targetVol = Math.max(1, Math.round((volumePercent / 100f) * maxVol));
                audioManager.setStreamVolume(AudioManager.STREAM_ALARM, targetVol, 0);
            }}

            mediaPlayer = new MediaPlayer();
            mediaPlayer.setAudioAttributes(
                new AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ALARM)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );

            SharedPreferences prefs = getSharedPreferences("MeoNativeAlarmPrefs", Context.MODE_PRIVATE);
            String savedUriStr = prefs.getString("custom_ringtone_uri", null);
            File customFile = new File(getFilesDir(), "custom_alarm_ringtone.audio");

            boolean sourceSet = false;
            if (customFile.exists() && customFile.length() > 0) {{
                try {{
                    mediaPlayer.setDataSource(customFile.getAbsolutePath());
                    sourceSet = true;
                }} catch (Exception ignored) {{}}
            }}
            if (!sourceSet && savedUriStr != null && !savedUriStr.isEmpty()) {{
                try {{
                    mediaPlayer.setDataSource(this, Uri.parse(savedUriStr));
                    sourceSet = true;
                }} catch (Exception ignored) {{}}
            }}
            if (!sourceSet) {{
                Uri alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM);
                if (alarmUri == null) alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);
                mediaPlayer.setDataSource(this, alarmUri);
            }}

            mediaPlayer.setLooping(true);
            mediaPlayer.prepare();
            mediaPlayer.start();
        }} catch (Exception e) {{
            e.printStackTrace();
        }}

        try {{
            vibrator = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
            if (vibrator != null && vibrator.hasVibrator()) {{
                long[] pattern = new long[]{{0, 600, 400, 600}};
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {{
                    vibrator.vibrate(VibrationEffect.createWaveform(pattern, 0));
                }} else {{
                    vibrator.vibrate(pattern, 0);
                }}
            }}
        }} catch (Exception ignored) {{}}
    }}

    private void createAlarmChannel() {{
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {{
            NotificationChannel channel = new NotificationChannel(
                "meo_native_ring_channel_v2",
                "MEO Full-Screen Ringing Alarm",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Wakes lock screen and rings alarm above lock screen");
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setBypassDnd(true);
            channel.setSound(null, null);
            NotificationManager nm = getSystemService(NotificationManager.class);
            if (nm != null) nm.createNotificationChannel(channel);
        }}
    }}

    @Override
    public void onDestroy() {{
        isServiceRinging = false;
        currentRingingAlarmId = null;
        if (serviceWakeLock != null && serviceWakeLock.isHeld()) {{
            try {{ serviceWakeLock.release(); }} catch (Exception ignored) {{}}
        }}
        if (timeoutHandler != null) {{
            timeoutHandler.removeCallbacksAndMessages(null);
        }}
        if (mediaPlayer != null) {{
            try {{
                if (mediaPlayer.isPlaying()) mediaPlayer.stop();
                mediaPlayer.release();
            }} catch (Exception ignored) {{}}
            mediaPlayer = null;
        }}
        if (vibrator != null) {{
            try {{ vibrator.cancel(); }} catch (Exception ignored) {{}}
        }}
        super.onDestroy();
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MeoAlarmService.java"), "w", encoding="utf-8") as f:
        f.write(service_java)

    main_activity_java = f"""package {package_name};

import android.Manifest;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.KeyguardManager;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.PowerManager;
import android.provider.Settings;
import android.util.Base64;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class MainActivity extends BridgeActivity {{
    private static final int REQ_RINGTONE_PICKER = 4041;

    private void enableLockScreenWakeup() {{
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {{
            setShowWhenLocked(true);
            setTurnScreenOn(true);
            KeyguardManager km = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            if (km != null && km.isKeyguardLocked()) {{
                km.requestDismissKeyguard(this, null);
            }}
        }}
        getWindow().addFlags(
            WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD |
            WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
            WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
            WindowManager.LayoutParams.FLAG_ALLOW_LOCK_WHILE_SCREEN_ON
        );
    }}

    @Override
    public void onCreate(Bundle savedInstanceState) {{
        enableLockScreenWakeup();
        super.onCreate(savedInstanceState);
        enableLockScreenWakeup();

        requestEssentialPermissions();

        MeoAlarmScheduler.scheduleFromPrefs(this);
        MeoAlarmScheduler.scheduleRoutinesFromPrefs(this);

        if (this.bridge != null && this.bridge.getWebView() != null) {{
            this.bridge.getWebView().getSettings().setMediaPlaybackRequiresUserGesture(false);
            this.bridge.getWebView().getSettings().setBlockNetworkLoads(true);
            this.bridge.getWebView().getSettings().setCacheMode(android.webkit.WebSettings.LOAD_CACHE_ELSE_NETWORK);
            this.bridge.getWebView().addJavascriptInterface(new MeoNativeBridge(), "MeoNativeAlarm");
            this.bridge.getWebView().setWebChromeClient(new WebChromeClient() {{
                @Override
                public void onPermissionRequest(final PermissionRequest request) {{
                    runOnUiThread(() -> request.grant(request.getResources()));
                }}
            }});
        }}
    }}

    @Override
    protected void onResume() {{
        super.onResume();
        enableLockScreenWakeup();
        dispatchRingingIdToWeb(getIntent());
    }}

    @Override
    protected void onNewIntent(Intent intent) {{
        super.onNewIntent(intent);
        setIntent(intent);
        enableLockScreenWakeup();
        dispatchRingingIdToWeb(intent);
    }}

    private void dispatchRingingIdToWeb(Intent intent) {{
        String ringingId = intent != null ? intent.getStringExtra("ringingAlarmId") : null;
        if (ringingId == null) ringingId = MeoAlarmService.currentRingingAlarmId;
        if (ringingId != null && this.bridge != null && this.bridge.getWebView() != null) {{
            final String targetId = ringingId;
            final String jsCall = "if (typeof triggerAlarm === 'function' && typeof alarms !== 'undefined') {{ const a = alarms.find(x => String(x.id) === '" + targetId + "'); if (a) triggerAlarm(a); }}";
            this.bridge.getWebView().postDelayed(() -> this.bridge.getWebView().evaluateJavascript(jsCall, null), 200);
        }}
    }}

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {{
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQ_RINGTONE_PICKER && resultCode == Activity.RESULT_OK && data != null) {{
            Uri uri = data.getParcelableExtra(RingtoneManager.EXTRA_RINGTONE_PICKED_URI);
            SharedPreferences prefs = getSharedPreferences("MeoNativeAlarmPrefs", Context.MODE_PRIVATE);
            File outFile = new File(getFilesDir(), "custom_alarm_ringtone.audio");
            if (uri == null) {{
                if (outFile.exists()) outFile.delete();
                prefs.edit().remove("custom_ringtone_uri").apply();
                notifyWebRingtoneSelected("Default Alarm");
            }} else {{
                prefs.edit().putString("custom_ringtone_uri", uri.toString()).apply();
                try (InputStream in = getContentResolver().openInputStream(uri);
                     FileOutputStream out = new FileOutputStream(outFile)) {{
                    if (in != null) {{
                        byte[] buf = new byte[8192];
                        int len;
                        while ((len = in.read(buf)) > 0) out.write(buf, 0, len);
                    }}
                }} catch (Exception ignored) {{}}
                String title = "Phone Ringtone";
                try {{
                    Ringtone rt = RingtoneManager.getRingtone(this, uri);
                    if (rt != null) title = rt.getTitle(this);
                }} catch (Exception ignored) {{}}
                notifyWebRingtoneSelected(title);
            }}
        }}
    }}

    private void notifyWebRingtoneSelected(String title) {{
        if (this.bridge != null && this.bridge.getWebView() != null) {{
            String safeTitle = title.replace("'", "\\'");
            String js = "if (typeof onNativeRingtonePicked === 'function') onNativeRingtonePicked('" + safeTitle + "');";
            this.bridge.getWebView().post(() -> this.bridge.getWebView().evaluateJavascript(js, null));
        }}
    }}

    private void requestEssentialPermissions() {{
        List<String> perms = new ArrayList<>();
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {{
            perms.add(Manifest.permission.CAMERA);
        }}
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {{
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {{
                perms.add(Manifest.permission.POST_NOTIFICATIONS);
            }}
        }}
        if (!perms.isEmpty()) {{
            ActivityCompat.requestPermissions(this, perms.toArray(new String[0]), 101);
        }}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {{
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null && !nm.canUseFullScreenIntent()) {{
                try {{
                    Intent i = new Intent(Settings.ACTION_MANAGE_APP_USE_FULL_SCREEN_INTENT);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                }} catch (Exception ignored) {{}}
            }}
        }}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {{
            AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
            if (am != null && !am.canScheduleExactAlarms()) {{
                try {{
                    Intent i = new Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                }} catch (Exception ignored) {{}}
            }}
        }}

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {{
            PowerManager pm = (PowerManager) getSystemService(Context.POWER_SERVICE);
            if (pm != null && !pm.isIgnoringBatteryOptimizations(getPackageName())) {{
                try {{
                    Intent i = new Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS);
                    i.setData(Uri.parse("package:" + getPackageName()));
                    startActivity(i);
                }} catch (Exception ignored) {{}}
            }}
        }}
    }}

    public class MeoNativeBridge {{
        @JavascriptInterface
        public void syncAlarms(String alarmsJson) {{
            MeoAlarmScheduler.saveAndScheduleAll(MainActivity.this, alarmsJson);
        }}

        @JavascriptInterface
        public void syncRoutines(String routinesJson, boolean meowOn, boolean vibrateOn) {{
            MeoAlarmScheduler.saveAndScheduleRoutines(MainActivity.this, routinesJson, meowOn, vibrateOn);
        }}

        @JavascriptInterface
        public void stopRinging() {{
            Intent stopIntent = new Intent(MainActivity.this, MeoAlarmService.class);
            stopIntent.setAction("STOP_ALARM");
            startService(stopIntent);
        }}

        @JavascriptInterface
        public boolean isRinging() {{
            return MeoAlarmService.isServiceRinging;
        }}

        @JavascriptInterface
        public String getRingingAlarmId() {{
            Intent i = getIntent();
            String id = i != null ? i.getStringExtra("ringingAlarmId") : null;
            return id != null ? id : MeoAlarmService.currentRingingAlarmId;
        }}

        @JavascriptInterface
        public void openNativeRingtonePicker() {{
            runOnUiThread(() -> {{
                Intent intent = new Intent(RingtoneManager.ACTION_RINGTONE_PICKER);
                intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TYPE, RingtoneManager.TYPE_ALL);
                intent.putExtra(RingtoneManager.EXTRA_RINGTONE_TITLE, "Select Alarm Ringtone");
                intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_DEFAULT, true);
                intent.putExtra(RingtoneManager.EXTRA_RINGTONE_SHOW_SILENT, false);
                SharedPreferences prefs = getSharedPreferences("MeoNativeAlarmPrefs", Context.MODE_PRIVATE);
                String existing = prefs.getString("custom_ringtone_uri", null);
                if (existing != null) {{
                    intent.putExtra(RingtoneManager.EXTRA_RINGTONE_EXISTING_URI, Uri.parse(existing));
                }}
                startActivityForResult(intent, REQ_RINGTONE_PICKER);
            }});
        }}

        @JavascriptInterface
        public void saveCustomRingtone(String base64Data, String fileName) {{
            try {{
                byte[] decoded = Base64.decode(base64Data, Base64.DEFAULT);
                File outFile = new File(getFilesDir(), "custom_alarm_ringtone.audio");
                try (FileOutputStream fos = new FileOutputStream(outFile)) {{
                    fos.write(decoded);
                }}
            }} catch (Exception e) {{
                e.printStackTrace();
            }}
        }}

        @JavascriptInterface
        public void clearCustomRingtone() {{
            try {{
                File outFile = new File(getFilesDir(), "custom_alarm_ringtone.audio");
                if (outFile.exists()) outFile.delete();
                SharedPreferences prefs = getSharedPreferences("MeoNativeAlarmPrefs", Context.MODE_PRIVATE);
                prefs.edit().remove("custom_ringtone_uri").apply();
            }} catch (Exception ignored) {{}}
        }}
    }}
}}
"""
    with open(os.path.join(java_pkg_dir, "MainActivity.java"), "w", encoding="utf-8") as f:
        f.write(main_activity_java)

    print("Native Android Alarm & Routine Engine Java classes generated successfully.")

mipmap_sizes = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

res_dir = "android/app/src/main/res"
if os.path.exists("assets/icon.png"):
    base_icon = Image.open("assets/icon.png").convert("RGBA")
    fg_icon = Image.open("assets/icon-foreground.png").convert("RGBA") if os.path.exists("assets/icon-foreground.png") else base_icon

    for folder, px in mipmap_sizes.items():
        target_dir = os.path.join(res_dir, folder)
        if os.path.exists(target_dir):
            resized = base_icon.resize((px, px), Image.LANCZOS)
            resized.save(os.path.join(target_dir, "ic_launcher.png"), "PNG")
            resized.save(os.path.join(target_dir, "ic_launcher_round.png"), "PNG")

            fg_px = int(px * 1.5)
            fg_resized = fg_icon.resize((fg_px, fg_px), Image.LANCZOS)
            fg_resized.save(os.path.join(target_dir, "ic_launcher_foreground.png"), "PNG")

    ic_bg_path = os.path.join(res_dir, "values", "ic_launcher_background.xml")
    os.makedirs(os.path.dirname(ic_bg_path), exist_ok=True)
    with open(ic_bg_path, "w", encoding="utf-8") as f:
        f.write('<?xml version="1.0" encoding="utf-8"?>\n<resources>\n    <color name="ic_launcher_background">#1E1B4B</color>\n</resources>\n')

    anydpi_dir = os.path.join(res_dir, "mipmap-anydpi-v26")
    os.makedirs(anydpi_dir, exist_ok=True)
    adaptive_xml = """<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
"""
    for xml_name in ("ic_launcher.xml", "ic_launcher_round.xml"):
        with open(os.path.join(anydpi_dir, xml_name), "w", encoding="utf-8") as f:
            f.write(adaptive_xml)

    print("Custom MEO Cat App Icon applied to all Android mipmap densities.")
