// --- 1. Bilingual Dictionary ---
const MAX_ALARMS = 12;
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const NORMAL_TIMEOUT_MS = 1 * 60 * 1000; // 1 minute max for Normal Stop alarm
const PHOTO_TIMEOUT_MS = 6 * 60 * 1000;  // 6 minutes max for Photo Verification alarm
const HOLD_BYPASS_SECONDS = 30;          // 30 seconds continuous long press to stop

const i18n = {
  en: {
    tabAlarm: "Alarm",
    tabRoutine: "7-Day Routine",
    newAlarmTitle: "Add New Alarm",
    selectTime: "Alarm Time",
    dismissModeLabel: "Alarm Dismiss Method",
    modeStopText: "Normal Stop (1m)",
    modePhotoText: "Object Photo (6m)",
    globalTargetLabel: "Global Target Photo",
    setInSettingsBtn: "Set in Settings",
    permObjTitle: "Permanent Target Object Photo",
    permObjDesc: "One saved object photo applies to all Photo-Verification alarms",
    captureTargetHint: "Capture Target Object",
    openCam: "Full Camera",
    uploadPhoto: "Choose Photo",
    saveObj: "Save Target Photo",
    noObjSaved: "No target photo saved yet",
    objSavedSuccess: "Target object saved (Active for all Photo alarms)",
    volumeLevel: "Alarm Volume (Low – High)",
    setAlarmBtn: "Add Alarm",
    maxLimitReached: "Maximum 12 alarms allowed. Delete an old alarm to add a new one.",
    activeAlarmsTitle: "Scheduled Alarms",
    notifTitle: "Routine Reminder Alerts",
    noSoundBadge: "Kitten Meow Alert",
    notifDesc: "Starting 1 hour before each task, MEO reminds you every 15 minutes (60m, 45m, 30m, 15m prior & on time) with a cute kitten meow & notification.",
    enableNotifBtn: "Enable Notifications",
    testMeowText: "Test Meow",
    notifEnabled: "Notifications active",
    notifBlocked: "Notification permission blocked in browser settings",
    routineFormTitle: "Add Task to 7-Day Routine",
    selectDay: "Select Day (Add multiple tasks per day)",
    daySat: "Saturday", daySun: "Sunday", dayMon: "Monday", dayTue: "Tuesday",
    dayWed: "Wednesday", dayThu: "Thursday", dayFri: "Friday",
    taskTimeLabel: "Task Time",
    taskNameLabel: "Task Title",
    taskNoteLabel: "Short Note (Shown in notification)",
    addRoutineBtn: "Add Task",
    weeklyScheduleTitle: "7-Day Schedule",
    settingsTitle: "Settings",
    permToneTitle: "Permanent Alarm Ringtone",
    permToneDesc: "Applies permanently to all alarms from your phone",
    meowSoundTitle: "Notification Kitten Sound",
    meowSoundDesc: "Play cute cat meow on routine alerts",
    vibrateTitle: "Notification Vibration",
    vibrateDesc: "Vibrate phone when alert arrives",
    timeFormatTitle: "Time Format",
    timeFormatDesc: "12-Hour (AM/PM) or 24-Hour",
    langSettingTitle: "Language",
    langSettingDesc: "English or বাংলা",
    themeSettingTitle: "Theme",
    themeSettingDesc: "Dark or Light appearance",
    doneBtn: "Save & Close",
    alarmRingingTitle: "ALARM RINGING",
    normalStopDesc: "Tap the button below to stop this alarm (auto-stops in 1 min).",
    stopAlarmBtn: "STOP ALARM",
    targetRefLabel: "Target Object",
    waitingScan: "Point camera at target object",
    scanVerifyBtn: "Scan Object",
    alertNoObj: "Please save a Target Object Photo in Settings first!",
    scanMatched: "Matched!",
    scanFailed: "Not Matched — Try Again",
    holdBypassIdle: "Can't scan? Hold 30s to Stop",
    snooze5Text: "Snooze 5m",
    noActiveAlarm: "No active alarm",
    nextAlarmIn: "Next alarm in"
  },
  bn: {
    tabAlarm: "অ্যালার্ম",
    tabRoutine: "৭ দিনের রুটিন",
    newAlarmTitle: "নতুন অ্যালার্ম যোগ করুন",
    selectTime: "অ্যালার্মের সময়",
    dismissModeLabel: "অ্যালার্ম বন্ধ করার মাধ্যম",
    modeStopText: "সাধারণ Stop (১ মিনিট)",
    modePhotoText: "বস্তুর ছবি (৬ মিনিট)",
    globalTargetLabel: "সেভ করা টার্গেট ছবি",
    setInSettingsBtn: "সেটিংসে যান",
    permObjTitle: "পার্মানেন্ট টার্গেট বস্তুর ছবি",
    permObjDesc: "এখানে ১টি ছবি সেভ করলে সব Photo অ্যালার্মেই এটি কাজ করবে",
    captureTargetHint: "টার্গেট বস্তুর ছবি তুলুন",
    openCam: "ফুল ক্যামেরা",
    uploadPhoto: "ছবি বাছুন",
    saveObj: "ছবি সেভ করুন",
    noObjSaved: "এখনো কোনো বস্তুর ছবি সেভ করা হয়নি",
    objSavedSuccess: "টার্গেট ছবি সেভ হয়েছে (সব Photo অ্যালার্মে চলবে)",
    volumeLevel: "অ্যালার্ম সাউন্ড (Low – High)",
    setAlarmBtn: "অ্যালার্ম যোগ করুন",
    maxLimitReached: "সর্বোচ্চ ১২টি অ্যালার্ম সেট করা যাবে। নতুন যোগ করতে আগের একটি ডিলিট করুন।",
    activeAlarmsTitle: "সেট করা অ্যালার্মসমূহ",
    notifTitle: "রুটিন রিমাইন্ডার নোটিফিকেশন",
    noSoundBadge: "বিড়ালছানার মিউ সাউন্ড",
    notifDesc: "প্রতিটি কাজের ১ ঘণ্টা আগে থেকে প্রতি ১৫ মিনিট পরপর (৬০, ৪৫, ৩০, ১৫ মিনিট আগে এবং ঠিক সময়ে) মিষ্টি বিড়ালছানার মিউ সাউন্ড ও নোটিফিকেশন পাবেন।",
    enableNotifBtn: "নোটিফিকেশন চালু করুন",
    testMeowText: "মিউ সাউন্ড শুনুন",
    notifEnabled: "নোটিফিকেশন চালু আছে",
    notifBlocked: "ব্রাউজার সেটিংস থেকে নোটিফিকেশন ব্লক করা আছে",
    routineFormTitle: "রুটিনে কাজ যোগ করুন",
    selectDay: "বার নির্বাচন করুন (একই দিনে একাধিক কাজ যোগ করা যাবে)",
    daySat: "শনিবার", daySun: "রবিবার", dayMon: "সোমবার", dayTue: "মঙ্গলবার",
    dayWed: "বুধবার", dayThu: "বৃহস্পতিবার", dayFri: "শুক্রবার",
    taskTimeLabel: "কাজের সময়",
    taskNameLabel: "কাজের নাম",
    taskNoteLabel: "শর্ট নোট (নোটিফিকেশনে দেখাবে)",
    addRoutineBtn: "কাজ যোগ করুন",
    weeklyScheduleTitle: "৭ দিনের রুটিন তালিকা",
    settingsTitle: "সেটিংস",
    permToneTitle: "পার্মানেন্ট অ্যালার্ম রিংটোন",
    permToneDesc: "ফোন থেকে একবার বাছলে সব অ্যালার্মে এটিই বাজবে",
    meowSoundTitle: "নোটিফিকেশন বিড়ালের সাউন্ড",
    meowSoundDesc: "রুটিন নোটিফিকেশনে বিড়ালছানার মিউ সাউন্ড বাজবে",
    vibrateTitle: "নোটিফিকেশন ভাইব্রেশন",
    vibrateDesc: "নোটিফিকেশন এলে ফোন ভাইব্রেট হবে",
    timeFormatTitle: "সময়ের ফরম্যাট",
    timeFormatDesc: "12-Hour (AM/PM) অথবা 24-Hour",
    langSettingTitle: "ভাষা (Language)",
    langSettingDesc: "English বা বাংলা",
    themeSettingTitle: "থিম (Theme)",
    themeSettingDesc: "Dark বা Light মোড",
    doneBtn: "সেভ করুন",
    alarmRingingTitle: "অ্যালার্ম বাজছে!",
    normalStopDesc: "অ্যালার্ম বন্ধ করতে নিচের বাটনে চাপুন (১ মিনিট পর নিজেই বন্ধ হবে)।",
    stopAlarmBtn: "STOP ALARM",
    targetRefLabel: "টার্গেট বস্তু",
    waitingScan: "ক্যামেরায় বস্তুটি দেখান",
    scanVerifyBtn: "স্ক্যান করুন",
    alertNoObj: "আগে Settings থেকে একটি টার্গেট বস্তুর ছবি সেভ করুন!",
    scanMatched: "Matched!",
    scanFailed: "মেলেনি — আবার চেষ্টা করুন",
    holdBypassIdle: "স্ক্যান না হলে ৩০ সেকেন্ড চেপে ধরুন",
    snooze5Text: "স্নুজ ৫মি",
    noActiveAlarm: "কোনো অ্যালার্ম চালু নেই",
    nextAlarmIn: "পরবর্তী অ্যালার্ম"
  }
};

let currentLang = localStorage.getItem('appLang') || 'en';
let currentTheme = localStorage.getItem('appTheme') || 'dark';
let timeFormat = localStorage.getItem('timeFormat') || '12';
let meowSoundEnabled = localStorage.getItem('meowSound') || 'on';
let vibrateEnabled = localStorage.getItem('vibratePref') || 'on';
let permanentRingtoneName = localStorage.getItem('permRingtoneName') || 'Default Chime';
let selectedDismissMode = 'stop';

// --- NATIVE TRUE ALARM ENGINE BRIDGE (RINGS EVEN WHEN APP IS KILLED & SCREEN IS OFF) ---
function syncRingtoneToNative(arrayBuffer, fileName) {
  if (!window.MeoNativeAlarm) return;
  try {
    if (!arrayBuffer) {
      window.MeoNativeAlarm.clearCustomRingtone();
      return;
    }
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
    }
    const base64 = btoa(binary);
    window.MeoNativeAlarm.saveCustomRingtone(base64, fileName || 'custom_ringtone.mp3');
  } catch (e) {}
}

function stopNativeRingingService() {
  if (window.MeoNativeAlarm && typeof window.MeoNativeAlarm.stopRinging === 'function') {
    try { window.MeoNativeAlarm.stopRinging(); } catch (e) {}
  }
}


// Reusable offscreen canvas & typed arrays
const sharedWorkCanvas = document.createElement('canvas');
sharedWorkCanvas.width = 64;
sharedWorkCanvas.height = 64;
const sharedWorkCtx = sharedWorkCanvas.getContext('2d', { willReadFrequently: true });
const hist1Buf = new Uint16Array(48);
const hist2Buf = new Uint16Array(48);

// --- 2. Safe System Notification Helper ---
function dispatchSystemNotification(title, body, requireInteraction = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, { body, silent: true, requireInteraction }).catch(() => {});
      });
    } else {
      new Notification(title, { body, silent: true, requireInteraction });
    }
  } catch (e) {}
}

// --- 3. Global Audio Unlocker & Screen Wake Lock ---
let audioCtx = null;
let wakeLock = null;
let pendingBlockedAudio = false;
let activeAudioPlayer = null;

function unlockAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  if (pendingBlockedAudio && activeAudioPlayer) {
    activeAudioPlayer.play().then(() => {
      pendingBlockedAudio = false;
    }).catch(() => {});
  }
}

document.addEventListener('pointerdown', unlockAudioContext, { passive: true });
document.addEventListener('keydown', unlockAudioContext, { passive: true });

async function requestScreenWakeLock() {
  try {
    if ('wakeLock' in navigator && !wakeLock) {
      wakeLock = await navigator.wakeLock.request('screen');
      wakeLock.addEventListener('release', () => { wakeLock = null; });
    }
  } catch (e) {}
}

function checkNativeRingingOnWake() {
  if (window.MeoNativeAlarm && typeof window.MeoNativeAlarm.getRingingAlarmId === 'function') {
    try {
      const ringingId = window.MeoNativeAlarm.getRingingAlarmId();
      if (ringingId) {
        const targetAlarm = alarms.find(a => String(a.id) === String(ringingId));
        if (targetAlarm && !activeAlarmId) {
          triggerAlarm(targetAlarm);
        }
      }
    } catch (e) {}
  }
}

function rehydrateOfflineScheduler() {
  requestScreenWakeLock();
  unlockAudioContext();
  checkNativeRingingOnWake();
  syncNativeAlarmsWithOS();
  tickScheduler(true);
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') rehydrateOfflineScheduler();
});
window.addEventListener('focus', rehydrateOfflineScheduler);
window.addEventListener('pageshow', rehydrateOfflineScheduler);
window.addEventListener('offline', () => syncNativeAlarmsWithOS());
window.addEventListener('online', () => syncNativeAlarmsWithOS());

// --- 4. Cute Baby Kitten "Meow" Synthesizer ---
function playCuteKittenMeow() {
  if (meowSoundEnabled !== 'on') return;
  unlockAudioContext();
  if (!audioCtx) return;

  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const subOsc = audioCtx.createOscillator();
  const filter = audioCtx.createBiquadFilter();
  const gain = audioCtx.createGain();

  osc.type = 'triangle';
  subOsc.type = 'sine';

  osc.frequency.setValueAtTime(760, now);
  osc.frequency.exponentialRampToValueAtTime(1180, now + 0.18);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.42);
  osc.frequency.exponentialRampToValueAtTime(620, now + 0.65);

  subOsc.frequency.setValueAtTime(1520, now);
  subOsc.frequency.exponentialRampToValueAtTime(2360, now + 0.18);
  subOsc.frequency.exponentialRampToValueAtTime(1240, now + 0.65);

  filter.type = 'bandpass';
  filter.Q.setValueAtTime(3.5, now);
  filter.frequency.setValueAtTime(1400, now);
  filter.frequency.linearRampToValueAtTime(1950, now + 0.2);
  filter.frequency.linearRampToValueAtTime(1100, now + 0.65);

  gain.gain.setValueAtTime(0.001, now);
  gain.gain.linearRampToValueAtTime(0.45, now + 0.08);
  gain.gain.linearRampToValueAtTime(0.38, now + 0.35);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.68);

  const subGain = audioCtx.createGain();
  subGain.gain.setValueAtTime(0.18, now);

  osc.connect(filter);
  subOsc.connect(subGain);
  subGain.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(now);
  subOsc.start(now);
  osc.stop(now + 0.7);
  subOsc.stop(now + 0.7);
}

function triggerPhoneVibration() {
  if (vibrateEnabled === 'on' && 'vibrate' in navigator) {
    try { navigator.vibrate([250, 120, 250]); } catch (e) {}
  }
}

document.getElementById('testMeowBtn').addEventListener('click', () => {
  if (meowSoundEnabled !== 'on') {
    alert(currentLang === 'bn' ? 'সেটিংসে বিড়ালের সাউন্ড Off করা আছে!' : 'Kitten sound is currently OFF in Settings!');
    return;
  }
  playCuteKittenMeow();
  triggerPhoneVibration();
});

// --- 5. In-App Routine Toast Banner & Snooze ---
const toastEl = document.getElementById('inAppRoutineToast');
let toastTimer = null;
let activeRoutineToastTask = null;
let snoozedRoutines = (JSON.parse(localStorage.getItem('snoozedRoutines') || '[]')).filter(s => s.fireAtMs > Date.now());

document.getElementById('closeToastBtn').addEventListener('click', () => toastEl.classList.add('hidden'));

function snoozeCurrentRoutine(mins) {
  toastEl.classList.add('hidden');
  if (!activeRoutineToastTask) return;
  const taskCopy = { ...activeRoutineToastTask };
  const fireAtMs = Date.now() + mins * 60 * 1000;
  snoozedRoutines.push({ id: Date.now(), task: taskCopy, fireAtMs });
  localStorage.setItem('snoozedRoutines', JSON.stringify(snoozedRoutines));

  if (NativeLocalNotifications) {
    NativeLocalNotifications.schedule({
      notifications: [{
        id: Math.floor(200000 + Math.random() * 200000),
        title: `🐱 Snoozed (${mins}m): ${taskCopy.name}`,
        body: taskCopy.note || `Reminder for ${formatDisplayTime(taskCopy.time)}`,
        schedule: { at: new Date(fireAtMs), allowWhileIdle: true },
        channelId: 'meo_alarm_channel'
      }]
    }).catch(() => {});
  }
  renderRoutines();
}

document.getElementById('snooze5Btn').addEventListener('click', () => snoozeCurrentRoutine(5));
document.getElementById('snooze10Btn').addEventListener('click', () => snoozeCurrentRoutine(10));

function showRoutineAlertBanner(title, body, taskObj = null) {
  activeRoutineToastTask = taskObj;
  document.getElementById('toastTitle').textContent = title;
  document.getElementById('toastMsg').textContent = body;
  toastEl.classList.remove('hidden');
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 20000);
}

// --- 6. Dismiss Mode Switcher ---
window.selectDismissMode = (mode) => {
  selectedDismissMode = mode;
  document.getElementById('modeStopBtn').classList.toggle('active', mode === 'stop');
  document.getElementById('modePhotoBtn').classList.toggle('active', mode === 'photo');
  document.getElementById('photoModeHintBox').classList.toggle('hidden', mode !== 'photo');
  syncTargetPhotoUI();
};

document.getElementById('goToSettingsPhotoBtn').addEventListener('click', () => {
  document.getElementById('settingsBtn').click();
});

// --- 7. IndexedDB ArrayBuffer Persistence for Permanent Global Ringtone ---
let db = null;
const dbReady = new Promise((resolve) => {
  try {
    const dbReq = indexedDB.open('MeoAlarmGlobalToneDB_V2', 1);
    dbReq.onupgradeneeded = (e) => e.target.result.createObjectStore('ringtones');
    dbReq.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    dbReq.onerror = () => resolve(null);
  } catch (e) {
    resolve(null);
  }
});

async function savePermanentRingtoneToDB(file) {
  if (file.size > MAX_AUDIO_BYTES) {
    alert(currentLang === 'bn' ? 'অডিও ফাইলটি ২৫ MB-এর ছোট হতে হবে।' : 'Please choose an audio file smaller than 25 MB.');
    return false;
  }
  const database = await dbReady;
  if (!database) return false;
  try {
    const buffer = await file.arrayBuffer();
    syncRingtoneToNative(buffer, file.name);
    const payload = { buffer, type: file.type || 'audio/mpeg', name: file.name };
    return new Promise((resolve) => {
      const tx = database.transaction('ringtones', 'readwrite');
      tx.objectStore('ringtones').put(payload, 'GLOBAL_RINGTONE');
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}

async function clearPermanentRingtoneFromDB() {
  syncRingtoneToNative(null, '');
  const database = await dbReady;
  if (!database) return false;
  return new Promise((resolve) => {
    const tx = database.transaction('ringtones', 'readwrite');
    tx.objectStore('ringtones').delete('GLOBAL_RINGTONE');
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => resolve(false);
  });
}

async function getPermanentRingtoneBlobFromDB() {
  const database = await dbReady;
  if (!database) return null;
  return new Promise((resolve) => {
    try {
      const tx = database.transaction('ringtones', 'readonly');
      const req = tx.objectStore('ringtones').get('GLOBAL_RINGTONE');
      req.onsuccess = () => {
        const data = req.result;
        if (data && data.buffer) {
          resolve(new Blob([data.buffer], { type: data.type }));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

// --- 8. Time Selectors & Formatters ---
function populateTimeSelectors() {
  const builders = [
    { h: document.getElementById('alarmHour'), m: document.getElementById('alarmMinute'), ap: document.getElementById('alarmAmPm'), wrap: document.getElementById('alarmTimeBuilder'), defH: 7, defM: 0 },
    { h: document.getElementById('taskHour'), m: document.getElementById('taskMinute'), ap: document.getElementById('taskAmPm'), wrap: document.getElementById('taskTimeBuilder'), defH: 9, defM: 0 }
  ];

  builders.forEach(b => {
    const hFrag = document.createDocumentFragment();
    const mFrag = document.createDocumentFragment();

    if (timeFormat === '12') {
      b.wrap.classList.remove('mode-24');
      b.ap.hidden = false;
      for (let i = 1; i <= 12; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        if (i === b.defH) opt.selected = true;
        hFrag.appendChild(opt);
      }
    } else {
      b.wrap.classList.add('mode-24');
      b.ap.hidden = true;
      for (let i = 0; i < 24; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = String(i).padStart(2, '0');
        if (i === b.defH) opt.selected = true;
        hFrag.appendChild(opt);
      }
    }
    for (let m = 0; m < 60; m++) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = String(m).padStart(2, '0');
      if (m === b.defM) opt.selected = true;
      mFrag.appendChild(opt);
    }

    b.h.innerHTML = '';
    b.m.innerHTML = '';
    b.h.appendChild(hFrag);
    b.m.appendChild(mFrag);
  });
}

function getSelected24Time(hourId, minId, ampmId) {
  let h = parseInt(document.getElementById(hourId).value);
  const m = parseInt(document.getElementById(minId).value);
  if (timeFormat === '12') {
    const ap = document.getElementById(ampmId).value;
    if (ap === 'PM' && h < 12) h += 12;
    if (ap === 'AM' && h === 12) h = 0;
  }
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDisplayTime(hhmm24) {
  const [hStr, mStr] = hhmm24.split(':');
  let h = parseInt(hStr);
  if (timeFormat === '24') return `${String(h).padStart(2, '0')}:${mStr}`;
  const ap = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${mStr} ${ap}`;
}

// --- 9. Settings, Theme & Language ---
function applyLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('appLang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (i18n[lang][key]) {
      el.textContent = i18n[lang][key];
    }
  });
  document.getElementById('selectedAudioName').textContent = permanentRingtoneName;
  syncTargetPhotoUI();
  lastRenderedDateStr = '';
  renderAlarms();
  renderRoutines();
  tickScheduler(true);
}

function applyTheme(theme) {
  currentTheme = theme;
  localStorage.setItem('appTheme', theme);
  document.body.classList.toggle('dark-mode', theme === 'dark');
  document.getElementById('themeSelect').value = theme;
}

const settingsModal = document.getElementById('settingsModal');
document.getElementById('settingsBtn').addEventListener('click', () => {
  document.getElementById('selectedAudioName').textContent = permanentRingtoneName;
  document.getElementById('meowSoundSelect').value = meowSoundEnabled;
  document.getElementById('vibrateSelect').value = vibrateEnabled;
  document.getElementById('timeFormatSelect').value = timeFormat;
  document.getElementById('languageSelect').value = currentLang;
  document.getElementById('themeSelect').value = currentTheme;
  syncTargetPhotoUI();
  settingsModal.classList.remove('hidden');
});

document.getElementById('closeSettingsBtn').addEventListener('click', () => {
  stopAlarmSound();
  settingsModal.classList.add('hidden');
});
document.getElementById('doneSettingsBtn').addEventListener('click', () => {
  stopAlarmSound();
  settingsModal.classList.add('hidden');
});

document.getElementById('meowSoundSelect').addEventListener('change', (e) => {
  meowSoundEnabled = e.target.value;
  localStorage.setItem('meowSound', meowSoundEnabled);
  syncNativeAlarmsWithOS();
});
document.getElementById('vibrateSelect').addEventListener('change', (e) => {
  vibrateEnabled = e.target.value;
  localStorage.setItem('vibratePref', vibrateEnabled);
  syncNativeAlarmsWithOS();
});
document.getElementById('timeFormatSelect').addEventListener('change', (e) => {
  timeFormat = e.target.value;
  localStorage.setItem('timeFormat', timeFormat);
  populateTimeSelectors();
  renderAlarms();
  renderRoutines();
  tickScheduler(true);
});
document.getElementById('languageSelect').addEventListener('change', (e) => applyLanguage(e.target.value));
document.getElementById('themeSelect').addEventListener('change', (e) => applyTheme(e.target.value));
document.getElementById('themeToggle').addEventListener('click', () => applyTheme(currentTheme === 'dark' ? 'light' : 'dark'));

window.switchTab = (tabId, btn) => {
  document.querySelectorAll('.tab-view').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(tabId).classList.remove('hidden');
  btn.classList.add('active');
};

// --- 10. Anti-Hang Second-Gated Clock & Web Worker Heartbeat ---
let lastRenderedSecond = -1;
let lastRenderedDateStr = '';
const liveTimeEl = document.getElementById('liveTime');
const liveDateEl = document.getElementById('liveDate');


let lastOngoingCountdownMin = -1;

function getClosestUpcomingAlarm(now) {
  const activeList = alarms.filter(a => a.active);
  if (activeList.length === 0) return null;

  let minDiffMs = Infinity;
  let nextAlarm = null;
  let nextDate = null;

  activeList.forEach(a => {
    const [h, m] = a.time.split(':').map(Number);
    const candidate = new Date(now);
    candidate.setHours(h, m, 0, 0);
    if (candidate <= now) {
      candidate.setDate(candidate.getDate() + 1);
    }
    const diff = candidate.getTime() - now.getTime();
    if (diff < minDiffMs) {
      minDiffMs = diff;
      nextAlarm = a;
      nextDate = candidate;
    }
  });

  return { alarm: nextAlarm, targetDate: nextDate, diffMs: minDiffMs };
}

function formatCountdownText(diffMs) {
  const totalSec = Math.max(0, Math.floor(diffMs / 1000));
  const hrs = Math.floor(totalSec / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  if (currentLang === 'bn') {
    if (hrs > 0) return `${hrs} ঘণ্টা ${mins} মিনিট বাকি`;
    if (mins > 0) return `${mins} মিনিট ${secs} সেকেন্ড বাকি`;
    return `${secs} সেকেন্ড বাকি`;
  } else {
    if (hrs > 0) return `${hrs}h ${mins}m`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  }
}

function updateNextAlarmCountdownUI(now) {
  const el = document.getElementById('nextAlarmCountdown');
  if (!el) return;
  const upcoming = getClosestUpcomingAlarm(now);
  if (!upcoming) {
    el.textContent = `⏳ ${i18n[currentLang].noActiveAlarm}`;
    cancelOngoingCountdownNotification();
    return;
  }

  const timeLabel = formatDisplayTime(upcoming.alarm.time);
  const cdText = formatCountdownText(upcoming.diffMs);
  el.textContent = currentLang === 'bn'
    ? `⏰ পরবর্তী অ্যালার্ম (${timeLabel}) — ${cdText}`
    : `⏰ ${i18n.en.nextAlarmIn} ${cdText} (${timeLabel})`;

  // Update persistent/ongoing notification once per minute so user sees countdown in notification shade
  const curMin = now.getHours() * 60 + now.getMinutes();
  if (curMin !== lastOngoingCountdownMin) {
    lastOngoingCountdownMin = curMin;
    const totalMins = Math.ceil(upcoming.diffMs / 60000);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    const shortCd = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    updateOngoingCountdownNotification(timeLabel, shortCd);
  }
}

async function updateOngoingCountdownNotification(timeLabel, shortCd) {
  const title = `⏰ MEO Alarm: ${timeLabel}`;
  const body = currentLang === 'bn'
    ? `পরবর্তী অ্যালার্ম বাজতে ${shortCd} বাকি আছে`
    : `Next alarm in ${shortCd}`;

  if (NativeLocalNotifications) {
    try {
      await NativeLocalNotifications.schedule({
        notifications: [{
          id: 999999,
          title,
          body,
          ongoing: true,
          autoCancel: false,
          channelId: 'meo_countdown_channel'
        }]
      });
    } catch (e) {}
  }
}

async function cancelOngoingCountdownNotification() {
  if (NativeLocalNotifications) {
    try {
      await NativeLocalNotifications.cancel({ notifications: [{ id: 999999 }] });
    } catch (e) {}
  }
}

function tickScheduler(force = false) {
  const now = new Date();
  const currentSec = now.getSeconds();
  if (!force && currentSec === lastRenderedSecond) return;
  lastRenderedSecond = currentSec;

  const h24 = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(currentSec).padStart(2, '0');

  if (timeFormat === '12') {
    const ap = h24 >= 12 ? 'PM' : 'AM';
    const h12 = String(h24 % 12 || 12).padStart(2, '0');
    liveTimeEl.textContent = `${h12}:${m}:${s} ${ap}`;
  } else {
    liveTimeEl.textContent = `${String(h24).padStart(2, '0')}:${m}:${s}`;
  }

  const todayStamp = now.toDateString();
  if (todayStamp !== lastRenderedDateStr) {
    lastRenderedDateStr = todayStamp;
    triggeredAlarmMinutes = {};
    sentNotifications = {};
    const locale = currentLang === 'bn' ? 'bn-BD' : 'en-US';
    liveDateEl.textContent = now.toLocaleDateString(locale, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  updateNextAlarmCountdownUI(now);
  checkAlarms(now);
  checkRoutineNotifications(now);
}

try {
  const workerBlob = new Blob([`setInterval(() => postMessage(1), 500);`], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(workerBlob);
  const clockWorker = new Worker(workerUrl);
  URL.revokeObjectURL(workerUrl);
  clockWorker.onmessage = () => tickScheduler(false);
} catch (e) {
  setInterval(() => tickScheduler(false), 500);
}

// --- 11. Permanent Global Ringtone Audio Engine (Settings Only) ---
let fallbackInterval = null;
let currentAudioObjectUrl = null;
let previewTimeout = null;
let isStartingAudio = false;

window.onNativeRingtonePicked = (title) => {
  permanentRingtoneName = title || 'Default Alarm';
  localStorage.setItem('permRingtoneName', permanentRingtoneName);
  document.getElementById('selectedAudioName').textContent = permanentRingtoneName;
  renderAlarms();
};

const phoneAudioInput = document.getElementById('phoneAudioInput');
document.getElementById('pickPhoneAudioBtn').addEventListener('click', () => {
  if (window.MeoNativeAlarm && typeof window.MeoNativeAlarm.openNativeRingtonePicker === 'function') {
    window.MeoNativeAlarm.openNativeRingtonePicker();
  } else {
    phoneAudioInput.click();
  }
});
phoneAudioInput.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const saved = await savePermanentRingtoneToDB(file);
  if (saved) {
    permanentRingtoneName = file.name;
    localStorage.setItem('permRingtoneName', permanentRingtoneName);
    document.getElementById('selectedAudioName').textContent = permanentRingtoneName;
    renderAlarms();
  }
  e.target.value = '';
});

document.getElementById('resetToneBtn').addEventListener('click', async () => {
  stopAlarmSound();
  await clearPermanentRingtoneFromDB();
  permanentRingtoneName = 'Default Chime';
  localStorage.setItem('permRingtoneName', permanentRingtoneName);
  document.getElementById('selectedAudioName').textContent = permanentRingtoneName;
  renderAlarms();
});

function playDefaultSoftChime(volPercent) {
  unlockAudioContext();
  if (!audioCtx) return;
  const level = Math.max(0.05, Math.min(1, (volPercent || 80) / 100));
  const notes = [523.25, 659.25, 783.99, 1046.50];
  notes.forEach((f, idx) => {
    setTimeout(() => {
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, audioCtx.currentTime);
      g.gain.setValueAtTime(level * 0.7, audioCtx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.65);
      osc.connect(g); g.connect(audioCtx.destination);
      osc.start(); osc.stop(audioCtx.currentTime + 0.65);
    }, idx * 240);
  });
}

function stopAlarmSound() {
  pendingBlockedAudio = false;
  isStartingAudio = false;
  if (previewTimeout) {
    clearTimeout(previewTimeout);
    previewTimeout = null;
  }
  if (activeAudioPlayer) {
    activeAudioPlayer.pause();
    activeAudioPlayer.currentTime = 0;
    activeAudioPlayer = null;
  }
  if (currentAudioObjectUrl) {
    URL.revokeObjectURL(currentAudioObjectUrl);
    currentAudioObjectUrl = null;
  }
  if (fallbackInterval) {
    clearInterval(fallbackInterval);
    fallbackInterval = null;
  }
}

async function startGlobalAlarmSound(volPercent = 80, loop = true) {
  if (isStartingAudio) return;
  isStartingAudio = true;
  stopAlarmSound();

  const clampedVol = Math.max(0.05, Math.min(1, (volPercent || 80) / 100));
  const storedBlob = await getPermanentRingtoneBlobFromDB();
  isStartingAudio = false;

  if (storedBlob) {
    currentAudioObjectUrl = URL.createObjectURL(storedBlob);
    activeAudioPlayer = new Audio(currentAudioObjectUrl);
    activeAudioPlayer.volume = clampedVol;
    activeAudioPlayer.loop = loop;
    activeAudioPlayer.play().catch(() => {
      pendingBlockedAudio = true;
      playDefaultSoftChime(volPercent);
      if (loop) fallbackInterval = setInterval(() => playDefaultSoftChime(volPercent), 1800);
    });
  } else {
    playDefaultSoftChime(volPercent);
    if (loop) fallbackInterval = setInterval(() => playDefaultSoftChime(volPercent), 1800);
  }
}

document.getElementById('previewToneBtn').addEventListener('click', async () => {
  const vol = parseInt(document.getElementById('volumeSlider').value);
  if (activeAudioPlayer || fallbackInterval) return stopAlarmSound();
  await startGlobalAlarmSound(vol, false);
  previewTimeout = setTimeout(() => stopAlarmSound(), 5000);
});

// --- 12. Global Target Object Photo Setup (In Settings, Full-Screen Camera Capture) ---
const setupVideo = document.getElementById('setupVideo');
const savedRefImg = document.getElementById('savedRefImg');
const setupFullScreenCam = document.getElementById('setupFullScreenCam');
let setupStream = null;
let referenceImageData = localStorage.getItem('refObjectPhoto') || null;

function syncTargetPhotoUI() {
  const alarmThumb = document.getElementById('alarmTabRefThumb');
  const alarmStatus = document.getElementById('alarmTabRefStatus');
  const settingsStatus = document.getElementById('refStatus');

  if (referenceImageData) {
    savedRefImg.src = referenceImageData;
    savedRefImg.hidden = false;
    settingsStatus.style.color = 'var(--green)';
    settingsStatus.textContent = i18n[currentLang].objSavedSuccess;

    if (alarmThumb) {
      alarmThumb.src = referenceImageData;
      alarmThumb.style.display = 'block';
    }
    if (alarmStatus) {
      alarmStatus.style.color = 'var(--green)';
      alarmStatus.textContent = i18n[currentLang].objSavedSuccess;
    }
  } else {
    savedRefImg.hidden = true;
    settingsStatus.style.color = '#ef4444';
    settingsStatus.textContent = i18n[currentLang].noObjSaved;

    if (alarmThumb) alarmThumb.style.display = 'none';
    if (alarmStatus) {
      alarmStatus.style.color = '#ef4444';
      alarmStatus.textContent = i18n[currentLang].noObjSaved;
    }
  }
}

function closeFullScreenSetupCamera() {
  setupFullScreenCam.classList.add('hidden');
  if (setupStream) {
    setupStream.getTracks().forEach(t => t.stop());
    setupStream = null;
  }
}

document.getElementById('openSetupCamBtn').addEventListener('click', async () => {
  try {
    if (setupStream) setupStream.getTracks().forEach(t => t.stop());
    setupStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    setupVideo.srcObject = setupStream;
    await setupVideo.play();
    setupFullScreenCam.classList.remove('hidden');
  } catch (e) {
    alert('Camera permission denied or unavailable. Use "Choose Photo" instead.');
  }
});

document.getElementById('closeSetupCamBtn').addEventListener('click', closeFullScreenSetupCamera);



function captureFastSample(videoEl) {
  const vw = videoEl.videoWidth || 320;
  const vh = videoEl.videoHeight || 240;
  const s = Math.min(vw, vh);
  sharedWorkCtx.drawImage(videoEl, (vw - s) / 2, (vh - s) / 2, s, s, 0, 0, 64, 64);
  return sharedWorkCanvas;
}

function lockReferenceDataUrl(dataUrl) {
  referenceImageData = dataUrl;
  localStorage.setItem('refObjectPhoto', referenceImageData);
  closeFullScreenSetupCamera();
  syncTargetPhotoUI();
}

document.getElementById('captureRefBtn').addEventListener('click', () => {
  if (setupVideo.readyState < 2) return;
  lockReferenceDataUrl(captureFastSample(setupVideo).toDataURL('image/jpeg', 0.85));
});

// --- 13. Alarms CRUD (Max 12 Alarms, Uses Global Target Photo & Ringtone) ---
let alarms = JSON.parse(localStorage.getItem('alarms')) || [];
let activeAlarmId = null;
let triggeredAlarmMinutes = {};
let alarmAutoStopTimer = null;

const volumeSlider = document.getElementById('volumeSlider');
volumeSlider.addEventListener('input', () => {
  const val = parseInt(volumeSlider.value);
  document.getElementById('volLabel').textContent = `${val}%`;
  if (activeAudioPlayer) {
    activeAudioPlayer.volume = Math.max(0.05, Math.min(1, val / 100));
  }
});

function updateAlarmLimitUI() {
  const count = alarms.length;
  const addBtn = document.getElementById('addAlarmBtn');
  const limitNote = document.getElementById('alarmLimitNote');
  const topBadge = document.getElementById('alarmCountBadge');
  const listCounter = document.getElementById('alarmListCounter');

  if (topBadge) topBadge.textContent = `${count} / ${MAX_ALARMS}`;
  if (listCounter) listCounter.textContent = `${count} / ${MAX_ALARMS}`;

  if (count >= MAX_ALARMS) {
    addBtn.disabled = true;
    addBtn.style.opacity = '0.5';
    addBtn.style.cursor = 'not-allowed';
    limitNote.style.display = 'block';
    limitNote.textContent = i18n[currentLang].maxLimitReached;
  } else {
    addBtn.disabled = false;
    addBtn.style.opacity = '1';
    addBtn.style.cursor = 'pointer';
    limitNote.style.display = 'none';
  }
}

document.getElementById('addAlarmBtn').addEventListener('click', () => {
  if (alarms.length >= MAX_ALARMS) {
    return alert(i18n[currentLang].maxLimitReached);
  }
  if (selectedDismissMode === 'photo' && !referenceImageData) {
    alert(i18n[currentLang].alertNoObj);
    document.getElementById('settingsBtn').click();
    return;
  }
  requestScreenWakeLock();
  const time24 = getSelected24Time('alarmHour', 'alarmMinute', 'alarmAmPm');

  alarms.push({
    id: String(Date.now()),
    time: time24,
    mode: selectedDismissMode,
    volume: parseInt(volumeSlider.value),
    active: true
  });
  localStorage.setItem('alarms', JSON.stringify(alarms));
  syncNativeAlarmsWithOS();
  renderAlarms();
});

function renderAlarms() {
  const list = document.getElementById('alarmList');
  const frag = document.createDocumentFragment();
  alarms.forEach(alarm => {
    const modeBadge = alarm.mode === 'photo'
      ? (currentLang === 'bn' ? '📷 ছবি (৬ মিনিট)' : '📷 Photo (6m)')
      : (currentLang === 'bn' ? '⏹ Stop (১ মিনিট)' : '⏹ Stop (1m)');

    const li = document.createElement('li');
    li.className = 'item-row';
    li.innerHTML = `
      <div>
        <div class="item-time">${formatDisplayTime(alarm.time)} <span class="mode-tag">${modeBadge}</span></div>
        <div class="item-meta">🎵 ${permanentRingtoneName} • ${alarm.volume}%</div>
      </div>
      <div style="display:flex; align-items:center; gap:10px;">
        <button type="button" class="btn btn-soft" style="padding:6px 10px; font-size:0.75rem;" onclick="testAlarm('${alarm.id}')">Test</button>
        <input type="checkbox" ${alarm.active ? 'checked' : ''} onchange="toggleAlarm('${alarm.id}')" />
        <button type="button" class="trash-btn" onclick="deleteAlarm('${alarm.id}')">✕</button>
      </div>
    `;
    frag.appendChild(li);
  });
  list.innerHTML = '';
  list.appendChild(frag);
  updateAlarmLimitUI();
}

window.testAlarm = (id) => {
  const alarm = alarms.find(a => a.id === id);
  if (alarm) triggerAlarm(alarm);
};

window.toggleAlarm = (id) => {
  alarms = alarms.map(a => a.id === id ? { ...a, active: !a.active } : a);
  localStorage.setItem('alarms', JSON.stringify(alarms));
  syncNativeAlarmsWithOS();
  renderAlarms();
};

window.deleteAlarm = (id) => {
  alarms = alarms.filter(a => a.id !== id);
  localStorage.setItem('alarms', JSON.stringify(alarms));
  syncNativeAlarmsWithOS();
  renderAlarms();
};

// --- 14. Midnight-Safe Alarm Trigger + 1m / 6m Auto-Timeout ---
let missionStream = null;
let ringVibrationInterval = null;

function checkAlarms(now) {
  if (activeAlarmId) return;
  const nowTotalMins = now.getHours() * 60 + now.getMinutes();
  const dateStamp = now.toDateString();

  alarms.forEach(alarm => {
    if (!alarm.active) return;
    const [aH, aM] = alarm.time.split(':').map(Number);
    const alarmTotalMins = aH * 60 + aM;
    const diff = (nowTotalMins - alarmTotalMins + 1440) % 1440;
    const key = `${alarm.id}_${dateStamp}_${alarm.time}`;

    if ((diff === 0 || diff === 1) && !triggeredAlarmMinutes[key]) {
      triggeredAlarmMinutes[key] = true;
      triggerAlarm(alarm);
    }
  });
}

async function triggerAlarm(alarm) {
  if (activeAlarmId === alarm.id) return;
  activeAlarmId = alarm.id;
  setTimeout(() => syncNativeAlarmsWithOS(), 1500);
  requestScreenWakeLock();

  if (alarmAutoStopTimer) {
    clearTimeout(alarmAutoStopTimer);
    alarmAutoStopTimer = null;
  }

  dispatchSystemNotification(
    '⏰ MEO ALARM RINGING',
    alarm.mode === 'photo'
      ? 'Scan your target object (or hold 30s) to turn off the alarm!'
      : `Alarm for ${formatDisplayTime(alarm.time)} is ringing!`,
    true
  );

  const isNativeRinging = window.MeoNativeAlarm && typeof window.MeoNativeAlarm.isRinging === 'function' && window.MeoNativeAlarm.isRinging();
  if (!isNativeRinging) {
    startGlobalAlarmSound(alarm.volume, true);
  }
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([500, 300, 500]);
      ringVibrationInterval = setInterval(() => navigator.vibrate([500, 300, 500]), 1500);
    } catch (e) {}
  }

  if (alarm.mode === 'photo' && referenceImageData) {
    // Photo verification alarm: 6 minutes max auto-timeout
    alarmAutoStopTimer = setTimeout(() => {
      dismissActiveAlarm();
    }, PHOTO_TIMEOUT_MS);

    resetEmergencyHoldState();
    document.getElementById('normalRingingModal').classList.add('hidden');
    document.getElementById('photoMissionFullScreen').classList.remove('hidden');
    document.getElementById('targetPreview').src = referenceImageData;
    document.getElementById('photoRingingTime').textContent = formatDisplayTime(alarm.time);

    const feedback = document.getElementById('matchFeedback');
    feedback.className = 'compact-status-badge';
    feedback.textContent = i18n[currentLang].waitingScan;

    try {
      if (missionStream) missionStream.getTracks().forEach(t => t.stop());
      missionStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 480 }, height: { ideal: 360 } }
      });
      const mv = document.getElementById('missionVideo');
      mv.srcObject = missionStream;
      await mv.play();
    } catch (e) {}
  } else {
    // Normal stop alarm: 1 minute max auto-timeout
    alarmAutoStopTimer = setTimeout(() => {
      dismissActiveAlarm();
    }, NORMAL_TIMEOUT_MS);

    document.getElementById('photoMissionFullScreen').classList.add('hidden');
    document.getElementById('normalRingingModal').classList.remove('hidden');
    document.getElementById('normalRingingTime').textContent = formatDisplayTime(alarm.time);
  }
}

function dismissActiveAlarm() {
  stopNativeRingingService();
  stopAlarmSound();
  resetEmergencyHoldState();
  if (alarmAutoStopTimer) {
    clearTimeout(alarmAutoStopTimer);
    alarmAutoStopTimer = null;
  }
  if (ringVibrationInterval) {
    clearInterval(ringVibrationInterval);
    ringVibrationInterval = null;
  }
  if ('vibrate' in navigator) {
    try { navigator.vibrate(0); } catch (e) {}
  }
  if (missionStream) {
    missionStream.getTracks().forEach(t => t.stop());
    missionStream = null;
  }

  document.getElementById('normalRingingModal').classList.add('hidden');
  document.getElementById('photoMissionFullScreen').classList.add('hidden');
  if (activeAlarmId && String(activeAlarmId).startsWith('snooze_')) {
    alarms = alarms.filter(a => a.id !== activeAlarmId);
    localStorage.setItem('alarms', JSON.stringify(alarms));
    syncNativeAlarmsWithOS();
    renderAlarms();
  }
  activeAlarmId = null;
}

document.getElementById('normalStopBtn').addEventListener('click', dismissActiveAlarm);

document.getElementById('alarmSnooze5Btn').addEventListener('click', () => {
  const currentAlarm = alarms.find(a => a.id === activeAlarmId);
  dismissActiveAlarm();
  if (!currentAlarm) return;
  const snoozeDate = new Date(Date.now() + 5 * 60 * 1000);
  const sH = String(snoozeDate.getHours()).padStart(2, '0');
  const sM = String(snoozeDate.getMinutes()).padStart(2, '0');
  const snoozeTime24 = `${sH}:${sM}`;

  // Add a temporary one-time snoozed alarm
  const snoozeId = 'snooze_' + Date.now();
  alarms.push({
    id: snoozeId,
    time: snoozeTime24,
    mode: currentAlarm.mode,
    volume: currentAlarm.volume,
    active: true,
    isSnooze: true
  });
  localStorage.setItem('alarms', JSON.stringify(alarms));
  syncNativeAlarmsWithOS();
  renderAlarms();
  tickScheduler(true);
});


// --- 14B. 30-Second Continuous Long-Press Emergency Bypass (Photo Alarm Only) ---
const emergencyHoldBtn = document.getElementById('emergencyHoldBtn');
const holdProgressFill = document.getElementById('holdProgressFill');
const holdBtnLabel = document.getElementById('holdBtnLabel');
let holdAnimFrame = null;
let holdStartTimestamp = 0;

function resetEmergencyHoldState() {
  if (holdAnimFrame) {
    cancelAnimationFrame(holdAnimFrame);
    holdAnimFrame = null;
  }
  holdStartTimestamp = 0;
  if (holdProgressFill) holdProgressFill.style.width = '0%';
  if (holdBtnLabel) holdBtnLabel.textContent = i18n[currentLang].holdBypassIdle;
}

function stepHoldBypass(nowTs) {
  if (!holdStartTimestamp) return;
  const elapsedSec = (nowTs - holdStartTimestamp) / 1000;
  const pct = Math.min(100, (elapsedSec / HOLD_BYPASS_SECONDS) * 100);
  holdProgressFill.style.width = `${pct}%`;

  const remaining = Math.max(0, Math.ceil(HOLD_BYPASS_SECONDS - elapsedSec));
  holdBtnLabel.textContent = currentLang === 'bn'
    ? `বন্ধ করতে ধরে রাখুন... ${remaining} সেকেন্ড`
    : `Keep holding... ${remaining}s left`;

  if (elapsedSec >= HOLD_BYPASS_SECONDS) {
    dismissActiveAlarm();
    return;
  }
  holdAnimFrame = requestAnimationFrame(stepHoldBypass);
}

function startEmergencyHold(e) {
  if (e.cancelable) e.preventDefault();
  if (holdStartTimestamp) return;
  holdStartTimestamp = performance.now();
  holdAnimFrame = requestAnimationFrame(stepHoldBypass);
}

emergencyHoldBtn.addEventListener('pointerdown', startEmergencyHold);
emergencyHoldBtn.addEventListener('pointerup', resetEmergencyHoldState);
emergencyHoldBtn.addEventListener('pointerleave', resetEmergencyHoldState);
emergencyHoldBtn.addEventListener('pointercancel', resetEmergencyHoldState);
emergencyHoldBtn.addEventListener('contextmenu', (e) => e.preventDefault());

// Zero-Allocation 64x64 Object Comparison
function compareObjects(pixels1, pixels2) {
  hist1Buf.fill(0);
  hist2Buf.fill(0);
  const totalPixels = pixels1.length >> 2;
  let sum1 = 0, sum2 = 0;

  for (let i = 0; i < pixels1.length; i += 4) {
    const r1 = pixels1[i], g1 = pixels1[i + 1], b1 = pixels1[i + 2];
    const r2 = pixels2[i], g2 = pixels2[i + 1], b2 = pixels2[i + 2];
    const l1 = (r1 + g1 + b1) / 3 || 1;
    const l2 = (r2 + g2 + b2) / 3 || 1;

    hist1Buf[Math.min(15, ((r1 / (l1 * 3)) * 16) | 0)]++;
    hist1Buf[16 + Math.min(15, ((g1 / (l1 * 3)) * 16) | 0)]++;
    hist1Buf[32 + Math.min(15, ((b1 / (l1 * 3)) * 16) | 0)]++;

    hist2Buf[Math.min(15, ((r2 / (l2 * 3)) * 16) | 0)]++;
    hist2Buf[16 + Math.min(15, ((g2 / (l2 * 3)) * 16) | 0)]++;
    hist2Buf[32 + Math.min(15, ((b2 / (l2 * 3)) * 16) | 0)]++;

    sum1 += l1;
    sum2 += l2;
  }

  let histIntersection = 0;
  for (let b = 0; b < 48; b++) {
    histIntersection += hist1Buf[b] < hist2Buf[b] ? hist1Buf[b] : hist2Buf[b];
  }
  const colorScore = (histIntersection / (totalPixels * 3)) * 100;

  const mean1 = sum1 / totalPixels || 1, mean2 = sum2 / totalPixels || 1;
  let structDiff = 0;
  for (let i = 0; i < pixels1.length; i += 4) {
    const b1 = ((pixels1[i] + pixels1[i + 1] + pixels1[i + 2]) / 3) / mean1;
    const b2 = ((pixels2[i] + pixels2[i + 1] + pixels2[i + 2]) / 3) / mean2;
    const d = b1 - b2;
    structDiff += d < 0 ? (-d > 1 ? 1 : -d) : (d > 1 ? 1 : d);
  }
  const structureScore = (1 - structDiff / totalPixels) * 100;
  return Math.round(colorScore * 0.65 + structureScore * 0.35);
}

function evaluateCurrentPixels(currentPixelsCopy) {
  if (!referenceImageData) return;
  const tempImg = new Image();
  tempImg.onload = () => {
    sharedWorkCtx.drawImage(tempImg, 0, 0, 64, 64);
    const refPixels = sharedWorkCtx.getImageData(0, 0, 64, 64).data;

    const matchScore = compareObjects(refPixels, currentPixelsCopy);
    const feedback = document.getElementById('matchFeedback');

    if (matchScore >= 74) {
      feedback.className = 'compact-status-badge matched';
      feedback.textContent = i18n[currentLang].scanMatched;
      setTimeout(() => {
        dismissActiveAlarm();
      }, 950);
    } else {
      feedback.className = 'compact-status-badge failed';
      feedback.textContent = i18n[currentLang].scanFailed;
    }
  };
  tempImg.src = referenceImageData;
}

document.getElementById('verifyPhotoBtn').addEventListener('click', () => {
  const mv = document.getElementById('missionVideo');
  if (!mv.srcObject || mv.readyState < 2) {
    alert(currentLang === 'bn' ? 'ক্যামেরা চালু হচ্ছে না। ৩০ সেকেন্ড বাটন চেপে ধরে অ্যালার্ম বন্ধ করতে পারবেন।' : 'Camera stream unavailable — hold the 30s button below to stop alarm.');
    return;
  }
  captureFastSample(mv);
  const snapCopy = new Uint8ClampedArray(sharedWorkCtx.getImageData(0, 0, 64, 64).data);
  evaluateCurrentPixels(snapCopy);
});



// --- 15. 7-Day Multi-Task Routine ---
const dayOrder = [6, 0, 1, 2, 3, 4, 5];
const dayLabels = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার']
};

let routines = JSON.parse(localStorage.getItem('routines')) || [];
let sentNotifications = {};

if ('Notification' in window) {
  if (Notification.permission === 'granted') {
    document.getElementById('notifStatus').textContent = i18n[currentLang].notifEnabled;
  } else if (Notification.permission === 'denied') {
    document.getElementById('notifStatus').style.color = '#ef4444';
    document.getElementById('notifStatus').textContent = i18n[currentLang].notifBlocked;
  }
}

document.getElementById('enableNotifBtn').addEventListener('click', async () => {
  if (!('Notification' in window)) return alert('Notifications not supported in this browser.');
  const perm = await Notification.requestPermission();
  const statusEl = document.getElementById('notifStatus');
  if (perm === 'granted') {
    statusEl.style.color = 'var(--green)';
    statusEl.textContent = i18n[currentLang].notifEnabled;
    playCuteKittenMeow();
    triggerPhoneVibration();
    showRoutineAlertBanner('MEO Routine Ready 🐱', 'Meow! Reminders will arrive 60m, 45m, 30m, 15m before & on time.');
    dispatchSystemNotification('MEO Routine Ready 🐱', 'Meow! I will remind you 60m, 45m, 30m, 15m before & on time for your tasks.', false);
  } else if (perm === 'denied') {
    statusEl.style.color = '#ef4444';
    statusEl.textContent = i18n[currentLang].notifBlocked;
  }
});

document.getElementById('addRoutineBtn').addEventListener('click', () => {
  const day = parseInt(document.getElementById('routineDay').value);
  const name = document.getElementById('taskName').value.trim();
  const note = document.getElementById('taskNote').value.trim();
  const time24 = getSelected24Time('taskHour', 'taskMinute', 'taskAmPm');
  if (!name) return;

  routines.push({ id: Date.now(), day, name, note, time: time24 });
  localStorage.setItem('routines', JSON.stringify(routines));
  syncNativeAlarmsWithOS();
  document.getElementById('taskName').value = '';
  document.getElementById('taskNote').value = '';
  renderRoutines();
});

function renderRoutines() {
  const container = document.getElementById('routineGroupedList');
  const frag = document.createDocumentFragment();

  dayOrder.forEach(dayIdx => {
    const dayTasks = routines.filter(r => r.day === dayIdx).sort((a, b) => a.time.localeCompare(b.time));
    if (dayTasks.length === 0) return;

    const groupDiv = document.createElement('div');
    groupDiv.className = 'day-group-card';
    groupDiv.innerHTML = `
      <div class="day-group-title">
        <span>${dayLabels[currentLang][dayIdx]}</span>
        <span>${dayTasks.length} Task${dayTasks.length > 1 ? 's' : ''}</span>
      </div>
    `;

    const todayKey = new Date().toDateString();
    dayTasks.forEach(task => {
      const isDone = task.completedDate === todayKey;
      const isSnoozed = snoozedRoutines.some(s => s.task.id === task.id);
      const sub = document.createElement('div');
      sub.className = `task-subcard ${isDone ? 'completed' : ''}`;
      sub.innerHTML = `
        <div class="task-check-wrap">
          <input type="checkbox" class="routine-checkbox" ${isDone ? 'checked' : ''} onchange="toggleRoutineDone(${task.id})" title="Mark completed" />
          <div style="flex:1;">
            <div class="item-time" style="font-size:1rem;">
              ${formatDisplayTime(task.time)} — ${task.name}
              ${isSnoozed ? '<span class="snooze-badge">💤 Snoozed</span>' : ''}
            </div>
            ${task.note ? `<div class="task-note-text">${task.note}</div>` : ''}
          </div>
        </div>
        <button type="button" class="trash-btn" onclick="deleteRoutine(${task.id})">✕</button>
      `;
      groupDiv.appendChild(sub);
    });

    frag.appendChild(groupDiv);
  });

  container.innerHTML = '';
  container.appendChild(frag);
}


window.toggleRoutineDone = (id) => {
  const todayKey = new Date().toDateString();
  routines = routines.map(r => {
    if (r.id !== id) return r;
    const nextDone = r.completedDate === todayKey ? null : todayKey;
    return { ...r, completedDate: nextDone };
  });
  // If marked done, cancel any active snooze for this task
  snoozedRoutines = snoozedRoutines.filter(s => {
    const t = routines.find(r => r.id === s.task.id);
    return !(t && t.completedDate === todayKey);
  });
  localStorage.setItem('routines', JSON.stringify(routines));
  syncNativeAlarmsWithOS();
  renderRoutines();
};

window.deleteRoutine = (id) => {
  routines = routines.filter(r => r.id !== id);
  localStorage.setItem('routines', JSON.stringify(routines));
  syncNativeAlarmsWithOS();
  renderRoutines();
};

function checkRoutineNotifications(now) {
  const todayDay = now.getDay();
  const todayKey = now.toDateString();
  const currentTotalMins = now.getHours() * 60 + now.getMinutes();
  const nowMs = now.getTime();

  // 1. Check any snoozed routine reminders first
  const remainingSnoozes = [];
  snoozedRoutines.forEach(item => {
    if (nowMs >= item.fireAtMs) {
      const latestTask = routines.find(r => r.id === item.task.id) || item.task;
      if (latestTask.completedDate !== todayKey) {
        playCuteKittenMeow();
        triggerPhoneVibration();
        const titleText = `🐱 Meow! Snoozed Reminder: ${latestTask.name}`;
        const bodyText = latestTask.note ? `${latestTask.note} (${formatDisplayTime(latestTask.time)})` : `Scheduled at ${formatDisplayTime(latestTask.time)}`;
        showRoutineAlertBanner(titleText, bodyText, latestTask);
        dispatchSystemNotification(titleText, bodyText, false);
      }
    } else {
      remainingSnoozes.push(item);
    }
  });
  if (remainingSnoozes.length !== snoozedRoutines.length) {
    snoozedRoutines = remainingSnoozes;
    localStorage.setItem('snoozedRoutines', JSON.stringify(snoozedRoutines));
    renderRoutines();
  }

  // 2. Check regular 60m, 45m, 30m, 15m, 0m reminders (skip if task is already checked off today)
  routines.forEach(task => {
    if (task.day !== todayDay) return;
    if (task.completedDate === todayKey) return;
    const [tHour, tMin] = task.time.split(':').map(Number);
    const diffMins = (tHour * 60 + tMin) - currentTotalMins;

    if ([60, 45, 30, 15, 0].includes(diffMins)) {
      const key = `${task.id}_${diffMins}_${todayKey}`;
      if (!sentNotifications[key]) {
        sentNotifications[key] = true;
        playCuteKittenMeow();
        triggerPhoneVibration();

        const titleText = diffMins === 0
          ? `🐱 Meow! Starting now: ${task.name}`
          : `🐱 Meow! ${diffMins}m left: ${task.name}`;
        const bodyText = task.note ? `${task.note} (${formatDisplayTime(task.time)})` : `Scheduled at ${formatDisplayTime(task.time)}`;

        showRoutineAlertBanner(titleText, bodyText, task);
        dispatchSystemNotification(titleText, bodyText, false);
      }
    }
  });
}

if ('serviceWorker' in navigator && !window.Capacitor) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}

// --- NATIVE CAPACITOR ANDROID ALARM MANAGER BRIDGE ---
const NativeLocalNotifications = (() => {
  if (!window.Capacitor) return null;
  if (window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
    return window.Capacitor.Plugins.LocalNotifications;
  }
  if (typeof window.Capacitor.registerPlugin === 'function') {
    try { return window.Capacitor.registerPlugin('LocalNotifications'); } catch (e) {}
  }
  return null;
})();

async function initNativeAlarmSystem() {
  if (!NativeLocalNotifications) return;
  try {
    await NativeLocalNotifications.requestPermissions();
    if (NativeLocalNotifications.checkExactNotificationSetting) {
      const exactStatus = await NativeLocalNotifications.checkExactNotificationSetting();
      if (exactStatus && exactStatus.exact_alarm !== 'granted' && NativeLocalNotifications.changeExactNotificationSetting) {
        await NativeLocalNotifications.changeExactNotificationSetting();
      }
    }
    await NativeLocalNotifications.createChannel({
      id: 'meo_alarm_channel',
      name: 'MEO Exact Alarms',
      description: 'High priority native alarms that ring even when screen is off',
      importance: 5,
      visibility: 1,
      vibration: true
    });
    await NativeLocalNotifications.createChannel({
      id: 'meo_countdown_channel',
      name: 'Next Alarm Countdown',
      description: 'Shows remaining time until your next scheduled alarm',
      importance: 2,
      visibility: 1,
      vibration: false
    });
    NativeLocalNotifications.addListener('localNotificationReceived', (notif) => {
      if (notif && notif.extra && notif.extra.alarmId) {
        const found = alarms.find(a => a.id === String(notif.extra.alarmId));
        if (found && !activeAlarmId) triggerAlarm(found);
      }
    });
    NativeLocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      const extra = action.notification && action.notification.extra;
      if (extra && extra.alarmId) {
        const found = alarms.find(a => a.id === String(extra.alarmId));
        if (found && !activeAlarmId) triggerAlarm(found);
      }
    });
  } catch (e) {}
}


function getNextWeekdayOccurrence(targetDayIdx, hhmm24, offsetMinsBefore) {
  const [h, m] = hhmm24.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  const dayDiff = (targetDayIdx - now.getDay() + 7) % 7;
  target.setDate(now.getDate() + dayDiff);
  target.setHours(h, m - offsetMinsBefore, 0, 0);
  if (target <= now) {
    target.setDate(target.getDate() + 7);
  }
  return target;
}

function getNextAlarmDate(hhmm24) {
  const [h, m] = hhmm24.split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target;
}

async function syncNativeAlarmsWithOS() {
  if (window.MeoNativeAlarm) {
    try {
      if (typeof window.MeoNativeAlarm.syncAlarms === 'function') {
        window.MeoNativeAlarm.syncAlarms(JSON.stringify(alarms));
      }
      if (typeof window.MeoNativeAlarm.syncRoutines === 'function') {
        window.MeoNativeAlarm.syncRoutines(
          JSON.stringify(routines),
          meowSoundEnabled === 'on',
          vibrateEnabled === 'on'
        );
      }
    } catch (e) {}
  }
  if (!NativeLocalNotifications) return;
  try {
    const pending = await NativeLocalNotifications.getPending();
    if (pending && pending.notifications && pending.notifications.length > 0) {
      await NativeLocalNotifications.cancel({ notifications: pending.notifications });
    }
    const toSchedule = [];
    alarms.forEach((alarm, idx) => {
      if (!alarm.active) return;
      const numericId = (parseInt(String(alarm.id).slice(-6), 10) || (1000 + idx)) + idx;
      toSchedule.push({
        id: numericId,
        title: '⏰ MEO ALARM RINGING',
        body: alarm.mode === 'photo'
          ? 'Tap to scan your target object (or hold 30s) to stop!'
          : `Alarm for ${formatDisplayTime(alarm.time)} is ringing!`,
        schedule: {
          at: getNextAlarmDate(alarm.time),
          allowWhileIdle: true
        },
        channelId: 'meo_alarm_channel',
        extra: { alarmId: String(alarm.id) }
      });
    });
    // Also schedule upcoming 7-day routine reminders in OS background (skip if checked off today)
    const offsets = [60, 45, 30, 15, 0];
    const todayKey = new Date().toDateString();
    routines.forEach((task, rIdx) => {
      offsets.forEach((off, oIdx) => {
        const fireAt = getNextWeekdayOccurrence(task.day, task.time, off);
        if (task.completedDate === todayKey && fireAt.toDateString() === todayKey) return;
        // Only schedule routines occurring within the next 48 hours to stay well below Android's 500 alarm limit
        if (fireAt.getTime() - Date.now() <= 48 * 3600 * 1000) {
          const rNotifId = 500000 + ((rIdx * 10 + oIdx) % 400000);
          toSchedule.push({
            id: rNotifId,
            title: off === 0 ? `🐱 Meow! Starting now: ${task.name}` : `🐱 Meow! ${off}m left: ${task.name}`,
            body: task.note ? `${task.note} (${formatDisplayTime(task.time)})` : `Scheduled at ${formatDisplayTime(task.time)}`,
            schedule: { at: fireAt, allowWhileIdle: true },
            channelId: 'meo_alarm_channel'
          });
        }
      });
    });

    if (toSchedule.length > 0) {
      await NativeLocalNotifications.schedule({ notifications: toSchedule });
    }
  } catch (e) {}
}

// Initialize
populateTimeSelectors();
syncTargetPhotoUI();
syncNativeAlarmsWithOS();
initNativeAlarmSystem().then(() => syncNativeAlarmsWithOS());
applyTheme(currentTheme);
applyLanguage(currentLang);
tickScheduler(true);
requestScreenWakeLock();


// Check if launched directly by a ringing native alarm while screen was off
if (window.MeoNativeAlarm && typeof window.MeoNativeAlarm.getRingingAlarmId === 'function') {
  try {
    const ringingId = window.MeoNativeAlarm.getRingingAlarmId();
    if (ringingId) {
      const targetAlarm = alarms.find(a => String(a.id) === String(ringingId));
      if (targetAlarm) {
        setTimeout(() => triggerAlarm(targetAlarm), 250);
      }
    }
  } catch (e) {}
}
