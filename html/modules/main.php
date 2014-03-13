<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Main extends FOstatusModule
{
	public function init()
	{
		$this->Description = "Main page";

		FOstatusUI::menu( '/', 'Home', 0 );
		parent::$Slim->get( '/', function()
		{
			parent::$Slim->expires( '+1 minute' );

			FOstatusUI::addFOstatus( $this, false );

			FOstatusUI::content( "
	<div id='multiplayer' class='center'>
		<h3 class='catbg'>FOnline</h3>
		Currently playing: <span id='online_players'>?</span> player<span id='online_players_s'></span> on <span id='online_servers'>?</span> server<span id='online_servers_s'></span>
		<div id='multiplayer_list'></div>
	</div>
	<div id='singleplayer' class='center'>
		<h3 class='catbg'>Singleplayer</h3>
		<div id='singleplayer_list'></div>
	</div>
	<br><br>" );

			FOstatusUI::footer( "
		<input type='checkbox' id='auto_update' checked='checked' /> Auto update
		<input type='checkbox' id='show_offline' checked='checked' /> Show offline servers
		<input type='checkbox' id='show_closed'/> Show closed servers"
			);
		});
		
	}
}

?>