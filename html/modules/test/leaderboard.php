<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Leaderboard extends FOstatusModule
{
	public function init()
	{
		parent::$Slim->get( '/test/leaderboard/', function()
		{
			$this->js();
		});
	}

	private function js()
	{
		FOstatusUI::addHighcharts();
		FOstatusUI::addFOstatus( $this );
	}
};

?>