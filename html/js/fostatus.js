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
	var result = null;

	if( url == null )
	{
		console.log( '[LoadJSON] URL not defined' );
		return( result );
	}

	if( type == null && callback == null )
	{
		console.log( err+'data type and/or callback must be defined' );
		return( result );
	}

	if( this.JSONLoader == null )
	{
		console.log( err+"JSONLoader not defined" );
		return( result );
	}

	var data = this.JSONLoader( url );

	if( data == null )
	{
		console.log( err+'Empty data' );
		return( result );
	}

	if( type != null )
	{
		if( data.fonline == null )
			console.log( err+'Missing data->fonline' );
		else if( data.fonline[type] == null )
			console.log( err+'Missing data->fonline->'+type )
		else
		{
			if( callback != null )
				result = callback( data.fonline[type] );
			else
				result = data.fonline[type];
		}
	}
	else if( callback != null )
		result = callback( data );

	return( result );
};

FOstatus.prototype.LoadConfig = function( url )
{
	if( url == null )
		return( false );

	var result = false, self = this;
	this.Config = null;

	this.LoadJSON( url, 'config', function( data )
	{
		self.Config = data;
		result = true;
	});

	return( result );
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

if( typeof(window.jQuery) !== 'undefined' )
{
	FOstatus.prototype.JSONLoader = function( url )
	{
		var result = null;

		$.ajax({ dataType: 'json', url: url, async: true,
		success: function( data )
		{
			result = data;
		},
		error: function( jqXHR, textStatus, errorThrown )
		{
			console.log( '[JSONLoader:jQuery] ERROR : '+textStatus+' : '+errorThrown );
		}});

		return( result );
	};
}
else if( typeof(window.Prototype) !== 'undefined' )
{
	FOstatus.prototype.JSONLoader = function( url )
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
			if( data.responseJSON != null )
				result = data.responseJSON;
		},
		onFailure: function( data )
		{
			console.log( '[JSONLoader:prototype] ERROR : '+data.statusText );
		}});

		return( result );
	}
}
/*
else if( typeof(window.MooTools) !== 'undefined' )
{
	// This is not json loader, this is just a tribute;
	// MooTools does not (?) allow loading json from other domain

	FOstatus.prototype.JSONLoader = function( url )
	{
		var result = null;

		var request = new Request.JSON({ url: url, method: 'get', async: false,
		onSuccess: function( data )
		{
			result = data;
		}
		}).send();

		return( result );
	};
}
*/
