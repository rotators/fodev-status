<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

include_once( '../fodev.php' );

class FOstatusUI
{

	private static $Slim = NULL;
	private static $Root = NULL;

	private static $title = NULL;
	private static $titlePrefix = NULL;
	private static $titleSuffix = 'FOnline status (beta)';

	// use minimalized javascript
	// enforced for external dependencies only
	private static $useMinimizedJS = true;

	// external dependencies versions; if not set, latest available version is used
	public static $vJquery = '1.11.0';
	public static $vHighcharts = '3.0.9';
	public static $vHighstock = '1.3.9';

	// keeps track of already added scripts
	private static $jsJquery = false;
	private static $jsHighcharts = false;
	private static $jsHighstock = false;
	private static $jsFOstatus = false;
	private static $jsFOstatusCharts = false;
	private static $jsFOstatusModule = false;

	// cached 
	private static $fodev_buttons = NULL;

	// navigation menu
	// uses data passed to menu()
	private static $menu = array();

	private static $arguments = array();

	private static $content = NULL;
	private static $footer = NULL;

	public static function initialize( $root, \Slim\Slim $slim )
	{
		self::$Root = $root;
		self::$Slim = $slim;

		self::initHooks();
		self::initError();
		self::initFOdev();
		self::initNotFound();
	}

	//
	// here be dragons
	//

	private static function initError()
	{
		self::$Slim->config( 'debug', false );

		self::$Slim->error( 'FOstatusUI::ExceptionHandler' );
	}

	public static function ExceptionHandler( Exception $e, $slimRunning = true )
	{
		self::$content = NULL;

		self::title( 'Error' );

		$code = $e->getCode();
		$message = $e->getMessage();
		$file = $e->getFile();
		$line = $e->getLine();
		$trace = $e->getTrace();


		$format = "\n\t\t<tr>\n\t\t\t<td><strong>%s</strong></td>\n\t\t\t<td>%s</td>\n\t\t</tr>";
		self::content( "\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<th style='text-align: left;'>Details</th>\n\t\t\t</tr>\n\t\t</thead>" );
		self::content( $format, 'Type', get_class($e) );
		if( $code )
			self::content( $format, 'Code', $code );
		if( $message )
			self::content( $format, 'Message', $message );
		if( $file )
			self::content( $format, 'File', $file );
		if( $line )
			self::content( $format, 'Line', $line );
		self::content( $format, 'Slim', $slimRunning ? 'enabled' : 'disabled' );

		self::content( "\n\t</table>" );
		if( $trace )
		{
			$rtn = "";
			$count = 0;
			foreach( $trace as $frame)
			{
				$args = "";
				if( isset($frame['args']) )
				{
					$args = array();
					foreach( $frame['args'] as $arg )
					{
						if( is_string($arg) )
							$args[] = "'" . htmlspecialchars($arg) . "'";
						elseif( is_array($arg) )
							$args[] = "Array";
						elseif( is_null($arg) )
							$args[] = 'NULL';
						elseif( is_bool($arg) )
							$args[] = ($arg) ? "true" : "false";
						elseif( is_object($arg) )
							$args[] = get_class($arg);
						elseif( is_resource($arg) )
							$args[] = get_resource_type($arg);
						else
							$args[] = htmlspecialchars($arg);
					}
					$args = ' ' . join( ", ", $args ) . ' ';
				}
				$rtn .= sprintf( "\n\t\t<tr>\n\t\t\t<td>#%s</td>\n\t\t\t<td>%s(%s): %s(%s)</td>\n\t\t</tr>",
					$count,
					isset($frame['file'])
						? $frame['file']
						: 'unknown file',
					isset($frame['line'])
						? $frame['line']
						: 'unknown line',
					(isset($frame['class']))
						? $frame['class'].$frame['type'].$frame['function']
						: $frame['function'],
					$args );
				$count++;
			}
			self::content( "\n\t<table>\n\t\t<thead>\n\t\t\t<tr>\n\t\t\t\t<th style='text-align: left;'>Trace</th>\n\t\t\t</tr>\n\t\t</thead>" );
			self::content( $rtn );
			self::content( "\n\t</table>" );
		}

		if( $slimRunning )
			self::$Slim->response->setStatus( 500 );

		self::$Slim->applyHook( 'slim.after.router' );

		if( !$slimRunning )
		{
			$body = self::$Slim->response->getBody();
			http_response_code( 500 );
			print $body;
			exit;
		}
	}

	private static function initFOdev()
	{
		// prepare fodev navigation panel
		ob_start();
		fodev_buttons( 'status' );
		self::$fodev_buttons .= ob_get_contents();
		ob_end_clean();
	}

	private static function initNotFound()
	{
		self::$Slim->notFound( function()
		{
			self::$Slim->response->setStatus( 404 );

			self::title( "Page not found" );

			self::content( "\n404" );

			self::$Slim->applyHook( 'slim.after.router' );
			print self::$Slim->response->getBody();

		});
	}
	private static function initHooks()
	{
		// add trailing slash to all requests
		self::$Slim->hook( 'slim.before.router', function()
		{
			if( substr( self::$Slim->request->getResourceUri(), -1 ) != '/' )
			{
				$location  = self::$Slim->request->getRootUri();
				$location .= self::$Slim->request->getResourceUri();
				$location .= '/';
				self::$Slim->redirect( $location, 301 );
			}
		}, -9999 );

		// render a page after executing route function
		self::$Slim->hook( 'slim.after.router', function()
		{
			self::$Slim->applyHook( 'html' );
		}, 9999 );

		// main rendering hook
		self::$Slim->hook( 'html', function()
		{
			self::response( "<!DOCTYPE html>\n<html lang='en'>" );

			self::$Slim->applyHook( 'html:head' );

			self::response( "\n<body>" );

			self::$Slim->applyHook( 'html:body' );

			// module with own js
			if( self::$jsFOstatusModule )
			{
				self::response( "\n<script type='text/javascript'>\nvar" );
				self::response( "
	rootDir    = '".self::$Root."',
	dataDir    = rootDir+'/data/',
	gfxDir     = rootDir+'/gfx/',
	configFile = dataDir+'config.json'
;" );

				if( self::$jsFOstatus )
					self::response( "\nvar fo = new FOstatus();" );
				if( self::$jsFOstatusCharts )
					self::response( "\nvar foCharts = new FOstatusCharts();" );

				self::response( "\n
function ShowInfo( text )
{
	$('#info').empty();
	$('#info').append( text );
	$('#info').show();
}

function HideInfo( text )
{
	$('#info').hide();
}

$(document).ready( function()
{
	if( typeof start == 'function' )
		start(" );
				// generate arguments list
				if( count(self::$arguments) )
				{
					$js = array();
					foreach( self::$arguments as $argument )
					{
						if( $argument == NULL )
							array_push( $js, 'null' );
						if( ctype_digit( $argument ))
							array_push( $js, $argument );
						elseif( is_string( $argument ))
							array_push( $js, "'$argument'" );
						// strip everything else
					}
					if( count($js) )
						self::response( " %s ", implode( ', ', $js ));
				}

				self::response( ");
});" );
				self::response( "\n</script>" );
			}

			self::response( "\n</body>\n</html>\n" );
		}, 1 );

		self::$Slim->hook( 'html:head', function()
		{
			$title = NULL;
			if( isset(self::$titlePrefix) )
			{
				$title .= self::$titlePrefix;
				if( isset(self::$title) )
					$title .= ' - ';
			}

			if( isset(self::$title) )
				$title .= self::$title;

			if( isset(self::$titleSuffix) )
			{
				if( isset(self::$title) || isset(self::$titlePrefix) )
					$title .= ' - ';
				$title .= self::$titleSuffix;
			}

			self::response( "
<head>
	<title>%s</title>
	<meta charset='utf-8' />
	<meta name='robots' content='index, follow' />
	<meta name='description' content='fodev.net - the FOnline development community' />
	<meta name='keywords' content='Fallout Online, FOnline, SDK' />
	<meta name='robots' content='index, follow' />

	<link rel='icon' type='image/png' href='/favicon.png' />
	<link href='/favicon.ico' rel='shortcut icon' type='image/x-icon' />",
				$title );

			if( true ) // CSS Naked Day, anyone?
				self::$Slim->applyHook( 'html:head:css' );

			self::$Slim->applyHook( 'html:head:js' );

			self::response( "\n</head>" );
		}, 1 );

		self::$Slim->hook( 'html:head:css', function()
		{
			if( file_exists( 'css/base.css' ))
				self::response( "\n\t<link rel='stylesheet' href='".self::$Root."/css/base.css' />" );
			else
				self::response( "\n\t<link rel='stylesheet' href='http://fodev.net/forum/Themes/blackened/css/index.css?fin20' type='text/css' />" );

			self::response( "\n\t<link rel='stylesheet' href='".self::$Root."/css/status.css' />" );
		}, 1 );

		self::$Slim->hook( 'html:body', function()
		{
			self::response( "\n<nav id='fodev'>" );

			self::response( self::$fodev_buttons );

			self::response( "\n</nav> <!-- #fodev -->" );


		}, 1 );

		self::$Slim->hook( 'html:body', function()
		{
			self::response( "\n<article>" );

			if( count(self::$menu) )
			{
				self::response( "\n\t<nav id='header'>" );

				uasort( self::$menu, function( $a, $b )
				{
					return( $a > $b ? 1 : -1 );
				});

				self::response( "\n\t\t<strong>&#171;</strong>\n\t\t%s\n\t\t<strong>&#187;</strong>",
					implode( "\n\t\t<strong>&#183;</strong>\n\t\t", array_keys( self::$menu )));

				self::response( "\n\t</nav> <!-- #header -->" );
			}

			if( isset(self::$content) )
				self::response( self::$content );

			self::response( "\n</article>" );

			if( isset(self::$footer) || self::$jsFOstatusModule )
			{
				self::response( "\n<footer>" );
				
				if( self::$jsFOstatusModule )
					self::response( "\n\t<div id='info'></div>" );

				if( isset(self::$footer) )
				{
					self::response( "\n\t<div id='footer'>" );
					self::response( self::$footer );
					self::response( "\n\t</div> <!-- #footer -->" );
				}

				self::response( "\n</footer>" );
			}
		}, 2 );
	}



	public static function title( $title )
	{
		if( isset($title) )
			self::$title = $title;
	}

	// adds menu link
	public static function menu( $link, $text, $priority )
	{
		if( $link != '/' )
		{
			$link =  sprintf( "<a href='%s/%s/'>%s</a>",
				self::$Root, $link, $text );
		}
		else
		{
			$link = sprintf( "<a href='%s/'>%s</a>",
				self::$Root, $text );
		}

		self::$menu[$link] = $priority;
	}

	public static function jsArguments( array $args )
	{
		if( !isset($args) || !is_array($args) || !count($args) )
			return;

		self::$arguments = $args;
	}

	// add javascript file to generated page (remote)
	public static function addScript( $url, $priority = 10 )
	{
		self::$Slim->hook( 'html:head:js', function() use( $url )
		{
			self::response( "\n\t<script src='%s'></script>", $url );
		}, $priority );
	}

	// add javascript file to generated page (local)
	public static function addLocalScript( $filename, $priority = 10 )
	{
		if( file_exists( "js/$filename" ))
			self::addScript( self::$Root.'/js/'.$filename, $priority );
	}

	// add jquery to generated page
	public static function addJquery()
	{
		if( self::$jsJquery )
			return;

		self::$jsJquery = true;

		$url = '//code.jquery.com/jquery';

		if( isset(self::$vJquery) )
			$url .= '-' . self::$vJquery;

		if( self::$useMinimizedJS )
			$url .= '.min';

		$url .= '.js';

		self::addScript( $url, 2 );
	}

	// add highcharts to generated page
	public static function addHighcharts()
	{
		if( self::$jsHighcharts )
			return;
		self::$jsHighcharts = true;

		self::addJquery();

		$url = '//code.highcharts.com/';

		if( isset(self::$vHighcharts) )
			$url .= self::$vHighcharts . '/';

		$url .= 'highcharts';

		if( !self::$useMinimizedJS )
			$url .= '.src';

		$url .= '.js';

		self::addScript( $url, 3 );
	}

	// add highstock to generated page
	public static function addHighstock()
	{
		if( self::$jsHighstock )
			return;
		self::$jsHighstock = true;

		self::addJquery();

		$url = '//code.highcharts.com/stock/';

		if( isset(self::$vHighstock) )
			$url .= self::$vHighstock . '/';

		$url .= 'highstock';

		if( !self::$useMinimizedJS )
			$url .= '.src';

		$url .= '.js';

		self::addScript( $url, 4 );
	}

	// adds fostatus*.js to generated page
	// if module itself is passed, try to add his own script
	public static function addFOstatus( FOstatusModule $module = NULL, $charts = true )
	{
		if( self::$jsFOstatus )
			return;

		self::$jsFOstatus = true;
		$url = 'fostatus.js';

		if( self::$useMinimizedJS && file_exists( 'js/fostatus.min.js' ))
			$url = 'fostatus.min.js';

		self::addLocalScript( $url, 5 );

		if( $charts )
		{
			self::$jsFOstatusCharts = true;
			$url = 'fostatus.charts.js';

			if( self::$useMinimizedJS && file_exists( 'js/fostatus.charts.min.js' ))
				$url = 'fostatus.charts.min.js';

			self::addLocalScript( $url, 6 );
		}

		if( isset($module) && is_subclass_of( $module, 'FOstatusModule' ))
		{
			$module = strtolower( get_class( $module ));
			if( preg_match( '!^[a-z0-9_]+$!', $module ))
			{
				$url = NULL;

				if( self::$useMinimizedJS && file_exists( "js/$module.min.js" ))
					$url = "$module.min.js";
				else if( file_exists( "js/$module.js" ))
					$url = "$module.js";

				if( isset($url) )
				{
					self::addJquery();
					self::$jsFOstatusModule = true;
					self::addLocalScript( $url, 7 );
				}
			}
		}
	}

	// shortcut to \Slim\Response
	public static function response( $format ) 
	{
		$args = func_get_args();
		unset( $args[0] );
		if( count($args) )
			self::$Slim->response->write( vsprintf( $format, $args ));
		else
			self::$Slim->response->write( $format );
	}

	public static function content( $format )
	{
		if( !isset($format) )
			return;

		$args = func_get_args();
		unset( $args[0] );
		if( count($args) )
			$args = vsprintf( $format, $args );
		else
			$args = $format;

		if( !strlen($args) )
			return;

		if( !isset(self::$content) )
			self::$content = '';

		self::$content .= $args;
	}

	public static function footer( $format )
	{
		if( !isset($format) )
			return;

		$args = func_get_args();
		unset( $args[0] );
		if( count($args) )
			$args = vsprintf( $format, $args );
		else
			$args = $format;

		if( !strlen($args) )
			return;

		if( !isset(self::$footer) )
			self::$footer = '';

		self::$footer .= $args;
	}

	public static function footerTimeline( array $servers, $path )
	{
		$elements = array();
		if( count($servers) > 0 )
			array_push( $elements, "<a href='".self::$Root.$path."'>All servers</a>" );

		if( count($servers) != 1 )
			array_push( $elements, "<button id='remove_hidden' type='button'>Remove hidden servers</button>" );

		if( FOstatusModule::isModule( 'Server' ))
		{
			if( count($servers) == 1 )
				array_push( $elements, "<a href='".self::$Root."/server/".$servers[0]."/'>Server page</a>" );
		}

		$footer = NULL;

		if( count($elements) == 1 )
			$footer = sprintf( "\n\t\t%s", $elements[0] );
		else
		{
			$footer = sprintf( "\n\t\t&#171;\n\t\t%s\n\t\t&#187;",
				implode( "\n\t\t&#183;\n\t\t", $elements ));
		}

		if( $footer != NULL )
			self::footer( $footer );
	}
};

?>