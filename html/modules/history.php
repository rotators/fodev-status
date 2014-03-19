<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
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

		FOstatusUI::menu( 'history', 'History', 50 );
		$this->RoutesInfo['history'] = 'History of all servers';
		parent::$Slim->get( '/history/', function()
		{
			$this->js();
			$this->content();
			FOstatusUI::footerTimeline( array(), '/history/' );
		});

		$this->RoutesInfo['history/:servers'] = 'History of selected server(s) only';
		parent::$Slim->get( '/history/:servers/', function( $servers_user )
		{
			$servers = array();
			if( !$this->filterServers( $servers_user, $servers, '/history/', false ))
				return;

			FOstatusUI::jsArguments( $servers );

			$this->js();
			$this->content();
			FOstatusUI::footerTimeline( $servers, '/history/' );
		});
	}

	private function js()
	{
		FOstatusUI::addHighstock();
		FOstatusUI::addFOstatus( $this );
	}

	private function content()
	{
		FOstatusUI::contentStatic( 'chart' );
	}
};

?>