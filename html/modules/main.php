<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Main extends FOstatusModule
{
	public function init()
	{
		$this->Description = "Main page";

		FOstatusUI::menu( '/', 'Home', 0 );
		parent::$Slim->get( '/', function()
		{
			parent::$Slim->expires( '+1 minute' );

			FOstatusUI::addFOstatus( $this, false );

			FOstatusUI::contentStatic( 'main' );
			FOstatusUI::footerStatic( 'main_footer' );
		});
		
	}
}

?>