/*\
 * network: p2p networking
 * transport layer: websocket
\*/

define(function()
{
	var already = false;
	var ws;
	function setup(config, handler)
	{
		if( already)
		{
			console.error('setup already');
			return;
		}
		already = true;
		
		var host = config.server.address;
		if( host.charAt(host.length-1)==='/')
			host = host.slice(0,-1);
		var path = config.server.path;
		var id1 = config.param.id1;
		var id2 = config.param.id2;
		host = host.replace(/^http/,'ws')+path;
		if( !id1 || !id2)
		{
			handler.on('error', 'invalid id');
			return;
		}
		ws = new WebSocket(host);
		var retry;
		var num_tried=0;
		var connected;
		var wrapper =
		{
			send:function(data)
			{
				send(data);
			}
		};
		ws.onopen=function()
		{
			handler.on('log', 'web socket opened');
			send({open:'open', name:id1, target:id2});
			if( config.param.role==='active')
				retry = setInterval(function(){
					handler.on('log', 'initiate handshake...');
					if( retry)
						send({h:'hi'});
					if( num_tried++ >=9)
					{
						clearInterval(retry);
						retry = null;
						handler.on('error', 'peer connection failed');
					}
				},1000);
		}
		ws.onclose=function()
		{
			handler.on('close');
		}
		ws.onerror=function(e)
		{
			handler.on('error', e);
		}
		ws.onmessage=function(mess)
		{
			var data = JSON.parse(mess.data);
			if( connected)
			{
				handler.on('data', data);
			}
			else
			{
				if( data.h)
				{
					if( data.h==='hi')
						send({h:'hi back'});
					handler.on('log', 'handshake success');
					connected = true;
					if( retry)
					{
						clearInterval(retry);
						retry = null;
					}
					handler.on('open', wrapper);
				}
			}
		}
		function send(data)
		{
			ws.send(JSON.stringify(data));
		}
	}
	function teardown()
	{
		if( !already)
		{
			console.error('not yet setup');
			return;
		}
		already = false;
		ws.close();
		ws = null;
	}
	
	return {
		setup:setup,
		teardown:teardown
	}
});
