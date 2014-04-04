/*
 * FOstatus by Rotators
 * https://github.com/rotators/fodev-status/
 *
 * @preserve
 */
function FOstatusCharts()
{
}

FOstatusCharts.prototype.ConvertTimestamp = function( timestamp )
{
	return( timestamp * 1000 );
};

FOstatusCharts.prototype.ConvertTimestampArray = function( array )
{
	var result = [];
	var self = this;

	$.each( array, function( idx, timestamp )
	{
		if( timestamp.length == 2 )
			result.push( [ self.ConvertTimestamp( timestamp[0] ), timestamp[1] ]);
		else
			console.log( 'Invalid timestamp array (idx '+idx+')' );
	});

	return( result );
};

FOstatusCharts.prototype.BaseChart = function( name, container, title, subtitle )
{
	var chart = 
	{
		chart:
		{
			animation: true,
			backgroundColor: null,
			id: name,
			renderTo: container,
			shadow: true
		},
		colors: [ '#ffffff' ],
		credits:
		{
			enabled: false
		},
		exporting:
		{
			enabled: true,
			scale: 2
		},
		legend:
		{
			enabled: true,
			backgroundColor: null,
			borderColor: null,
			itemStyle:
			{
				color: '#aeaeae'
			},
			itemHoverStyle:
			{
				color: '#fafafa' // fa proterran!
			},
			itemHiddenStyle:
			{
				color: '#5e5e5e'
			}
		},
//		loading:
//		{
//			showDuration: 1000,
//			hideDuration: 1000
//		},
		spacingLeft: 10,
		spacingRight: 10
	};

	if( title != null )
	{
		chart.title =
		{
			text: title,
			style:
			{
				color: '#fafafa',
//				fontFamily: 'JH_FalloutRegular',
//				fontSize: '10px'
			}
		};
	}

	if( subtitle != null )
	{
		chart.subtitle =
		{
			text: subtitle,
			style:
			{
				color: '#aeaeae',
//				fontFamily: 'JH_FalloutRegular',
//				fontSize: '9px'
			}
		}
	}

	return( chart );
};

FOstatusCharts.prototype.CreateTimeline = function( name, container, title, subtitle, yAxisName )
{
	var chart = this.BaseChart( name, container, title, subtitle );

	chart.chart.type = 'spline';
	chart.navigator =
	{
		enabled: true,
		series:
		{
			id: 'nav',
			type: 'areaspline',
			data: []
		}
	};
	chart.plotOptions =
	{
		series:
		{
			pointRange: 24 * 3600 * 1000,
			pointInterval: 24 * 3600 * 1000,
			connectNulls: false,
			dataGrouping:
			{
				dateTimeLabelFormats:
				{
					hour: ['%e %B %Y'],
					day: ['%e %B %Y']
				}
			},
			shadow: true
		}
	};
	chart.rangeSelector =
	{
		enabled: true,
		selected: 5,
		buttonTheme:
		{
			fill: 'none',
			stroke: '#c0c0c0',
			style:
			{
				color: '#c0c0c0'
			},
			states:
			{
				hover:
				{
					fill: 'none',
					stroke: '#c0c0c0',
					style:
					{
						color: '#ffffff'
					}
				},
				select:
				{
					fill: '#c0c0c0',
					stroke: '#c0c0c0',
					style:
					{
						color: '#000000'
					}
				}
			}
		},
		inputDateFormat: '%e %b %Y',
		inputEditDateFormat: '%d.%m.%Y',
		inputDateParser: function( value )
		{
			// what a crap
			value = value.split('.');
			return( new Date(
				parseInt(value[2]),
				parseInt(value[1])-1,
				parseInt(value[0])+1
			));
		},
		inputStyle:
		{
			color: '#aaaaaa'
		}
	};
	chart.scrollbar =
	{
		rifleColor: '#191919',
		trackBackgroundColor: 'none',
		trackBorderColor: 'none',
	}
	chart.spacingLeft = 10;
	chart.spacingRight = 10;
	chart.tooltip =
	{
		shared: true,
		xDateFormat: '%e %B %Y'
	};
	chart.xAxis =
	{
		type: 'datetime',
	};
	chart.yAxis =
	{
		min: 0,
		lineWidth: 1
	};

	if( yAxisName != null )
	{
		chart.yAxis.title =
		{
			text: yAxisName
		};
	}

	return( chart );
}

FOstatusCharts.prototype.BuildTimeline = function( args, chart, path, data, callback )
{
	var self = this;

	ShowInfo( 'Preloading...' );
	fo.LoadJSONQueue( false, dataDir, ['average_short',path], function( result )
	{
		var average;
		if( result.average_short != null && result.average_short.server != null )
		{
			average = result.average_short.server;
		}

		if( result.history != null )
		{
			ShowInfo( 'Loading summary...' );
			chart.get( 'nav' ).setData( self.ConvertTimestampArray( result.history ));
			chart.get( 'nav' ).xAxis.setExtremes();
		}
		result = null;

		var request = [];
		ShowInfo( 'Checking arguments...' );
		$.each( fo.GetServersArray( 'name' ), function( idx, server )
		{
			if( average != null && average[server.id] == null )
				return( true ); // continue;

			var add = false;

			if( args.length == 0 )
				add = true;
			else if( args.length > 0 && $.inArray( server.id, args ) >= 0 )
				add = true;

			if( server.singleplayer != null && server.singleplayer )
				add = false;

			if( add )
				request.push( server.id );
		});

		if( request.length == 0 )
		{
			var url = rootDir+'/'+path+'/';
			if( window.location != url )
			{
				console.log( 'Redirecting: '+url );
				window.location = url;
			}
		}

		var queue = [];
		ShowInfo( 'Loading servers data...' );
		$.each( request, function( idx, serverId )
		{
			queue.push( fo.LoadJSON( dataDir+fo.GetPath( 'server_'+path, { ID: serverId }), 'server_'+path, function( result )
			{
				var seriesOptions = {
					id: serverId,
					index: idx,
					legendIndex: idx,
					data: self.ConvertTimestampArray( result.server[serverId] )
				};

				$.each( ['name','color'], function( i, option )
				{
					var value = fo.GetServerOption( serverId, option )
					if( value != null )
						seriesOptions[option] = value;
				});

				chart.addSeries( seriesOptions, true ).xAxis.setExtremes();
			}));
		});
		$.when.apply( $, queue ).done( function()
		{
			callback();
		});
	});
};

FOstatusCharts.prototype.CreatePercentPie = function( name, container, title, subtitle, seriesName )
{
	var chart = this.BaseChart( name, container, title, subtitle );

	chart.chart.type = 'pie';

	chart.plotOptions =
	{
		pie:
		{
			borderColor: '#cacaca',
			allowPointSelect: true,
			cursor: 'pointer',
			dataLabels:
			{
				enabled: true,
				format: '<span style="fill: {point.color}">{point.name}</span> ({point.percentage:.1f}%)'
			},
			showInLegend: true
		}
	};
	chart.tooltip =
	{
		pointFormat: '{series.name}: <strong>{point.y}</strong>'
	};
	chart.series =
	[{
		type: 'pie',
	}];

	if( seriesName != null )
		chart.series[0].name = seriesName;

	return( chart );
}

FOstatusCharts.prototype.CreateStackedColumn = function( name, container, title, subtitle )
{
	var chart = this.BaseChart( name, container, title, subtitle );

	chart.chart.type = 'column';

	chart.xAxis =
	{
		categories: []
	};
	chart.plotOptions =
	{
		column:
		{
			stacking: 'normal'
		}
	};

	return( chart );
}

FOstatusCharts.prototype.GetVisibleSeries = function( chart )
{
	var result = [];

	$.each( chart.series, function( idx, series )
	{
		if( !series.visible )
			return( true ); // continue;

		if( series.options == null )
			return( true ); // continue;

		if( series.options.isInternal != null && series.options.isInternal )
			return( true ); // continue;

		if( series.options.id != null )
			result.push( series.options.id );
	});

	result.sort();

	return( result );
};

FOstatusCharts.prototype.GetHiddenSeries = function( chart )
{
	var result = [];

	$.each( chart.series, function( idx, series )
	{
		if( series.visible )
			return( true ); // continue;

		if( series.options == null )
			return( true ); // continue;

		if( series.options.isInternal != null && series.options.isInternal )
			return( true ); // continue;

		if( series.options.id != null )
			result.push( series.options.id );
	});

	result.sort();

	return( result );
};
