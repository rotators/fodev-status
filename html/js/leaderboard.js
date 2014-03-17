function start()
{
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
			data: []
		},
		{
			name: 'Maximum players',
			data: []
		},
		{
			name: 'Average players',
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
			data.push( (lifetime.server[server.id].days_online * 100)/lifetime.server[server.id].days_known );
		}
		else
			data.push( 0 );

		if( players != null && players.server[server.id] != null )
		{
			add = true;
			data.push( players.server[server.id].players );
		}

		if( average != null && average.server[server.id] != null )
		{
			add = true;
			data.push( average.server[server.id] );
		}

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

	chart = new Highcharts.Chart( chart );
}
