<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Librarian extends FOstatusModule
{
	public function __construct()
	{
		if( !$this->validPathFO( 'librarian' ))
		{
			$this->Dispose = true;
			return;
		}
	}

	public function init()
	{
		parent::$Slim->get( '/librarian/', function()
		{
			FOstatusUI::title( "Librarian" );

			FOstatusUI::addFOstatus( $this );

			FOstatusUI::contentStatic( 'librarian' );
			FOstatusUI::footerStatic(  'librarian_footer' );
		});
	}
}

?>