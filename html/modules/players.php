<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
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

		FOstatusUI::menu( 'players', 'Players', 10 );

		parent::$Slim->get( '/players/', function()
		{
			$this->js();

			FOstatusUI::contentStatic( 'chart' );
			FOstatusUI::footerStatic( 'players_footer' );
		});
	}

	private function js()
	{
		FOstatusUI::addHighcharts();
		FOstatusUI::addFOstatus( $this );
	}
};

?>