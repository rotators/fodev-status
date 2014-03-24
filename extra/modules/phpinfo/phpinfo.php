<?php

/*
 * Bad things may happen if used on public server. Bad things.
 */

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class PHPInfo extends FOstatusModule
{
	public function init()
	{
		UI::menu( 'about','About', 999 );

		parent::$Slim->get( '/phpinfo/', function()
		{
			ob_start();
			phpinfo();
			$phpinfo = preg_replace( '!^.*<body>(.*)</body>.*$!ms', '$1', ob_get_contents() );
			ob_end_clean();


			UI::start( $this );
			UI::title( 'PHP Info' );
			UI::content( $phpinfo );
		});

		parent::$Slim->get( '/phpinfo/raw/', function()
		{
			phpinfo();
		});
	}
}