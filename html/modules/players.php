<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Players extends FOstatusModule
{
	public function init()
	{
		if( !file_exists( 'data/'.parent::$FO->GetPath( 'status' )))
		{
			$this->Hidden = true;
			return;
		}

		$this->Description = "Current players distribution";

		FOstatusUI::menu( 'players', 'Players', 10 );

		parent::$Slim->get( '/players/', function()
		{
			$this->js();

			FOstatusUI::content( "\n<div id='chart'></div>" );
			FOstatusUI::footer( "\n\t\t<input type='checkbox' name='auto_update' checked /> Auto update" );

		});
	}

	private function js()
	{
		FOstatusUI::addHighcharts();
		FOstatusUI::addFOstatus( $this );
	}
};

?>