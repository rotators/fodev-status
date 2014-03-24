function start()
{
	$('#games').hide();
	$('#footer').hide();

	update( true );

	$('#show_offline').click( function()
	{
		$('#server_status.offline').toggle();
	});

	$('#show_closed').click( function()
	{
		$('#server_status.closed').toggle();
	});

	$('#show_singleplayer').click( function()
	{
		$('#server_status.singleplayer').toggle();
	});

	$('#games').show();
	$('#footer').show();

	setInterval( update, 60000 );
}

function update( first_time )
{
	fo.defaultArgument( first_time, false );

	if( !first_time && !$('#auto_update').prop( 'checked' ))
		return;

	ShowInfo( (first_time ? 'Load' : 'Updat')+'ing...' );

	var show_offline = $('#show_offline').prop( 'checked' );
	var show_closed = $('#show_closed').prop( 'checked' );
	var show_singleplayer = $('#show_singleplayer').prop( 'checked' );

	if( !fo.LoadConfig( configFile ))
	{
		ShowInfo( 'Invalid config file' );
		return;
	}

	fo.LoadJSON( dataDir+fo.GetPath( 'status' ), 'status', function( status )
	{
		if( status.servers == null || status.players == null || status.server == null )
		{
			ShowInfo( 'Invalid status data' );
			return;
		}

		// optional data
		var average = fo.LoadJSON( dataDir+fo.GetPath( 'average_short' ), 'average_short' );
		if( average.server == null )
			average = null;
		var lifetime = fo.LoadJSON( dataDir+fo.GetPath( 'lifetime' ), 'lifetime' );
		if( lifetime.server == null )
			lifetime = null;

		// cache results until all servers are parsed
		var divs = [];

		$.each( fo.GetServersArray( 'name' ), function( idx, server )
		{
			var online = false, closed = false, singleplayer = false;
			if( server.singleplayer != null && server.singleplayer == true )
				singleplayer = true;
			else if( server.closed != null && server.closed == true )
				closed = true;
			else if( status.server[server.id] != null && status.server[server.id].uptime >= 0 )
				online = true;

			// basic elements
			var div = $('<div/>',
			{
				id: 'server_status',
				class: server.id // future customization?
			});
			var stats = $('<pre/>', { class: 'stats' });
			var links = $('<address/>', { class: 'links' });

			// build server informations
			var content = server.name+'<br>';
			if( online )
			{
				div.addClass( 'online' );

				// add players online
				if( status.server[server.id].players > 0 )
					content += 'Players: '+status.server[server.id].players;
				else
					content += 'No players';

				if( average != null && average.server[server.id] != null )
					content += ' (average: '+average.server[server.id]+')';

				// add uptime
				content += '<br>Uptime: ';
				var result = [];
				var uptime = fo.ExtractSeconds( status.server[server.id].uptime );
				$.each( ['year', 'month', 'week', 'day', 'hour', 'minute'], function( idx, name )
				{
					if( uptime[idx] > 0 )
					{
						result.push( uptime[idx]+' '+name+(uptime[idx]>1 ? 's' : ''));
						if( result.length >= 2 )
							return( false ); // break;
					}
				});
				if( result.length > 0 )
					content += result.join( ' and ' );
			}
			else
			{
				if( singleplayer )
				{
					content += 'Singleplayer';
					div.addClass( 'singleplayer' );
					if( !show_singleplayer )
						div.hide();
				}
				else if( closed )
				{
					content += 'Closed';
					div.addClass( 'closed' );
					if( !show_closed )
						div.hide();
				}
				else
				{
					content += 'Offline';
					div.addClass( 'offline' );
					if( !show_offline )
						div.hide();
				}

				if( !singleplayer )
				{
					if( average != null && average.server[server.id] != null )
						content += ' (average players: '+average.server[server.id]+')';

					if( !closed  )
					{
						if( lifetime != null && lifetime.server[server.id] != null && lifetime.server[server.id].seen != null )
						{
							content += '<br>Last seen: ';
							var seen = new Date( lifetime.server[server.id].seen * 1000 );
							var now = new Date();
							var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
							if( now.getFullYear() == seen.getFullYear() && now.getMonth() == seen.getMonth() && now.getDate() == seen.getDate() )
								content += 'Today';
							else
								content += seen.getDate()+' '+months[seen.getMonth()]+' '+seen.getFullYear();
						}
						else
							div.addClass( 'not_seen' );
					}
				}
			}

			// append server status
			if( content != null )
				stats.append( content );

			content = [];
			if( $.inArray( 'Server', siteModules ) >= 0 &&
				average != null && average.server[server.id] != null )
				content.push( "<a href='server/"+server.id+"/' title='Details'>Details</a>" );

			// pick first available link
			$.each( ['Website','Link'], function( idx, weblink )
			{
				if( server[weblink.toLowerCase()] != null )
				{
					content.push( "<a href='"+server[weblink.toLowerCase()]+"'>"+weblink+"</a>" );
					return( false ); // break;
				}
			});

			// yay, opensource server!
			if( server.source != null )
				content.push( "<a href='"+server.source+"'>Source</a>" );

			// promote text-only communication
			// TODO: allow non-ForestNet channels
			if( server.irc != null && server.irc.charAt(0) == '#' )
				content.push( "<a href='https://chat.forestnet.org/?channels="+server.irc+"' title='"+server.irc+" @ ForestNet'>IRC</a>" );

			// append links
			if( content.length > 0 )
				links.append( '&#171; '+content.join( ' &#183; ' )+' &#187;' );

			div.append( [stats,links] );

			divs.push( div );
		});

		$('#games_list').empty();
		if( divs.length > 0 )
			$('#games_list').append( divs );

		$('#online_servers').text( status.servers );
		$('#online_players').text( status.players );

		if( status.servers != 1 )
			$('#online_servers_s').text( 's' );
		else
			$('#online_servers_s').empty();

		if( status.players != 1 )
			$('#online_players_s').text( 's' );
		else
			$('#online_players_s').empty();

		HideInfo();
	});
}
