<?php

include( 'lib/slim/Slim/Slim.php' );
include( 'lib/slim/Slim/Middleware.php' );
include( 'lib/FOstatus.php' );

date_default_timezone_set( 'Europe/Berlin' );

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->setName( 'FOstatus' );

$app->config( array(
	'mode'			=> 'development',
	'templates.path'	=> '.',
));

define( 'FODEV:STATUS', 1 );

include( 'modules.php' );
include( 'ui.php' );

$root = dirname( $_SERVER['SCRIPT_NAME'] );

UI::initialize( $root, $app );

// prepare errors catchers

error_reporting( -1 );

set_exception_handler( function( Exception $e )
{
	UI::ExceptionHandler( $e, false );
});

set_error_handler( function( $errno, $errstr, $errfile, $errline )
{
	$e = new ErrorException( $errstr, $errno, NULL, $errfile, $errline );
	UI::ExceptionHandler( $e, false );
});

register_shutdown_function( function()
{
	$error = error_get_last();
	if( count($error) )
	{
		$e = new ErrorException( $error['message'], NULL /*$error['type']*/, NULL, $error['file'], $error['line'] );
		UI::ExceptionHandler( $e, false );
	}
});

// from this point, ALL errors should be catched and displayed by UI

$fo = new FOstatus();
if( $fo->LoadConfig( 'data/config.json' ))
{
	FOstatusModule::initialize( $root, 'modules', $app, $fo );
}
else
{
	UI::start( NULL, false );
	UI::title( 'Error' );
	UI::contentStatic( 'error_config' );

	$app->applyHook( 'slim.after.router' );
	print $app->response->getBody();
	exit;
}

$app->run();

?>