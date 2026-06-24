var audioCtx, gainNode, source;

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'start') {
    audioCtx = new AudioContext();
    navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: request.streamId
        }
      }
    }).then(function(stream) {
      source = audioCtx.createMediaStreamSource(stream);
      gainNode = audioCtx.createGain();
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      gainNode.gain.value = 4;
    }).catch(function(err) {});
  } else if (request.action === 'adjustVolume' && gainNode) {
    let newVolume = isNumeric(request.value) ? request.value : 2;
    gainNode.gain.value = 2 ** newVolume;
  } else if (request.action === 'stop' && streamer) {
    if (streamer.getAudioTracks().length > 0) {
      streamer.getAudioTracks().forEach(track => track.stop());
    }
    if (audioCtx) audioCtx.close();
    streamer = null;
    audioCtx = null;
    gainNode = null;
    source = null;
  }
});

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}