function FOstatus()
{
	this.Config = null;
};

FOstatus.prototype.defaultArgument = function( arg, val  ) // helper
{
	return( typeof arg !== 'undefined' ? arg : val );
};

FOstatus.prototype.ExtractSeconds = function( seconds ) // helper
{
	var extract = function( need )
	{
		var result = 0;
		if( seconds >= need )
		{
			result = Math.floor( seconds / need );
			seconds -= result * need;
		}
		return( result );
	};

	var years   = extract( 60 * 60 * 24 * 7 * 4 * 12 );
	var months  = extract( 60 * 60 * 24 * 7 * 4 );
	var weeks   = extract( 60 * 60 * 24 * 7 );
	var days    = extract( 60 * 60 * 24 );
	var hours   = extract( 60 * 60 );
	var minutes = extract( 60 );

	return( [years,months,weeks,days,hours,minutes,seconds] );
};

FOstatus.prototype.LoadJSON = function( url, type, callback ) // helper
{
	var err = '[LoadJSON] Can\'t load '+(type != null ? type+' @ ' : '')+url+' : ';

	if( url == null )
	{
		console.log( '[LoadJSON] URL not defined' );
		return( null );
	}
	else if( type == null )
	{
		console.log( err+'data type not defined' );
		return( null );
	}
	else if( callback == null )
	{
		console.log( err+'callback not defined' );
		return( null );
	}
	else if( this.JSONLoader == null )
	{
		console.log( err+"JSONLoader not defined" );
		return( null );
	}

	var request = this.JSONLoader( url, function( data )
	{
		if( data.fonline == null )
			console.log( err+'Missing data->fonline' );
		else if( data.fonline[type] == null )
			console.log( err+'Missing data->fonline->'+type )
		else
			callback( data.fonline[type] );
	});

	return( request );
};

FOstatus.prototype.LoadConfig = function( url, callback )
{
	var err = '[LoadConfig] ';

	if( url == null )
	{
		if( this.ConfigURL == null )
		{
			console.log( err+'URL not defined' );
			return( null );
		}
		else
			url = this.ConfigURL;
	}
	var self = this;
	this.Config = null;

	var request = this.LoadJSON( url, 'config', function( data )
	{
		self.Config = data;

		if( callback != null )
			callback();
	});

	return( request );
};

FOstatus.prototype.CheckConfig = function( data, skip_base )
{
	if( data == null )
	{
		console.log( "CheckConfig: data is null" );
		return( false );
	}

	skip_base = this.defaultArgument( skip_base, false );

	var config = null;

	if( skip_base )
	{
		console.log( "CheckConfig: skipping base structure check" );
		config = data;
	}
	else
	{
		if( data.fonline == null )
		{
			console.log( "CheckConfig: missing fonline" );
			return( false );
		}

		if( data.fonline.config == null )
		{
			console.log( "CheckConfig: missing fonline::config" )
			return( false );
		}

		config = data.fonline.config
	}

	if( config.server == null )
	{
		console.log( "CheckConfig: missing fonline::config::server" );
		return( false );
	}

	for( id in config.server )
	{
		var server = config.server[id];

		if( server.name == null )
		{
			console.log( "CheckConfig: missing fonline::config::server::"+idx+"::name" );
			return( false );
		}

		if( server.host != null && server.port == null )
		{
			console.log( "CheckConfig: fonline::config::server::"+id+" : host set, port is null" );
			return( false );
		}

		if( server.host == null && server.port != null )
		{
			console.log( "CheckConfig: fonline::config::server::"+id+" : host is null, port is set" );
			return( false );
		}

		if( server.irc != null && server.irc.charAt(0) != '#' )
		{
			console.log( "CheckConfig: fonline::config::server::"+id+" : irc channel does not start with '#'" );
			return( false );
		}

		if( server.color != null )
		{
			if( server.color.charAt(0) != '#' )
			{
				console.log( "CheckConfig: fonline::config::server::"+id+" : color does not start with '#'" );
				return( false );
			}

			if( server.color.length != 7 )
			{
				console.log( "CheckConfig: fonline::config::server::"+id+" : invalid color length" );
				return( false );
			}
		}
	}

	console.log( "CheckConfig: OK" );
	return( true );
};

FOstatus.prototype.GetServer = function( id )
{
	if( id == null )
		return( null );

	if( this.Config != null && this.Config.server != null && this.Config.server[id] != null )
	{
		var server = this.Config.server[id];
		server.id = id;

		return( server );
	}

	return( null );
};

FOstatus.prototype.GetServerBy = function( property, value )
{
	if( property == null || value == null )
		return( null );

	if( this.Config != null && this.Config.server != null )
	{
		for( id in this.Config.server )
		{
			var server = this.Config.server[id];

			if( server[property] != null )
			{
				if( server[property] == value )
				{
					server.id = id;
					
					return( server );
				}
			}
		}
	}

	return( null );
};

FOstatus.prototype.GetOption = function( category, option )
{
	if( category == null || option == null )
		return( null );

	if( this.Config == null || this.Config[category] == null )
		return( null );

	if( this.Config[category][option] != null )
		return( this.Config[category][option] );

	return( null );
};

FOstatus.prototype.GetServerOption = function( id, option )
{
	if( id == null || option == null )
		return( null );

	var server = this.GetServer( id );

	if( server != null && server[option] != null )
		return( server[option] );

	return( null );
};

FOstatus.prototype.GetServersArray = function( sorting, ascending )
{
	sorting = this.defaultArgument( sorting, null );
	ascending = this.defaultArgument( ascending, true );

	var servers = [];

	if( this.Config != null && this.Config.server != null )
	{
		for( id in this.Config.server )
		{
			var copy = this.Config.server[id];
			copy.id = id;
			servers.push( copy );
		}
	}

	if( sorting != null )
	{
		servers = servers.sort( function( a, b )
		{
			if( a[sorting] == b[sorting] )
				return( 0 );

			if( ascending )
				return( a[sorting].toLowerCase() > b[sorting].toLowerCase() ? 1 :  -1 );
			else
				return( b[sorting].toLowerCase() > a[sorting].toLowerCase() ? 1 :  -1 );
		});
	}

	return( servers );
};

FOstatus.prototype.GetPath = function( name, args )
{
	if( name == null )
		return( null );

	var result = null;

	if( this.Config != null && this.Config.files != null && this.Config.files[name] != null )
	{
		result = this.Config.files[name];
		if( this.Config.dirs != null )
		{
			for( id in this.Config.dirs )
			{
				result = result.replace( '{DIR:'+id+'}', this.Config.dirs[id] );
			}
		}
		if( args != null )
		{
			for( id in args )
			{
				result = result.replace( '{'+id+'}', args[id] );
			}
		}
	}

	return( result );
};

//
// Frameworks extras
//

if( typeof(window.jQuery) !== 'undefined' )
{
	FOstatus.prototype.JSONLoader = function( url, callback )
	{
		var request = $.ajax({ dataType: 'json', url: url, async: true,
		success: function( data )
		{
			if( callback != null )
				callback( data );
		},
		error: function( jqXHR, textStatus, errorThrown )
		{
			console.log( '[JSONLoader:jQuery] ERROR : '+url+' : '+textStatus+' : '+errorThrown );
		}});

		return( request );
	};

	FOstatus.prototype.LoadJSONQueue = function( resetConfig, dataPath, requests, callback )
	{
		var self = this;
		var startJSONQueue = function()
		{
			var queue = [], result = {};
			$.each( requests, function( idx, id ) // for()... don't!
			{
				var params = {};

				var req = id.split( ':', 2 );
				if( req.length > 1 )
				{
					var arg = req[1].split( ',' );
					$.each( arg, function( iidx, val )
					{
						var pa = val.split( '=' );
						if( pa.length == 2 )
							params[pa[0]] = pa[1];
					});
				}

				var path = self.GetPath( req[0], params );
				if( path == null )
				{
					result[id] = null;
					return( true ); // continue;
				}

				queue.push( self.LoadJSON( dataPath+path, req[0], function( data )
				{
					result[id] = data;
				}));
			});
			$.when.apply( $, queue ).done( function()
			{
				callback( result );
			});
		};

		if( this.Config == null || resetConfig )
		{
			if( this.ConfigURL == null )
				return;
			else
				this.LoadConfig( null, startJSONQueue );
		}
		else
			startJSONQueue();
	};
}
else if( typeof(window.Prototype) !== 'undefined' )
{
	FOstatus.prototype.JSONLoader = function( url, callback )
	{
		var result = null;

		new Ajax.Request( url, { method: 'get', asynchronous: true,
		onCreate: function( response )
		{
			var transport = response.transport; 
			transport.setRequestHeader = transport.setRequestHeader.wrap( function( original, k, v )
			{
				if( /^(accept|accept-language|content-language)$/i.test( k ))
					return( original( k, v ));
				return;
			});
		},
		onComplete: function( data )
		{
			if( callback != null && data.responseJSON != null )
				callback( data.responseJSON );
		},
		onFailure: function( data )
		{
			console.log( '[JSONLoader:prototype] ERROR : '+url+' : '+data.statusText );
		}});
	}
}
/*
else if( typeof(window.MooTools) !== 'undefined' )
{
	// This is not json loader, this is just a tribute;
	// MooTools does not (?) allow loading json from other domain

	FOstatus.prototype.JSONLoader = function( url, callback )
	{
		var request = new Request.JSON({ url: url, method: 'get', async: true,
		onSuccess: function( data )
		{
			if( data != null )
				callback( data );
		}
		}).send();
	};
}
*/
