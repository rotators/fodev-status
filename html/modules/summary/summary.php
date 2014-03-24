<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Summary extends FOstatusModule
{
	public function init()
	{
		$this->Description = "\"FOnline in one picture\"";

//		UI::menu( 'fonline', 'Summary', 5 );

		parent::$Slim->get( '/test/fonline/', function()
		{
			parent::$Slim->expires( '+10 minutes' );

			$this->js();

			UI::contentStatic( 'chart' );
		});
	}

	private function js()
	{
		UI::addHighstock();
		UI::addFOstatus( $this );
	}
};

?>