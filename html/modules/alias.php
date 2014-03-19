<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class Alias extends FOstatusModule
{
	public function init()
	{
		if( $this->isModule( 'About' ))
			$this->addAlias( 'm', 'about/modules' );
		if( $this->isModule( 'Average' ))
			$this->addAlias( 'a', 'average' );
		if( $this->isModule( 'History' ))
			$this->addAlias( 'h', 'history' );
		if( $this->isModule( 'Librarian' ))
			$this->addAlias( 'l', 'librarian' );
		if( $this->isModule( 'Players' ))
			$this->addAlias( 'p', 'players' );
	}

	public function addAlias( $from, $to )
	{
		if( preg_match( '!^[a-z]+$!', $from ) && preg_match( '!^[a-z/]+$!', $to ))
		{
			$this->RoutesInfo[$from] = sprintf( "-> <a href='%s/%s/'>%s/</a>",
				parent::$Root, $to, $to );

			parent::$Slim->get( "/$from/", function() use( $to )
			{
				parent::$Slim->redirect( parent::$Root."/$to/", 302 );
			});
		}
	}
};

?>