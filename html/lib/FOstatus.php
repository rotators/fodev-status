<?php

class FOstatus
{
	public $Config = NULL;

	public function __construct() {}

	public function LoadConfig( $filename )
	{
		$result = false;
		if( file_exists( $filename ))
		{
			$config = json_decode( file_get_contents( $filename ), true );
			if( $config != NULL && isset($config['fonline']) && isset($config['fonline']['config']) )
			{
				$this->Config = $config['fonline']['config'];
				return( true );
			}
		}

		return( $result );
	}

	public function GetServersArray( $sorting, $ascending = TRUE )
	{
		$array = array();
		foreach( $this->Config['server'] as $id => $server )
		{
			$server['id'] = $id;
			array_push( $array, $server );
		}

		usort( $array, function( $a, $b ) use( $sorting, $ascending )
		{
			if( $ascending == TRUE )
				return( $a[$sorting] > $b[$sorting] ? 1 : -1 );
			else
				return( $b[$sorting] > $a[$sorting] ? 1 : -1 );
		});
		
		return( $array );
	}

	public function GetPath( $name, $args = NULL )
	{
		$result = NULL;

		if( $this->Config != NULL && isset( $this->Config['files'] ))
		{
			if( isset($this->Config['files'][$name]) )
			{
				$result = $this->Config['files'][$name];
				if( isset($this->Config['dirs']) )
				{
					foreach( $this->Config['dirs'] as $id => $value )
					{
						$result = str_replace( '{DIR:'.$id.'}', $value, $result );
					}
				}
				if( $args != NULL && is_array($args) )
				{
					foreach( $args as $id => $value )
					{
						$result = str_replace( '{'.$id.'}', $value, $result );
					}
				}
			}
		}

		return( $result );
	}
};

?>