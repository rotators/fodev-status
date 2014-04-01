function start()
{
	ShowInfo( 'Loading...' );

	$('#chart').empty();

	fo.LoadConfig( configFile, function()
	{
		fo.LoadJSON( dataDir+fo.GetPath( 'librarian' ), 'librarian', function( jsonData )
		{
			var modServer = false, total_out = 0, total_in = 0;

			if( $.inArray( 'Server', siteModules ) >= 0 )
				modServer = true;

			var table = $('<table>',
			{
				style: 'margin-left: auto; margin-right: auto;'
			});
			table.append( '<thead><tr><th>Server</th><th colspan="2">Sent</th><th colspan="2">Received</th></tr></thead>' );

			var tbody = table.append('<tbody>' );

			$.each( fo.GetServersArray( 'name' ), function( idx, server )
			{
				if( jsonData.server[server.id] == null )
					return( true ); // continue;

				total_out += jsonData.server[server.id].out;
				total_in += jsonData.server[server.id].in;

				var tr = $('<tr>' );

				if( modServer )
					tr.append( '<td><a href=\''+rootDir+'/server/'+server.id+'/\'>'+server.name+'</a></td>' );
				else
					tr.append( '<td>'+server.name+'</td>' );

				tr.append( '<td>'+jsonData.server[server.id].out+'</td>' );
				tr.append( '<td>'+bytesToSize( jsonData.server[server.id].out * 4 )+'</td>' );
				tr.append( '<td>'+jsonData.server[server.id].in+'</td>' );
				tr.append( '<td>'+bytesToSize( jsonData.server[server.id].in * 16 )+'</td>' );

				tbody.append( tr );
			});

			tbody.append
			(
				'<tr>'+
					'<td>TOTAL</td>'+
					'<td>'+total_out+'</td>'+
					'<td>'+bytesToSize( total_out * 4 )+'</td>'+
					'<td>'+total_in+'</td>'+
					'<td>'+bytesToSize( total_in * 16 )+'</td>'+
				'</tr>'
			);

			$('#chart').append( table );

			HideInfo();
		});
	});
}

function bytesToSize( bytes, precision )
{
	precision = fo.defaultArgument( precision, 2 );

	var suffixes = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

	var base = Math.floor( Math.log( bytes ) / Math.log( 1024 ));
	return( ( bytes / Math.pow( 1024, base )).toFixed(precision) + " " + suffixes[base] );
}
