function start()
{
	ShowInfo( '&#666;' );

	if( !fo.LoadConfig( configFile ))
	{
		return;
	}

	var lifetime = fo.LoadJSON( dataDir+fo.GetPath( 'lifetime' ), 'lifetime' );
	var players = fo.LoadJSON( dataDir+fo.GetPath( 'max_players' ), 'max_players' );
	var average = fo.LoadJSON( dataDir+fo.GetPath( 'average_short' ), 'average_short' );

	var chart = foCharts.CreateStackedColumn(
		'fonline',
		'chart',
		'FOnline',
		'"Everything is dead or dying"'
	);

	chart.series =
	[
		{
			name: 'Availability',
			color: fo.GetOption( 'colors', 'availability' ),
			tooltip:
			{
				valueSuffix: "%"
			},
			data: []
		},
		{
			name: 'Maximum players',
			color: fo.GetOption( 'colors', 'players' ),
			data: []
		},
		{
			name: 'Average players',
			color: fo.GetOption( 'colors', 'average' ),
			data: []
		}
	];

	var server_data = [];
	$.each( fo.GetServersArray( 'name' ), function( idx, server )
	{
		if( server.singleplayer != null && server.singleplayer == true )
			return( true ); // continue;

		var add = false, data = [];

		if( lifetime != null && lifetime.server[server.id] != null )
		{
			add = true;
			var percent = (lifetime.server[server.id].days_online * 100)/lifetime.server[server.id].days_known;
			data.push( parseInt(percent) );
		}
		else
			data.push( 0 );

		if( players != null && players.server[server.id] != null )
		{
			add = true;
			data.push( players.server[server.id].players );
		}
		else
			data.push( 0 );

		if( average != null && average.server[server.id] != null )
		{
			add = true;
			data.push( average.server[server.id] );
		}
		else
			data.push( 0 );

		if( !add )
			return( true ); // continue;

		chart.xAxis.categories.push( server.name );

		server_data.push( data );
	});

	$.each( server_data, function( idx, serverData )
	{
		$.each( serverData, function( idx, data )
		{
			chart.series[idx].data.push( data );
		});
	});
	server_data = null;

	chart = new Highcharts.Chart( chart );
}
