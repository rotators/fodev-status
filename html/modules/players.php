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
			$this->js();

			parent::$Slim->expires( '+1 minute' );

			UI::contentStatic( 'chart' );
			UI::footerStatic( 'players_footer' );
		});
	}

	private function js()
	{
		UI::addHighcharts();
		UI::addFOstatus( $this );
	}
};

?>