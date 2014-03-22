<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Leaderboard extends FOstatusModule
{
	public function init()
	{
		UI::menu( 'leaderboard', 'Leaderboard', 70 );

		parent::$Slim->get( '/leaderboard/', function()
		{
			parent::$Slim->expires( '+10 minutes' );

			$this->js();

			UI::contentStatic( 'chart' );
		});
	}

	private function js()
	{
		UI::addHighcharts();
		UI::addFOstatus( $this );
	}
};

?>