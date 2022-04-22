function initWebSocket()
{
	return new Promise(function (resolve, reject)
	{
		var ws = new WebSocket('ws://172.31.26.18:5050'); //this is ip specific. REMEMBER TO UPDATE WITH EACH NEW INSTANCE. Public IPv4 address
		//old was 'ws://35.173.136.120:5050'. Update with every tmux session
		ws.onopen = () =>
		{
			console.log('Connection opened!');
			resolve(ws);
		}
		
		ws.onmessage = ({ data }) => console.log("Unsigned Data: " + data);
		ws.onclose = function ()
		{
			ws = null;
		}

		var timeWaitSec = 5;
		setTimeout(function checkIfWebSocketFailed()
		{
			if (ws == null || ws.readyState == ws.CLOSED || ws.readyState == ws.CONNECTING)
			{
				reject("No Connection");
			}
		}, 1000 * timeWaitSec)
	});
}

function messagePromise(ws)
{
	return new Promise(function (resolve)
	{
		ws.onmessage = ({ data }) =>
		{
			resolve(data);
		}
	});
}
