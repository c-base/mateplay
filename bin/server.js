"use strict"

const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const playlist = require('./lib/playlist.js')();

const app = express();

app.use(cors());

app.use('/', express.static(path.resolve(__dirname, '../web')));

app.get('/api/getvideos', (req, res) =>
	res.status(200).json(playlist.getVideos())
)

app.get('/api/getstatus', (req, res) =>
	res.status(200).json(playlist.getStatus())
)

app.get('/api/play/:name', (req, res) => {
	playlist.playVideo(req.params.name);
	res.status(200).json(true)
})

app.get('/api/stop', (req, res) => {
	playlist.stop();
	res.status(200).json(true)
})

app.listen(8080, err => {
	if (err) throw err;
	console.log('Server started on port 8080');
})
