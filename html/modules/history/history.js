function start( /* servers */ )
{
	var args = arguments;
	fo.ConfigURL = configFile;

	$('#footer').hide();
	$('#remove_hidden').click( function()
	{
		var hidden = foCharts.GetHiddenSeries( chart );
		if( hidden.length > 0 )
		{
			var visible = foCharts.GetVisibleSeries( chart );
			var url = rootDir+'/history/'+visible.join(',')+(visible.length>0?'/':'');

			// TODO: remove series from chart and use history.pushState() instead?
			console.log( 'Redirecting: '+url );
			window.location = url;
		}
	});

	var chart = foCharts.CreateTimeline(
		'fonline',
		'chart',
		'FOnline',
		'Maximum players over time',
		'Maximum players'
	);

	chart = Highcharts.StockChart( chart );

	fo.LoadConfig( configFile, function()
	{
		foCharts.BuildTimeline( args, chart, 'history', 'server_history', function()
		{
			ShowInfo( 'Loaded' );
			chart.redraw();
			chart.reflow();
			HideInfo();
			$('#footer').show();
		});
	});
}
