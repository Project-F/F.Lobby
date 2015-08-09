define({

create: function (lobbyElement, lobby_address, room, gamestart_callback)
{
	var server;

	//step 1: get protocol from lobby server
	var request = new XMLHttpRequest();
	request.onload = function()
	{
		server = JSON.parse(this.responseText);
		//create iframe
		lobbyElement.src = lobby_address+'/lobby';
		lobbyElement.onload = function()
		{
			//initializes lobby
			lobbyElement.contentWindow.postMessage({
				init: true,
				protocol: 'F.Lobby 0.1',
				room: room
			}, lobby_address);
		}
	}
	request.open('GET', lobby_address+'/protocol', true);
	request.responseType = 'text';
	request.timeout = 2000;
	request.send();

	//step 2: listen to lobby event
	window.addEventListener('message', windowMessage, false);
	function windowMessage(event)
	{
		if( event.origin===lobby_address)
		if( event.data.event==='start')
		{
			gamestart_callback({
				server:server,
				param:event.data
			});
		}
	}
}

});
