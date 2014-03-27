var chart = null;

function start()
{
	$('#footer').hide();
	ShowInfo( 'Loading' );
	chart = foCharts.CreatePercentPie(
		'fonline',
		'chart',
		'FOnline',
		'Players distribution',
		'Players'
	);

	chart.chart.originalName = chart.chart.name;

	// set data before creating chart for fancy initial animation
	getData( function( data )
	{
		chart.series[0].data = data;
		chart = new Highcharts.Chart( chart );

		setInterval( update, 10000 );
		HideInfo();
		$('#footer').show();
	});
}

function update()
{
	if( $('input[name="auto_update"]').prop('checked') )
	{
		getData( function( data )
		{
			$.each( data, function( idx, pointData )
			{
				var point = chart.get( pointData.id );
				if( point != null )
				{
					point.update( pointData, true );
				}
				else
					chart.series[0].addPoint( pointData, true );
			});
		});
	}
}

function getData( callback, year, month, day )
{
	if( callback == null )
		return;

	fo.LoadConfig( configFile, function()
	{
		var url = dataDir;

		if( year != null && month != null && day != null )
			url += fo.GetPath( 'day_summary', { YEAR: year, MONTH: month, DAY: day });
		else
			url += fo.GetPath( 'status' );

		var seriesData = [];

		fo.LoadJSON( url, 'status', function( jsonData )
		{
			$.each( fo.GetServersArray('name'), function( idx, server )
			{
				if( jsonData.server[server.id] != null )
				{
					var players = parseInt( jsonData.server[server.id].players );
					if( players > 0 )
					{
						var data = {
							id: server.id,
							name: fo.GetServerOption( server.id, 'name' ),
							y: players,
							legendIndex: idx
						};

						var options = ['color'];
						$.each(options, function(i,option)
						{
							var value = fo.GetServerOption( server.id, option );
							if( value != null )
								data[option] = value;
						});

						seriesData.push( data );
					}
				};
			});

			callback( seriesData );
		});
	});
}
