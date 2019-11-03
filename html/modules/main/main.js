/*
 * FOstatus by Rotators
 * https://github.com/rotators/fodev-status/
 *
 * @preserve
 */

function start()
{
	$('#games').hide();
	$('#footer').hide();

	fo.ConfigURL = configFile;

	update( true, true );

	$('#show_offline').click( function()
	{
		update(false, true);
	});

	$('#display_table').click(function() {
		update(false, true);
	});

	$('#show_closed').click( function()
	{
		update(false, true);
	});

	$('#show_singleplayer').click( function()
	{
		update(false, true);
	});

	$('#games').show();
	$('#footer').show();

	setInterval(function() { update(false, false) }, 60000 );
}

function renderGames(status, average)
{
	var show_offline = $('#show_offline').prop( 'checked' );
	var show_closed = $('#show_closed').prop( 'checked' );
	var show_singleplayer = $('#show_singleplayer').prop( 'checked' );
	var show_table = $("#display_table").prop('checked');

	// cache results until all servers are parsed
	var divs = [];

	if(!show_table) {
	$.each( fo.GetServersArray( 'name' ), function( idx, server )
	{
		var online = false, closed = false, singleplayer = false;
		if( server.singleplayer != null && server.singleplayer )
			singleplayer = true;
		else if( server.closed != null && server.closed )
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
		else // !online
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

				if( !closed )
				{
					if( status.server[server.id] != null && status.server[server.id].seen != null && status.server[server.id].seen > 0 )
					{
						content += '<br>Last seen: ';
						var seen = new Date( status.server[server.id].seen * 1000 );
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
			content.push( "<a href='server/"+server.id+"/' title='Game details'>Details</a>" );

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

		// yeah, it's not great but everyone uses it
		if( server.discord != null && content.length != 3 )
			content.push( "<a href='https://discord.gg/"+server.discord+"'>Discord</a>" );

		// append links
		if( content.length > 0 )
			links.append( '&#171; '+content.join( ' &#183; ' )+' &#187;' );

		div.append( [stats,links] );

		divs.push( div );
	});

	$('#games_list').empty();
	if( divs.length > 0 )
		$('#games_list').append( divs );
	}
	else { // display as table

		var rows = '';
		$.each( fo.GetServersArray( 'name' ), function( idx, server )
		{
			var online = false, closed = false, singleplayer = false;
			if( server.singleplayer != null && server.singleplayer )
				singleplayer = true;
			else if( server.closed != null && server.closed )
				closed = true;
			else if( status.server[server.id] != null && status.server[server.id].uptime >= 0 )
				online = true;

			if(singleplayer && !show_singleplayer)
				return;
			if(closed && !show_closed)
				return;
			if(!online && !singleplayer && !closed && !show_offline)
				return;

			var download = '';
			var yt = '';
			var twitter = '';
			var discord = '';
			if(server.download != null) {
				download = '<a href="'+server.download+'" style="display: table-cell; width: 24px;"><img src="gfx/download-cloud.png" style="float: right;" title="Download" /></a>';
			}
			if(server.youtube != null) {
				yt = '<a href="https://www.youtube.com/channel/'+server.youtube+'" style="display: table-cell; width: 24px;"><img src="gfx/film-youtube.png" style="float: right; " title="YouTube" /></a>';
			}
			if(server.twitter != null) {
				twitter = '<a href="https://twitter.com/'+server.twitter+'" style="display: table-cell; width: 24px;"><img src="gfx/balloon-twitter-left.png" style="float: right; " title="Twitter" /></a>';
			}
			if(server.discord != null) {
				discord = '<a href="https://discord.gg/'+server.discord+'" style="display: table-cell; width: 24px;"><img src="gfx/discord.png" style="float: right; " title="Discord" /></a>';
			}

			var cells = '';
			cells += '<td><div style="display: table; width: 100%;"><a href="server/'+server.id+'/" title="Details" style="display: table-cell; vertical-align: middle; padding-right: 8px; white-space: nowrap;">' + server.name +'</a>'+yt+twitter+discord+download+'</div></td>';
			if(!singleplayer && server.host != undefined) {
				cells += '<td style="white-space: nowrap; padding-right: 5px;">' + server.host+':'+server.port+'</td>';
			} else {
				cells += '<td></td>';
			}

			if( online )
			{
				var s = '';
				if( status.server[server.id].players > 0 )
					s += 'Players: '+status.server[server.id].players;
				else
					s += 'No players';

				if( average != null && average.server[server.id] != null )
					s += ' (average: '+average.server[server.id]+')';

				// add uptime
				s += '<br>Uptime: ';
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
					s += result.join( ' and ' );

				cells += '<td>' + s +'</td>';
			} else {
				if(closed) {
					cells += '<td>Closed</td>';
				} else if(!closed && !singleplayer) {
					var s = 'Offline';
					if( status.server[server.id] != null && status.server[server.id].seen != null && status.server[server.id].seen > 0 )
					{
						s += '<br>Last seen: ';
						var seen = new Date( status.server[server.id].seen * 1000 );
						var now = new Date();
						var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
						if( now.getFullYear() == seen.getFullYear() && now.getMonth() == seen.getMonth() && now.getDate() == seen.getDate() )
							s += 'Today';
						else
							s += seen.getDate()+' '+months[seen.getMonth()]+' '+seen.getFullYear();
					}
					cells += '<td style="white-space: nowrap; padding-right: 5px;">'+s+'</td>';
				} else {
					cells += '<td>Singleplayer game</td>';
				}
			}

			var links = [];
			$.each( ['Website','Link'], function( idx, weblink )
			{
				if( server[weblink.toLowerCase()] != null )
				{
					links.push( "<a href='"+server[weblink.toLowerCase()]+"'>"+weblink+"</a>" );
					return( false ); // break;
				}
			});

			// yay, opensource server!
			if( server.source != null )
				links.push( "<a href='"+server.source+"'>Code</a>" );

			// yeah, it's not great but everyone uses it
			if( server.discord != null)
				links.push( "<a href='https://discord.gg/"+server.discord+"'>Discord</a>" );

			// append links
				cells += '<td style="white-space: nowrap; padding-right: 5px;">'+(links.join( ' &#183; ' ))+'</td>';

			if(online) {
				rows += '<tr class="online">'+cells+'</tr>';
			} else if(!singleplayer) {
				rows += '<tr class="offline">'+cells+'</tr>';
			} else {
				rows += '<tr class="single">'+cells+'</tr>';
			}
		});

		
		var cols = '';
		cols += '<th>Game</th><th>Server</th><th>Status</th><th>Links</th>';
		$('#games_list').html('<table id="game_table" style="font-size: 10px;"><thead><tr>'+cols+'</tr></thead><tbody>'+rows+'</tbody></table>');
	}
}

function update( first_time, force )
{
	fo.defaultArgument( first_time, false );

	if( !first_time && !$('#auto_update').prop( 'checked' ) && !force)
		return;

	ShowInfo( (first_time ? 'Load' : 'Updat')+'ing...' );

	fo.LoadJSONQueue( true, dataDir, ['status','average_short'], function( result )
	{
		var status = result.status;
		var average = result.average_short;
		result = null;

		if( status.servers == null || status.players == null || status.server == null )
		{
			ShowInfo( 'Invalid status data' );
			return;
		}

		renderGames(status, average);

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
