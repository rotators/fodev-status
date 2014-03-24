<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Average extends FOstatusModule
{
	public function __construct()
	{
		if( !$this->validPathFO( 'average' ))
		{
			$this->Dispose = true;
			return;
		}
	}

	public function init()
	{
		$this->Description = "Server(s) average players";

		UI::menu( 'average', 'Average', 60 );
		parent::$Slim->get( '/average/', function()
		{
			parent::$Slim->expires( '+10 minutes' );

			$this->content();
			UI::footerTimeline( array(), '/average/' );
		});

		parent::$Slim->get( '/average/:servers/', function( $servers_user )
		{
			$servers = array();
			if( !$this->filterServers( $servers_user, $servers, '/average/', false ))
				return;

			parent::$Slim->expires( '+10 minutes' );

			UI::jsArguments( $servers );

			$this->content();
			UI::footerTimeline( $servers, '/average/' );
		});
	}

	private function content()
	{
		UI::start( $this );
		UI::addHighstock();
		UI::contentStatic( 'chart' );
	}
};

?>