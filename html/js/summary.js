function start()
{
	if( !fo.LoadConfig( configFile ))
		return;

	var chart = foCharts.CreateTimeline( 'fonline', 'chart' );

	chart.navigator =
	chart.scrollbar = 
	{ enabled: false };

	chart = Highcharts.StockChart( chart );

	ShowInfo( 'Loading history...' );
	fo.LoadJSON( dataDir+fo.GetPath( 'history' ), 'history', function( jsonData )
	{
		var seriesOptions = {
			data: foCharts.ConvertTimestampArray( jsonData ),
			name: 'Players',
			id: 'players',
			color: fo.GetOption( 'colors', 'players' )
		};

		chart.addSeries( seriesOptions, true ).update();
	});

	ShowInfo( 'Loading average...' );
	fo.LoadJSON( dataDir+fo.GetPath( 'average' ), 'average', function( jsonData )
	{
		var seriesOptions = {
			data: foCharts.ConvertTimestampArray( jsonData ),
			name: 'Average',
			id: 'average',
			color: fo.GetOption( 'colors', 'average' )
		};

		chart.addSeries( seriesOptions, true ).update();
	});

	ShowInfo( 'Loading records...' );
	fo.LoadJSON( dataDir+fo.GetPath( 'max_players' ), 'max_players', function( jsonData )
	{
		var seriesOptions =
		{
			data: [],
			type: 'flags',
			shape: 'squarepin',
			onSeries: 'players',
			name: 'Servers records',
			color: fo.GetOption( 'colors', 'record' )
		};
		var records = [];

		$.each( fo.GetServersArray( 'name' ), function( idx, server )
		{
			if( jsonData.server[server.id] == null )
				return( true ); // continue;

			var flagId = 'record-'+server.id;

			var data =
			{
				id: flagId,
				x: foCharts.ConvertTimestamp( jsonData.server[server.id].timestamp ),
				title: server.name+ ' record',
				text: server.name+': '+jsonData.server[server.id].players
			};

			records.push( flagId );

			$.each( ['color'], function( idx, option )
			{
				var value = fo.GetServerOption( server.id, option );
				if( value != null )
					data[option] = value;
			});

			seriesOptions.data.push( data );

		});

		if( seriesOptions.data.length > 0 )
		{
			// avoid highcharts error 15
			seriesOptions.data.sort( function( a, b )
			{
				if( a.x == b.x )
					return( 0 );

				return( a.x > b.x ? 1 : -1 );
			});
			chart.addSeries( seriesOptions, true ).update();
		}
	});
	ShowInfo( 'Finishing...' );
	chart.redraw();
	HideInfo();
	console.log( Highcharts );
}
