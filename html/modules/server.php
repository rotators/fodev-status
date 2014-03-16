<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

include( 'lib/FOnlineFont.php' );

class Server extends FOstatusModule
{
	public function init()
	{
		parent::$Slim->get( '/server/:server/', function( $server_user )
		{
			if( isset(parent::$FO->Config['server'][$server_user]['name']) )
				FOstatusUI::title( parent::$FO->Config['server'][$server_user]['name'] );

			$this->js();

			if( isset(parent::$FO->Config['server'][$server_user]) )
				$server = parent::$FO->Config['server'][$server_user];

			if( !isset($server) )
			{
				// TODO
				FOStatusUI::content( 'server not found' );

				return;
			}

			$this->serverLogo( $server_user );

			$jsArguments = array( $server_user );

			FOstatusUI::jsArguments( $jsArguments );

			FOstatusUI::content( "
	<div id='logo' class='center'></div>
	<div id='link' class='center font_fallout'></div>
	<div id='chart'></div>"
			);

			$compare = array();
			if( $this->isModule( 'History' ))
				array_push( $compare, "<a href='".parent::$Root."/history/'>players</a>" );
			if( $this->isModule( 'Average' ))
				array_push( $compare, "<a href='".parent::$Root."/average/'>average</a>" );

			if( count($compare) )
			{
				FOstatusUI::footer( "\n\tCompare with other servers: %s",
					join( ', ', $compare ));
			}

		});
	}

	private function js()
	{
		FOstatusUI::addHighstock();
		FOstatusUI::addFOstatus( $this );
	}

	public function serverLogo( $id )
	{
		$file = sprintf( "gfx/logo/%s.png", $id );
		if( file_exists( $file ))
			return( $file );

		$file = sprintf( "cache/%s.logo-placeholder.png", $id );

		/*if( file_exists( $file ))
			return( $file );
		else*/if( isset(parent::$FO->Config['server'][$id]['name']) )
		{
			$name = parent::$FO->Config['server'][$id]['name'];

			foreach( array( 'Big', 'Fat' ) as $font )
			{
				// FOnlineFont is extremly paranoid
				$font = sprintf( "fonts/%s.fofnt", $font );
				if( !is_file( $font ) || !file_exists( $font ))
					continue;

				$font = new FOnlineFont( $font );
				if( !$font->TextValid( $name ))
					continue;

				$image = $font->TextToImage( $name, 2, 238, 0 );
				if( $image == NULL )
					continue;

				if( imagepng( $image, $file ))
					return( $file );
			}
		}

		return( NULL );
	}
};

?>