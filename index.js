var startWebServer = function startWebServer()
{
	const express = require('express');
	const path = require('path');
	
	const app = express();
	const port = process.env.PORT || 3000;
	
	
	app.use(express.static('webSocket'));
	app.use(express.static('common'));
	app.use(express.static('assets'));
	app.use(express.static('ttt'));
	app.use(express.static('frontpage'));
	
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
