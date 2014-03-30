function start()
{
	ShowInfo( 'Loading...' );

	$('#chart').empty();

	fo.LoadConfig( configFile, function()
	{
		fo.LoadJSON( dataDir+fo.GetPath( 'librarian' ), 'librarian', function( jsonData )
		{
			var pings = 0;
			var table = $('<table>',
			{
				style: 'margin-left: auto; margin-right: auto;'
			});
			table.append( '<thead><tr><th>Server</th><th>Pings</th><th>Sent</th><th>Received</th></tr></thead>' );

			var tbody = table.append('<tbody>' );

			$.each( fo.GetServersArray( 'name' ), function( idx, server )
			{
				if( jsonData.server[server.id] == null )
					return( true ); // continue;

				pings += jsonData.server[server.id];

				var tr = $('<tr>' );

				// we have to assume that Server module is loaded
				tr.append( '<td><a href=\''+rootDir+'/server/'+server.id+'/\'>'+server.name+'</a></td>' );
				tr.append( '<td>'+jsonData.server[server.id]+'</td>' );
				tr.append( '<td>'+bytesToSize( jsonData.server[server.id] * 4 )+'</td>' );
				tr.append( '<td>'+bytesToSize( jsonData.server[server.id] * 16 )+'</td>' );

				tbody.append( tr );
			});

			tbody.append
			(
				'<tr>'+
					'<td></td>'+
					'<td>'+pings+'</td>'+
					'<td>'+bytesToSize( pings * 4 )+'</td>'+
					'<td>'+bytesToSize( pings * 16 )+'</td>'+
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
