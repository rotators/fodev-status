<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class PlayFOnline extends FOstatusModule
{
	public function init()
	{
		$this->Description = sprintf( "Support for <a href='%s'>play-fonline</a>",
			'https://github.com/rotators/play-fonline/' );
		parent::$Slim->get( '/play/', function()
		{
			parent::$Slim->response->headers->set( 'Content-Type',  'application/json' );

			$json = array();
			foreach( array( 'config', 'status', 'logo' ) as $id )
			{
				$file = parent::$FO->GetPath( $id );
				if( isset($file) )
				{
					$file = 'data/' . $file;
					if( file_exists( $file ))
					{
						$tmp = json_decode( file_get_contents( $file ), true );
						if( isset($tmp['fonline'][$id]) )
							$json['fonline'][$id] = $tmp['fonline'][$id];
					}
				}
				else
				{
					if( $id == 'config' )
						$json['fonline'][$id] = parent::$FO->Config;
					elseif( $id == 'logo' && $this->isModule( 'Server' ))
					{
						$serverModule = $this->getModule( 'Server' );
						foreach( parent::$FO->GetServersArray( 'id' ) as $server )
						{
							$serverId = $server['id'];
							$file = $serverModule->serverLogo( $server['id'] );
							if( isset($file) && file_exists( $file ))
							{
								$hash = crc32( file_get_contents( $file ));
								$json['fonline']['logo'][$serverId] = array(
									'path'	=> $file,
									'hash'	=> intval( sprintf( "%u", $hash ))
								);
							}
						}
					}
				}
			}
			UI::response( json_encode( $json,  JSON_UNESCAPED_SLASHES ));
		});
	}
};