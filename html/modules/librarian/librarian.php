<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Librarian extends FOstatusModule
{
	public function __construct()
	{
		if( !$this->validPathFO( 'librarian' ))
		{
			$this->Dispose = true;
			return;
		}
	}

	public function init()
	{
		parent::$Slim->get( '/librarian/', function()
		{
			UI::start( $this, true );
			UI::title( "Librarian" );
			UI::contentStatic( 'chart' );
			UI::footerStatic(  'footer' );
		});
	}
}

?>