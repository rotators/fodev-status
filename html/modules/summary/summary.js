function start()
{
	var chart = foCharts.CreateTimeline( 'fonline', 'chart' );

	chart.navigator =
	chart.scrollbar = 
	{ enabled: false };

	chart = Highcharts.StockChart( chart );

	fo.LoadConfig( configFile, function()
	{
		var queue = [];
		ShowInfo( "Loading data..." );

		queue.push( fo.LoadJSON( dataDir+fo.GetPath( 'servers' ), 'servers', function( jsonData )
		{
			var seriesOptions = {
				data: foCharts.ConvertTimestampArray( jsonData ),
				name: 'Servers',
				id: 'servers',
				index: 0,
				legendIndex: 0,
				color: fo.GetOption( 'colors', 'servers' )
			};

			chart.addSeries( seriesOptions, true ).update();
		}));

		queue.push( fo.LoadJSON( dataDir+fo.GetPath( 'history' ), 'history', function( jsonData )
		{
			var seriesOptions = {
				data: foCharts.ConvertTimestampArray( jsonData ),
				name: 'Players',
				id: 'players',
				index: 1,
				legendIndex: 1,
				color: fo.GetOption( 'colors', 'players' )
			};

			chart.addSeries( seriesOptions, true ).update();
		}));

		queue.push( fo.LoadJSON( dataDir+fo.GetPath( 'average' ), 'average', function( jsonData )
		{
			var seriesOptions = {
				data: foCharts.ConvertTimestampArray( jsonData ),
				name: 'Average',
				id: 'average',
				index: 2,
				legendIndex: 2,
				color: fo.GetOption( 'colors', 'average' )
			};

			chart.addSeries( seriesOptions, true ).update();
		}));

		queue.push( fo.LoadJSON( dataDir+fo.GetPath( 'max_players' ), 'max_players', function( jsonData )
		{
			var seriesOptions =
			{
				data: [],
				type: 'flags',
				shape: 'squarepin',
				onSeries: 'players',
				legendIndex: 3,
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
		}));

		$.when.apply( $, queue ).done( function()
		{
			ShowInfo( 'Finishing...' );
			chart.redraw();
			chart.reflow();
			HideInfo();
		});
	});
}
