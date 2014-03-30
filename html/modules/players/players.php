<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Players extends FOstatusModule
{
	public function __construct()
	{
		if( !$this->validPathFO( 'status' ))
		{
			$this->Dispose = true;
			return;
		}
	}

	public function init()
	{

		$this->Description = "Current players distribution";

		UI::menu( 'players', 'Players', 10 );

		parent::$Slim->get( '/players/', function()
		{
			parent::$Slim->expires( '+1 minute' );

			UI::start( $this, true, true );
			UI::addHighcharts();
			UI::title( 'Players' );
			UI::contentStatic( 'chart' );
			UI::footerStatic( 'footer' );
		});
	}
};

?>