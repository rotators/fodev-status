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

	if( !fo.LoadConfig( configFile ))
	{
		ShowInfo( 'Invalid config file' );
		return;
	}

	if( fo.GetServerOption( id, 'id' ) == null )
	{
		ShowInfo( 'Invalid server id' );
		return;
	}

	// try to load server logo
	$.ajax({ url: rootDir+'/gfx/logo/'+id+'.png', type: 'HEAD',
	success: function()
	{
		$( '<img>',
		{
			src: rootDir+'/gfx/logo/'+id+'.png',
			alt: fo.GetServerOption( id, 'name' )
		}).appendTo( '#logo' );
	},
	error: function()
	{
		// this one must be generated server-side before accessing page
		$( '<img>',
		{
			src: rootDir+'/gfx/cache/'+id+'.logo-placeholder.png',
			alt: fo.GetServerOption( id, 'name' )
		}).appendTo( '#logo' );
	}});

	// add a server link (if a available)
	var link = null;
	$.each( ['website','link'], function( idx, weblink )
	{
		var value = fo.GetServerOption( id, weblink );
		if( value != null )
		{
			$( '<a>', { href: value, text: value }).appendTo( '#link' );
			return( false ); // break;
		}
	});

	var chart = foCharts.CreateTimeline( 'fonline', 'chart' );
	chart.chart.height = 300;
	chart.scrollbar = 
//	chart.legend =
	chart.navigator =
	chart.rangeSelector =
	{ enabled: false };

	chart = new Highcharts.StockChart( chart );

	var setup = {
		server_history:
		{
			name: 'Players',
			color: '#4f83b0',
		},
		server_average:
		{
			name: 'Average',
			color: '#45ab89'
		},
		max_players:
		{
			name: 'Server record',
			color: '#b1000d',
			extract: true,
			series: 'server_history',
		},
	};

	$.each( setup, function( idx, config )
	{
		ShowInfo( 'Loading '+config.name.toLowerCase()+'...' );

		var seriesOptions = null;

		if( config.extract != null && config.extract == true )
		{
			fo.LoadJSON( dataDir+fo.GetPath( idx ), idx, function( jsonData )
			{
				var serverMax = jsonData.server[id].players;
				seriesOptions = {
					data: [{
						x: foCharts.ConvertTimestamp( jsonData.server[id].timestamp ),
						title: config.name+": "+serverMax
					}],
					type: 'flags',
					shape: 'flag',
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
			});
		}
		else
		{
			fo.LoadJSON( dataDir+fo.GetPath( idx, { ID: id }), idx,
			function( jsonData )
			{
				seriesOptions = {
					data: foCharts.ConvertTimestampArray( jsonData.server[id] ),
					id: idx
				};
			});
		}

		if( seriesOptions != null )
		{
			if( config.name != null )
				seriesOptions.name = config.name;
			if( config.color != null )
				seriesOptions.color = config.color;

			series = chart.addSeries( seriesOptions, false );

			if( series != null )
			{
				series.update();
				series.xAxis.setExtremes();
			}
		}
	});

	chart.redraw();
	HideInfo();
	$('#footer').show();
};
