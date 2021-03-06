<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class History extends FOstatusModule
{
	public function __construct()
	{
		if( !$this->validPathFO( 'history' ))
		{
			$this->Dispose = true;
			return;
		}
	}

	public function init()
	{
		$this->Description = "Server(s) history";

		UI::menu( 'history', 'History', 50 );
		$this->RoutesInfo['history'] = 'History of all servers';
		parent::$Slim->get( '/history/', function()
		{
			parent::$Slim->expires( '+10 minutes' );

			$this->content();
			UI::footerTimeline( array(), '/history/' );
		});

		$this->RoutesInfo['history/:servers'] = 'History of selected server(s) only';
		parent::$Slim->get( '/history/:servers/', function( $servers_user )
		{
			parent::$Slim->expires( '+10 minutes' );

			$servers = array();
			if( !$this->filterServers( $servers_user, $servers, '/history/', false ))
				return;

			$this->content();
			UI::jsArguments( $servers );
			UI::footerTimeline( $servers, '/history/' );
		});
	}

	private function content()
	{
		UI::start( $this, true, true );
		UI::addHighstock();
		UI::contentStatic( 'chart' );
	}
};

?>