<?php

include( 'lib/Slim/Slim.php' );
include( 'lib/Slim/Middleware.php' );
include( 'lib/FOstatus.php' );

date_default_timezone_set( 'Europe/Berlin' );

\Slim\Slim::registerAutoloader();

$app = new \Slim\Slim();

$app->setName( 'FOstatus' );

$app->config( array(
	'mode'			=> 'development',
	'templates.path'	=> '.',
));

$app->get( 'index.php', function() use( $app )
{
	$app->redirect( $app->request->getRootUri(), 303 );
});

define( 'FODEV:STATUS', 1 );

include( 'modules.php' );
include( 'ui.php' );

FOstatusUI::initialize( $app );

// all errors are supposed to be displayed by UI

error_reporting( -1 );

set_exception_handler( function( Exception $e )
{
	FOstatusUI::ExceptionHandler( $e, false );
});

set_error_handler( function( $errno, $errstr, $errfile, $errline )
{
	$e = new ErrorException( $errstr, $errno, NULL, $errfile, $errline );
	FOstatusUI::ExceptionHandler( $e, false );
});

register_shutdown_function( function()
{
	$error = error_get_last();
	if( count($error) )
	{
		$e = new ErrorException( $error['message'], NULL /*$error['type']*/, NULL, $error['file'], $error['line'] );
		FOstatusUI::ExceptionHandler( $e, false );
	}
});

// from this point, ALL errors should be catched and displayed by UI

foreach( array_merge( glob( "modules/*.php" ), glob( "modules/*/*.php" )) as $filename )
{
	include_once( $filename );
}

$fo = new FOstatus();
if( $fo->LoadConfig( 'data/config.json' ))
{
	FOstatusModule::initialize( $app, $fo );
}

$app->run();

?>