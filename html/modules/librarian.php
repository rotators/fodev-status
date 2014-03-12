<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Librarian extends FOstatusModule
{
	public function init()
	{
		if( !file_exists( 'data/'.parent::$FO->GetPath( 'librarian' )))
			return;

		parent::$Slim->get( '/librarian/', function()
		{
			FOstatusUI::title( "Librarian" );

			FOstatusUI::addFOstatus( $this );

			FOstatusUI::content( "<div id='table'></div>" );
		});
	}
}

?>