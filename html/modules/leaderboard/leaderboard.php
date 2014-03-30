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

			UI::start( $this, true, true );
			UI::addHighcharts();
			UI::contentStatic( 'chart' );
			UI::footerStatic( 'footer' );
		});
	}
};

?>