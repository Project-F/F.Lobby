/*\
 * network: p2p networking
 * transport layer: peerjs
\*/

define(['module'],function(module)
{
	var already = false;
	var peer;
	var handler;
	function setup(config, _handler)
	{
		if( already)
		{
			console.error('setup already');
			return;
		}
		handler = _handler;
		already = true;
		var libpath = module.uri.split('/');
		libpath.pop();
		libpath = libpath.join('/');
		requirejs([libpath+'/peer.js'], function()
		{
			_setup(config, handler);
		});
	}
	function _setup(config, handler)
	{
		var active,
			id1 = config.param.id1,
			id2 = config.param.id2;
		
		if( config.param.role==='active')
			active = true;
		else if( config.param.role==='passive')
			active = false;
		else
			handler.on('error', 'invalid role '+config.param.role);
		
		if( !id1 || !id2)
		{
			handler.on('error', 'invalid id');
			return false;
		}
		var options = 
		{
			host:get_host(config.server.address),
			port:config.server.port,
			path:config.server.path,
			debug:3,
			logFunction: logfun
		};
		peer = new Peer(id1, options);
		
		peer.on('open', function(id)
		{
			if( active)
			{
				conn = peer.connect(id2);
				connection(conn);
			}
			else
			{
				peer.on('connection', connection);
			}
		});
		
		function connection(conn)
		{
			var wrapper = {
				send:function(data)
				{
					conn.send(data);
				}
			};
			conn.on('open', function(){
				handler.on('open', wrapper);
				peer.disconnect();
			});
			conn.on('close', function(){
				handler.on('close');
			});
			conn.on('error', function(e){
				handler.on('error', e);
			});
			conn.on('data', function(d){
				handler.on('data', d);
			});
		}
	}
	function teardown()
	{
		if( !already)
		{
			console.error('not yet setup');
			return;
		}
		peer.destroy();
		peer = null;
		handler = null;
		already = false;
	}
	function logfun()
	{
		var mess = Array.prototype.slice.call(arguments).join(' ');
		handler.on('log', mess);
	}
	function get_host(host)
	{
		host = host.replace('http://','');
		host = host.replace('https://','');
		return host.split(':')[0];
	}
	
	return {
		setup:setup,
		teardown:teardown
	}
});
