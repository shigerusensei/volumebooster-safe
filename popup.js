var port = chrome.runtime.connect();
port.postMessage({ action: 'start' });

const slide      = document.getElementById('slide');
const button     = document.getElementById('button');
const volDisplay = document.getElementById('vol-display');
const meterFill  = document.getElementById('meter-fill');
const DEFAULT    = 2;

function toPercent(val) {
  return Math.round((val / 6) * 600) + '%';
}

function barWidth(val) {
  return ((val / 6) * 100).toFixed(1) + '%';
}

function barColor(val) {
  if (val <= 2) return '#6d5aff';
  if (val <= 4) return '#f59e0b';
  return '#e05252';
}

function updateUI(val) {
  slide.style.setProperty('--pct', ((val / 6) * 100).toFixed(1) + '%');
  volDisplay.textContent     = toPercent(val);
  meterFill.style.width      = barWidth(val);
  meterFill.style.background = barColor(val);
}

chrome.storage.local.get('volumeLevel', function (data) {
  const vol = data.volumeLevel !== undefined ? parseFloat(data.volumeLevel) : DEFAULT;
  slide.value = vol;
  updateUI(vol);
  chrome.runtime.sendMessage({ type: 'change-vol', target: 'offscreen', data: vol });
});

slide.addEventListener('input', function () {
  updateUI(parseFloat(this.value));
});

slide.addEventListener('change', function () {
  const vol = parseFloat(this.value);
  chrome.storage.local.set({ volumeLevel: vol });
  chrome.runtime.sendMessage({ type: 'change-vol', target: 'offscreen', data: vol });
});

button.addEventListener('click', function () {
  chrome.storage.local.set({ volumeLevel: DEFAULT });
  chrome.runtime.sendMessage({ type: 'stop-streaming', target: 'offscreen' });
  window.close();
});