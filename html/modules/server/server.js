/*
 * FOstatus by Rotators
 * https://github.com/rotators/fodev-status/
 *
 * @preserve
 */

function start( id )
{
	$('#footer').hide();
	ShowInfo( 'Loading...' );

	$('#logo').empty();
	$('#link').empty();
	$('#chart').empty();

	if( id == null )
	{
		ShowInfo( 'Server id not given' );
		return;
	}

	fo.LoadConfig( configFile, function()
	{
		var server = fo.GetServer( id );
		if( server == null || fo.GetServerOption( id, 'id' ) == null )
		{
			ShowInfo( 'Invalid server id' );
			return;
		}

		var tmp = null;

		// try to load server logo
		tmp = rootDir+'/gfx/logo/'+id+'.png';
		$.ajax({ url: tmp, type: 'HEAD', async: false,
		success: function()
		{
			// all is fine
		},
		error: function()
		{
			// this one must be generated server-side before accessing page
			// TODO: use /path/json/logo/
			tmp = rootDir+'/cache/'+id+'.logo-placeholder.png';
		}});

		$( '<img>',
		{
			src: tmp,
			alt: server.name
		}).appendTo( '#logo' );

		// add a server link (if a available)
		$.each( ['website','link'], function( idx, weblink )
		{
			var value = server[weblink];
			if( value != null )
			{
				$( '<a>', { href: value, text: value }).appendTo( '#link' );
				return( false ); // break;
			}
		});

		tmp = null;
		if( server.singleplayer != null && server.singleplayer )
		{
			tmp = 'Singleplayer game';
			$('#game').css( 'color', '#0090c0' );
		}
		if( server.closed != null && server.closed )
		{
			tmp = 'Server closed';
			$('#game').css( 'color', '#b1000d' );
		}
		else if( server.host != null && server.port != null )
		{
			tmp = server.host+' : '+server.port;
		}
		if( tmp != null )
			$('#game').text( tmp );

		if( server.irc != null && server.irc.charAt(0) == '#' )
		{
			$( '<a>',
			{
				href: 'https://chat.forestnet.org/?channels='+server.irc,
				text: server.irc+' @ ForestNet'
			}).appendTo( '#irc' );
		}

		var chart = foCharts.CreateTimeline( 'fonline', 'chart' );
		chart.chart.height = 300;
		chart.scrollbar = 
		chart.navigator =
		chart.rangeSelector =
		{ enabled: false };

		chart = new Highcharts.StockChart( chart );

		var setup = {
			server_history:
			{
				name: 'Players',
				index: 0,
				color: fo.GetOption( 'colors', 'players' ),
			},
			server_average:
			{
				name: 'Average',
				index: 1,
				color: fo.GetOption( 'colors', 'average' ),
			},
			max_players:
			{
				name: 'Server record',
				index: 2,
				color: fo.GetOption( 'colors', 'record' ),
				extract: true,
				series: 'server_history',
			}
		};

		var addSeries = function(seriesOptions, config )
		{
			if( seriesOptions != null )
			{
				if( config.name != null )
					seriesOptions.name = config.name;
				if( config.color != null )
					seriesOptions.color = config.color;

				 chart.addSeries( seriesOptions, true ).xAxis.setExtremes();
			}
		};

		$.each( setup, function( idx, config )
		{
			ShowInfo( 'Loading '+config.name.toLowerCase()+'...' );

			var seriesOptions = null;

			if( config.extract != null && config.extract )
			{
				fo.LoadJSON( dataDir+fo.GetPath( idx ), idx, function( jsonData )
				{
					if( jsonData.server == null || jsonData.server[id] == null )
						return;

					var serverMax = jsonData.server[id].players;
					seriesOptions = {
						data: [{
							x: foCharts.ConvertTimestamp( jsonData.server[id].timestamp ),
							title: config.name+": "+serverMax
						}],
						type: 'flags',
						shape: 'flag',
						index: config.index,
						legendIndex: config.index
					};

					if( config.series != null )
						seriesOptions.onSeries = config.series;

					var best = true;
					var worst = true;
					$.each( jsonData.server, function( serverId, otherServer )
					{
						if( serverId == id )
							return( true ); // continue;

						if( otherServer.players >= serverMax )
							best = false;
						if( otherServer.players <= serverMax )
							worst = false;

						if( !best && !worst )
							return( false ); // break;
					});
					if( best )
						seriesOptions.data[0].title += "<br/>Best of all servers";
					if( worst )
						seriesOptions.data[0].title += "<br/>Worst of all servers";

					addSeries( seriesOptions, config );
				});
			}
			else
			{
				fo.LoadJSON( dataDir+fo.GetPath( idx, { ID: id }), idx, function( jsonData )
				{
					seriesOptions = {
						data: foCharts.ConvertTimestampArray( jsonData.server[id] ),
						id: idx,
						index: config.index,
						legendIndex: config.index
					};

					addSeries( seriesOptions, config );
				});
			}
		});

		HideInfo();
		$('#footer').show();
	});
};
