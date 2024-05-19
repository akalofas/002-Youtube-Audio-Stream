var audioPlayer = document.getElementById('audioPlayer');
var bufferStatus = document.getElementById('bufferStatus');
var connectionStatus = document.getElementById('connectionStatus');
var intervalId;

audioPlayer.addEventListener('error', handleAudioError);
audioPlayer.addEventListener('progress', updateBufferStatus);

function playAudio() {
	var url = document.getElementById('url').value;
	setAudioSource(url);
	monitorConnection();
}

function setAudioSource(url) {
	audioPlayer.src = `http://localhost:3000/stream?url=${encodeURIComponent(
		url
	)}`;
	audioPlayer.load();
	audioPlayer.play().catch((e) => console.log('Error playing audio:', e));

    audioPlayer.onended = () => {
        if (!audioPlayer.paused || audioPlayer.readyState < 4) {
            console.log(
                'Stream ended unexpectedly. Attempting to reconnect...'
            );
            setAudioSource(url);
        }
    };
}

function handleAudioError(e) {
	console.log('Audio Error:', e);
	connectionStatus.innerHTML = 'Status: Disconnected';
	if (e.target.error.code === e.target.error.MEDIA_ERR_NETWORK) {
		console.log('Reconnecting due to network error...');
		setTimeout(() => {
			setAudioSource(document.getElementById('url').value);
		}, 10000);
	}
}

function updateBufferStatus() {
	var bufferedTime =
		audioPlayer.buffered.length > 0
			? audioPlayer.buffered.end(audioPlayer.buffered.length - 1)
			: 0;
	bufferStatus.innerHTML = `Buffered: ${Math.floor(
		bufferedTime / 60
	)} minutes`;
}

function monitorConnection() {
	if (intervalId) clearInterval(intervalId);
	intervalId = setInterval(() => {
		if (
			audioPlayer.networkState === audioPlayer.NETWORK_IDLE &&
			audioPlayer.readyState >= audioPlayer.HAVE_FUTURE_DATA
		) {
			connectionStatus.innerHTML = 'Status: Online';
		}
	}, 1000);
}
