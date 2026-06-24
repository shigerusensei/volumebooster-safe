const GITHUB_USER = 'shigerusensei';
const GITHUB_REPO = 'volume-booster-safe';
const CURRENT_VERSION = chrome.runtime.getManifest().version;
const GITHUB_API_URL = `https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;
const CHECK_INTERVAL_MINUTES = 60;

var gainNode;
var os;
var prevFullScreen = false;
var val = 2;

chrome.runtime.getPlatformInfo(function (info) {
  os = info.os;
});

chrome.runtime.onConnect.addListener(async (tab) => {
  chrome.runtime.onMessage.addListener(function (msg) {
    if (isNumeric(msg.action)) {
      val = msg.action;
      gainNode.gain.value = 2 ** val;
    }
  });

  const existingContexts = await chrome.runtime.getContexts({});
  let streamer = false;

  const offscreenDocument = existingContexts.find(
    (c) => c.contextType === 'OFFSCREEN_DOCUMENT'
  );

  if (!offscreenDocument) {
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['USER_MEDIA'],
      justification: 'Streaming from chrome.tabCapture API'
    });
  } else {
    streamer = offscreenDocument.documentUrl.endsWith('#streaming');
  }

  const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: tab.id });

  chrome.runtime.sendMessage({ type: 'start-streaming', target: 'offscreen', data: streamId });

  chrome.tabCapture.onStatusChanged.addListener(function (info) {
    if (info.fullscreen) {
      if (!prevFullScreen) {
        chrome.windows.getCurrent((window) => {
          chrome.windows.update(window.id, { state: 'fullscreen' });
        });
      }
    } else {
      if (prevFullScreen) {
        chrome.windows.getCurrent((window) => {
          if (window.state === 'fullscreen') {
            chrome.windows.update(window.id, { state: 'normal' });
          }
        });
      }
    }
    prevFullScreen = info.fullscreen;
  });
});

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

function isNewerVersion(latest, current) {
  const a = latest.replace(/^v/, '').split('.').map(Number);
  const b = current.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av > bv) return true;
    if (av < bv) return false;
  }
  return false;
}

async function checkForUpdate() {
  try {
    const res = await fetch(GITHUB_API_URL, {
      headers: { 'Accept': 'application/vnd.github+json' },
      cache: 'no-store'
    });

    if (!res.ok) return;

    const data = await res.json();
    const latestVersion = (data.tag_name || '').replace(/^v/, '');
    const downloadUrl = data.html_url || `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

    if (!latestVersion || !isNewerVersion(latestVersion, CURRENT_VERSION)) return;

    const stored = await chrome.storage.local.get('lastNotifiedVersion');
    if (stored.lastNotifiedVersion === latestVersion) return;

    await chrome.storage.local.set({ lastNotifiedVersion: latestVersion, updateDownloadUrl: downloadUrl });

    chrome.notifications.create('vbs-update', {
      type: 'basic',
      iconUrl: 'sound.png',
      title: 'Volume Booster Safe — Update Available',
      message: `Version ${latestVersion} is ready. Click to download.`,
      priority: 2,
      buttons: [{ title: 'Download Update' }]
    });
  } catch (_) {}
}

chrome.notifications.onClicked.addListener(async (notifId) => {
  if (notifId !== 'vbs-update') return;
  const stored = await chrome.storage.local.get('updateDownloadUrl');
  chrome.tabs.create({ url: stored.updateDownloadUrl || `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/latest` });
  chrome.notifications.clear('vbs-update');
});

chrome.notifications.onButtonClicked.addListener(async (notifId) => {
  if (notifId !== 'vbs-update') return;
  const stored = await chrome.storage.local.get('updateDownloadUrl');
  chrome.tabs.create({ url: stored.updateDownloadUrl || `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/latest` });
  chrome.notifications.clear('vbs-update');
});

chrome.runtime.onInstalled.addListener(() => {
  checkForUpdate();
  chrome.alarms.create('github-update-check', {
    delayInMinutes: CHECK_INTERVAL_MINUTES,
    periodInMinutes: CHECK_INTERVAL_MINUTES
  });
});

chrome.alarms.get('github-update-check', (alarm) => {
  if (!alarm) {
    chrome.alarms.create('github-update-check', {
      delayInMinutes: CHECK_INTERVAL_MINUTES,
      periodInMinutes: CHECK_INTERVAL_MINUTES
    });
  }
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'github-update-check') checkForUpdate();
});
