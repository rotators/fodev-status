<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Template extends FOstatusModule
{
	public function __construct()
	{
	}

	public function init()
	{
		parent::$Slim->get( '/template/', function()
		{
		});
	}
};

?>