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
			id: name,
			renderTo: container,
			shadow: true,
			animation: true,
			backgroundColor: null
		},
		credits:
		{
			enabled: false
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
		loading:
		{
			showDuration: 1000,
			hideDuration: 1000
		},
		exporting:
		{
			enabled: true,
			scale: 2
		},
		spacingLeft: 10,
		spacingRight: 10,
	};

	if( title != null )
	{
		chart.title =
		{
			text: title,
			style:
			{
				color: '#00FF00'
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
				color: '#00AA00'
			}
		}
	}

	return( chart );
};

FOstatusCharts.prototype.CreateTimeline = function( name, container, title, subtitle, yAxisName )
{
	var chart = this.BaseChart( name, container, title, subtitle );
	chart.chart.type = 'spline';

	chart.spacingLeft = 10;
	chart.spacingRight = 10;
	chart.rangeSelector = {
		enabled: true,
		selected: 5
	};
	chart.yAxis = {
		min: 0,
		lineWidth: 1
	};

	chart.tooltip = {
		shared: true
	};
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
			shadow: true
		}
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

FOstatusCharts.prototype.CreatePercentPie = function( name, container, title, subtitle, seriesName )
{
	var chart = this.BaseChart( name, container, title, subtitle );

	chart.chart.type = 'pie';

	chart.plotOptions =
	{
		pie: {
			borderColor: '#cacaca',
			allowPointSelect: true,
			cursor: "pointer",
			dataLabels: {
				enabled: true,
				format: "{point.name} ({point.percentage:.1f}%)"
			},
			showInLegend: true
		}
	};
	chart.tooltip = {
		pointFormat: "{series.name}: <strong>{point.y}</strong>"
	};
	chart.series = [{
		type: 'pie',
	}];

	if( seriesName != null )
		chart.series[0].name = seriesName;

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

		if( series.options.isInternal != null && series.options.isInternal == true )
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

		if( series.options.isInternal != null && series.options.isInternal == true )
			return( true ); // continue;

		if( series.options.id != null )
			result.push( series.options.id );
	});

	result.sort();

	return( result );
};
