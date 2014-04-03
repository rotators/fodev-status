var chart, lifetime, players, average;

function start()
{
	$('#footer').hide();
	ShowInfo( 'Loading...' );

	fo.LoadConfig( configFile, function()
	{
		chart = foCharts.CreateStackedColumn(
			'fonline',
			'chart',
			'FOnline',
			'Leaderboard'
		);

		chart.series =
		[
			{
				name: 'Availability',
				color: fo.GetOption( 'colors', 'availability' ),
				tooltip:
				{
					valueSuffix: "%"
				},
				data: []
			},
			{
				name: 'Maximum players',
				color: fo.GetOption( 'colors', 'players' ),
				data: []
			},
			{
				name: 'Average players',
				color: fo.GetOption( 'colors', 'average' ),
				data: []
			}
		];
		chart.xAxis.labels =
		{
			formatter: function()
			{
				var color = '#ffffff';
				var name = this.value;
				var server = fo.GetServerBy( 'name', name );
				if( server != null )
				{
					if( server.color != null )
						color = server.color;
				}
				return( '<span style="fill: '+color+';">'+name+'</span>' );
			}
		}

		chart = new Highcharts.Chart( chart );

		fo.LoadJSONQueue( false, dataDir, ['lifetime','max_players','average_short'], function( result )
		{
			if( result.lifetime != null )
				lifetime = result.lifetime;
			if( result.max_players != null )
				players = result.max_players;
			if( result.average_short != null )
				average = result.average_short;

			update();

			$('#show_closed').click( function()
			{
				update();
			});

			$('#footer').show();
			HideInfo();
		});
	});

}

function update()
{
	var show_closed = $('#show_closed').prop( 'checked' );

	var server_name = [];
	var server_data = [];
	$.each( fo.GetServersArray( 'name' ), function( idx, server )
	{
		if( server.singleplayer != null && server.singleplayer == true )
			return( true ); // continue;

		var add = false, data = [];

		if( lifetime != null && lifetime.server[server.id] != null )
		{
			add = true;
			var percent = (lifetime.server[server.id].days_online * 100)/lifetime.server[server.id].days_known;
			data.push( parseInt(percent) );
		}
		else
			data.push( 0 );

		if( players != null && players.server[server.id] != null )
		{
			add = true;
			data.push( players.server[server.id].players );
		}
		else
			data.push( 0 );

		if( average != null && average.server[server.id] != null )
		{
			add = true;
			data.push( average.server[server.id] );
		}
		else
			data.push( 0 );

		if( !add )
			return( true ); // continue;

		if( !show_closed && server.closed != null && server.closed == true )
			return( true ); // continue;

		server_name.push( server.name );
		$.each( data, function( idx, rData )
		{
			if( server_data[idx] == null )
				server_data.push( [] );
			server_data[idx].push( rData );
		});
	});

	chart.xAxis[0].setCategories( server_name );

	$.each( server_data, function( idx, serverData )
	{
		chart.series[idx].setData( serverData, true );
	});
}
