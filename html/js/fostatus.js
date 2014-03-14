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
		var res = 0;
		if( seconds >= need )
		{
			res = Math.floor( seconds / need );
			seconds -= res * need;
		}
		return( res );
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
	if( url == null || (type == null && callback == null) )
		return( null );

	var result = null;

	var err = '[LoadJSON] Can\'t load '+(type != null ? type+' @ ' : '')+url+' : ';
	$.ajax({ dataType: 'json', url: url, async: false,
	success: function( data )
	{
		if( data == null )
			console.log( err+'Missing data' );

		if( type != null )
		{
			if( data.fonline == null )
				console.log( err+'Missing data->fonline' );
			else if( data.fonline[type] == null )
				console.log( err+'Missing data->fonline->'+type )
			else
			{
				if( callback != null )
					callback( data.fonline[type] );
				else
					result = data.fonline[type];
			}
		}
		else if( callback != null )
			callback( data );
	},
	error: function( jqXHR, textStatus, errorThrown )
	{
		console.log( err+textStatus+' : '+errorThrown );
	}});

	return( result );
};

FOstatus.prototype.LoadConfig = function( url )
{
	if( url == null )
		return( false );

	var result = false;
	this.Config = null;

	var data = this.LoadJSON( url, 'config' );
	if( data != null )
	{
		this.Config = data;
		result = true;
	}

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

	var result = null, config = null;

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

	$.each( config.server, function( idx, server )
	{
		if( server.name == null )
		{
			console.log( "CheckConfig: missing fonline::config::server::"+idx+"::name" );
			result = false;
			return( false ); // break;
		}

		if( server.host != null && server.port == null )
		{
			console.log( "CheckConfig: fonline::config::server::"+id+" : host set, port is null" );
			result = false;
			return( false ); // break;
		}

		if( server.host == null && server.port != null )
		{
			console.log( "CheckConfig: fonline::config::server::"+id+" : host is null, port is set" );
			result = false;
			return( false ); // break;
		}
	});

	if( result != null )
		return( result )

	console.log( "CheckConfig: OK" );
	return( true );
}

FOstatus.prototype.GetServer = function( want_id )
{
	if( want_id == null )
		return( null );

	var result = null;

	if( this.Config != null && this.Config.server != null )
	{
		$.each( this.Config.server, function( id, server )
		{
			if( id == want_id )
			{
				result = server;
				result.id = id;

				return( result );
			}
		});
	}

	return( result );
};

FOstatus.prototype.GetServerOption = function( server_id, option )
{
	if( server_id == null || option == null )
		return( null );

	var server = this.GetServer( server_id );

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
		$.each( this.Config.server, function( id, server )
		{
			var copy = server;
			copy.id = id;
			servers.push(copy);
		});
	}

	if( sorting != null )
	{
		servers = servers.sort( function( a, b )
		{
			if( ascending )
				return (a[sorting] > b[sorting]) ? 1 : ((a[sorting] < b[sorting]) ? -1 : 0);
			else
				return (b[sorting] > a[sorting]) ? 1 : ((b[sorting] < a[sorting]) ? -1 : 0);
		});
	}

	return( servers );
};

FOstatus.prototype.GetPath = function( name, args )
{
	if( name == null )
		return( null );

	var result = null;

	if( this.Config != null && this.Config.files != null )
	{
		if( this.Config.files[name] != null )
		{
			result = this.Config.files[name];
			if( this.Config.dirs != null )
			{
				$.each( this.Config.dirs, function( id, value )
				{
					result = result.replace( '{DIR:'+id+'}', value );
				});
			}
			if( args != null )
			{
				$.each( args, function( id, value )
				{
					result = result.replace( '{'+id+'}', value );
				});
			}
		}
	}

	return( result );
};

// ""debug""

if( $ != null )
{
	$(document).ajaxSend( function( event, jqxhr, settings )
	{
		console.log( 'Loading: '+settings.url );
	});
}
