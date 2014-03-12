<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Average extends FOstatusModule
{
	public function init()
	{
		$this->Description = "Server(s) average players";

		FOstatusUI::menu( 'average', 'Average', 60 );
		parent::$Slim->get( '/average/', function()
		{
			$this->js();
			$this->content();
			FOstatusUI::footerTimeline( array(), '/average/' );
		});

		parent::$Slim->get( '/average/:servers/', function( $servers_user )
		{
			$servers = array();
			if( !$this->filterServers( $servers_user, $servers, '/average/', false ))
				return;

			FOstatusUI::jsArguments( $servers );

			$this->js();
			$this->content();
			FOstatusUI::footerTimeline( $servers, '/average/' );
		});
	}

	private function js()
	{
		FOstatusUI::addHighstock();
		FOstatusUI::addFOstatus( $this );
	}

	private function content()
	{
		FOstatusUI::content( "\n\t<div id='chart'></div>" );
	}
};

?>