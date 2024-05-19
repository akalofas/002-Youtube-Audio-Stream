const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static('public'));

// Route for streaming YouTube audio
app.get('/stream', (req, res) => {
	const videoURL = req.query.url;
	if (!videoURL) {
		return res.status(400).send('No URL provided');
	}

	res.set({
		'Content-Type': 'audio/mpeg',
		'Transfer-Encoding': 'chunked',
	});

	const stream = ytdl(videoURL, {
		quality: 'highestaudio',
		filter: 'audioonly',
		highWaterMark: 1 << 25, // 32MB buffer size
	});

	stream.on('error', (error) => {
		console.error('Stream error:', error);
		res.status(500).end();
	});

	stream.pipe(res);

	req.on('close', () => {
		console.log('Client closed connection. Ending stream.');
		stream.destroy();
	});
});

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
