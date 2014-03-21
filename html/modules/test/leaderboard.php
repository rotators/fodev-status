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
			parent::$Slim->expires( '+10 minutes' );

			$this->js();

			FOstatusUI::contentStatic( 'chart' );
		});
	}

	private function js()
	{
		FOstatusUI::addHighcharts();
		FOstatusUI::addFOstatus( $this );
	}
};

?>