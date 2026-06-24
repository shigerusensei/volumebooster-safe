var media, output, source;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target === 'offscreen') {
    switch (message.type) {
      case 'start-streaming':
        start(message.data);
        break;
      case 'stop-streaming':
        stop();
        break;
      case 'change-vol':
        volume(message.data);
        break;
      default:
        throw new Error('Unrecognized message:', message.type);
    }
  }
});

async function start(streamId) {
  media = await navigator.mediaDevices.getUserMedia({
    audio: {
      mandatory: {
        chromeMediaSource: 'tab',
        chromeMediaSourceId: streamId
      }
    },
    video: false
  });

  output = new AudioContext();
  source = output.createMediaStreamSource(media);
  gainNode = output.createGain();
  gainNode.gain.value = 4;
  source.connect(gainNode).connect(output.destination);
}

async function stop() {
  media.getAudioTracks()[0].stop();
  output.close();
}

async function volume(vol) {
  gainNode.gain.value = 2 ** vol;
}
