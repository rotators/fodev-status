function start( /* servers */ )
{
	var args = arguments;

	$('#footer').hide();
	$('#remove_hidden').click( function()
	{
		var hidden = foCharts.GetVisibleSeries( chart );
		if( hidden.length > 0 )
		{
			var visible = foCharts.GetVisibleSeries( chart );
			var url = rootDir+'/average/'+visible.join(',')+(visible.length>0?'/':'');

			console.log( 'Redirecting: '+url );
			window.location = url;
		}
	});

	var rawNames = ['*']; // navigator series

	if( !fo.LoadConfig( configFile ))
		return;

	$.each( fo.GetServersArray( 'name' ), function( idx, server )
	{
		var add = false;

		if( args.length == 0 )
			add = true;
		else if( args.length > 0 && $.inArray( server.id, args ) >= 0 )
			add = true;

		if( server.singleplayer != null && server.singleplayer == true )
			add = false;

		if( add )
			rawNames.push( server.id );
	});

	if( rawNames.length == 1 )
	{
		var url = rootDir+'/average/';
		console.log( 'Redirecting: '+url );
		window.location = url;
	}

	var chart = foCharts.CreateTimeline(
		'fonline',
		'chart',
		'FOnline',
		'"Everything is dead or dying"',
		'Maximum players'
	);

	chart = Highcharts.StockChart( chart );

	$.each( rawNames, function( idx, id )
	{
		var info = fo.GetServerOption( id, 'name' );
		if( info == null )
			info = 'summary';

		ShowInfo( 'Loading '+info+'... ('+(idx+1)+'/'+rawNames.length+')' );

		if( info != 'summary' )
		{
			var singleplayer = fo.GetServerOption( id, 'singleplayer' );
			if( singleplayer != null && singleplayer == true )
				return( true ); // continue;
		}
		
		var url = dataDir, ident = 'average', options = {};
		if( id != '*' )
		{
			ident = 'server_'+ident;
			options = { ID: id };
		}
		url += fo.GetPath( ident, options );

		fo.LoadJSON( url, ident, function( jsonData )
		{
			var seriesOptions = {
				id: id,
				index: idx,
				legendIndex: idx,
			};

			var series;
			if( id == '*' )
			{
				series = chart.get('nav');
				if( series )
					series.setData( foCharts.ConvertTimestampArray( jsonData ), true );
			}
			else
			{
				seriesOptions.data = foCharts.ConvertTimestampArray( jsonData.server[id] );
				// get exta options from config
				$.each( ['name','color'], function( i, option )
				{
					var value = fo.GetServerOption( id, option );
					if( value != null )
						seriesOptions[option] = value;
				});

				series = chart.addSeries( seriesOptions, false );
			}

			if( series )
			{
				series.update();
				series.xAxis.setExtremes();
			}
		});
	});

	ShowInfo( 'Loaded' );
	chart.reflow();
	HideInfo();
	$('#footer').show();
}
