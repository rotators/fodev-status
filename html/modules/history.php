<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class History extends FOstatusModule
{
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
		FOstatusUI::content( "\n\t<div id='chart'></div>" );
	}

	protected function footer( $servers )
	{
		$elements = array();
		if( $servers !== true )
			array_push( $elements, "<a href='".parent::$Root."/history/'>All servers</a>" );

		if( $servers === true || (is_array($servers) && count($servers) > 1) )
			array_push( $elements, "<button id='remove_hidden' type='button'>Remove hidden servers</button>" );

		if( $this->isModule( 'Server' ))
		{
			if( $servers !== true && is_array($servers) && count($servers) == 1 )
				array_push( $elements, "<a href='".parent::$Root."/server/".$servers[0]."/'>Server page</a>" );
		}

		if( count($elements) == 1 )
		{
			FOstatusUI::footer( "\n\t\t<div class = 'right'>%s</div>",
				$elements[0] );
		}
		elseif( count($elements) > 1 )
		{
			FOstatusUI::footer( "\n\t\t<div class = 'right'>\n\t\t\t&#171;\n\t\t\t%s\n\t\t\t&#187;</div>",
				implode( "\n\t\t\t&#183;\n\t\t\t", $elements ));
		}
	}
};

?>