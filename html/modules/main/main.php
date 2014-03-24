<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Main extends FOstatusModule
{
	public function init()
	{
		$this->Description = "Main page";

		UI::menu( '/', 'Home', 0 );
		parent::$Slim->get( '/', function()
		{
			parent::$Slim->expires( '+1 minute' );

			UI::start( $this, false );

//			UI::addFOstatus( $this, false );

			UI::contentStatic( 'body' );
			UI::footerStatic( 'footer' );
		});
		
	}
}

?>