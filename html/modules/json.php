<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class JSON extends FOstatusModule
{
	private $func_prefix = 'json_';

	public function init()
	{
		parent::$Slim->get( '/json/', function()
		{
			$json = array();
			foreach( get_class_methods( $this ) as $method )
			{
				if( preg_match( "!^".$this->func_prefix."([a-z_]+)$!", $method, $match ))
				{
					array_push( $json, array(
						'id' => $match[1]
					));
				}
			};
			foreach( parent::$FO->Config['files'] as $file => $value )
			{
				$path = array(
					'id' => $file
				);

				if( preg_match_all( '!\{(.*)\}!U', parent::$FO->GetPath( $file ), $match ))
				{
					$path['require'] = $match[1];
				}
				array_push( $json, $path );
			}
			$this->send( array( 'fonline' => array( 'json' => $json )));
		});

		parent::$Slim->get( '/json/:arguments/', function( $args )
		{
			if( !preg_match( '!^[a-z_,]+$!', $args ))
			{
				$this->sendError( 'Invalid arguments' );
				return;
			}

			$args = array_unique( explode( ',', $args ));
			$error = NULL;
			foreach( $args as $arg )
			{
				$result = parent::$FO->GetPath( $arg );
				if( !isset($result) ) // not yet needed to check for {}
				{
					if( !method_exists( $this, $this->func_prefix.$arg ))
					{
						$error = 'Unknown request: '.$arg;
						break;
					}
				}
			}
			if( isset($error) )
			{
				$this->sendError( $error );
				return;
			}

			$json = array();
			foreach( $args as $id )
			{
				$params = parent::$Slim->request->params();
				if( count($params) )
				{
					foreach( $params as $name => $value )
					{
						if( !preg_match( '!^[A-Za-z0-9_]+$!', $name ))
						{
							$this->sendError( "Invalid parameter: $name" );
							return;
						}

						if( !isset($value) || !strlen($value) )
						{
							$this->sendError( "Empty parameter: $name" );
							return;
						}
					}
				}

				$file = parent::$FO->GetPath( $id, $params );
				if( isset($file) )
				{
					if( preg_match_all( '!\{(.*)\}!U', $file, $match ))
					{
						$this->sendError( sprintf( "[%s] Missing parameter%s: %s",
							$id,
							count($match) > 1 ? 's' : '',
							implode( ', ', $match[1] )));
						return;
					}

					$file = 'data/' . $file;
					if( file_exists( $file ))
					{
						$tmp = json_decode( file_get_contents( $file ), true );
						if( !isset($tmp['fonline']) || !isset($tmp['fonline'][$id]) )
						{
							$this->sendError( "[$id] Invalid structure" );
							return;
						}

						$json['fonline'][$id] = $tmp['fonline'][$id];
					}
					else
					{
						$this->sendError( "[$id] Internal error: not found" );
						return;
					}
				}
				else
				{
					$func = $this->func_prefix.$id;
					$result = $this->$func();

					if( $result === FALSE )
						return;
					elseif( !is_array($result) )
					{
						$this->sendError( "[$id] Internal error: invalid result" );
						return;
					}

					$json['fonline'][$id] = $result;
				}
			}
			$this->send( $json );
		});
	}

	public function error( $string )
	{
		return( array( 'fonline' => array( 'error' => $string )));
	}

	private function send( array $json )
	{
		parent::$Slim->response->headers->set( 'Content-Type', 'application/json' );
		parent::$Slim->response->headers->set( 'Access-Control-Allow-Origin',  '*' );
		parent::$Slim->response->headers->set( 'Access-Control-Allow-Methods', 'GET' );

		UI::response( json_encode( $json, JSON_UNESCAPED_SLASHES ));
	}

	private function sendError( $string )
	{
		$this->send( $this->error( $string ));
	}

	// virtual responses

	private function json_config()
	{
		return( parent::$FO->Config );
	}

	private function json_logo()
	{
		if( !$this->isModule( 'Server' ))
		{
			$this->sendError( '[logo] Server module not loaded' );
			return( FALSE );
		}

		$result = array();
		$serverModule = $this->getModule( 'Server' );
		foreach( parent::$FO->GetServersArray( 'id' ) as $server )
		{
			$serverId = $server['id'];
			$file = $serverModule->serverLogo( $server['id'] );
			if( isset($file) && file_exists( $file ))
			{
				$hash = crc32( file_get_contents( $file ));
				$result[$serverId] = array(
					'path'	=> $file,
					'hash'	=> intval( sprintf( "%u", $hash ))
				);
			}
		}

		return( $result );
	}
};