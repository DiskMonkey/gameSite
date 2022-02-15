var startWebServer = function startWebServer()
{
	const express = require('express');
	const path = require('path');
	
	const app = express();
	const port = process.env.PORT || 3000;

	app.use(express.static(path.join(__dirname, 'webSocket')));
	app.use(express.static(path.join(__dirname, 'common')));
	app.use(express.static(path.join(__dirname, 'assets')));
	app.use(express.static(path.join(__dirname, 'ttt')));
	app.use(express.static(path.join(__dirname, 'frontpage')));
	
	app.listen(port);
	
	app.get('/', function(req, res) {
		res.sendFile(path.join(__dirname, '/frontpage/frontpage.html'));
	});
	app.get('/ttt', function(req, res) {
		res.sendFile(path.join(__dirname, '/ttt/clientTTT.html'));
	});
	
	
	console.log('Server started at http://localhost:' + port);
}

module.exports.startWebServer = startWebServer;
