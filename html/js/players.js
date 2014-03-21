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
	chart.series[0].data = getData();
	chart = new Highcharts.Chart( chart );

	setInterval( update, 60000 );
	HideInfo();
	$('#footer').show();
}

function update()
{
	if( $('input[name="auto_update"]').prop('checked') )
	{
		var data = getData();
		chart.series[0].setData( data, true );
	}
}

function getData( year, month, day )
{
	if( !fo.LoadConfig( configFile ))
		return;

	var url = dataDir;
	
	if( year != null && month != null && day != null )
		url += fo.GetPath( 'day_summary', { YEAR: year, MONTH: month, DAY: day });
	else
		url += fo.GetPath( 'status' );

	var seriesData = [];

	var jsonData = fo.LoadJSON( url, 'status' );
	if( jsonData != null && jsonData.server != null )
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
						name: fo.GetServerOption( server.id,'name' ),
						y: players
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
	};

	return( seriesData );
}
