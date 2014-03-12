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

			$this->content();
		});
	}

	private function content()
	{
		$librarian = json_decode( file_get_contents( 'data/'.parent::$FO->GetPath( 'librarian' )), true );
		$servers = parent::$FO->GetServersArray( 'name' );

		FOstatusUI::content( "<table>\n\t<thead>\n\t\t<tr>\n\t\t\t<th>Server</th><th>Pings</th><th>Sent</th><th>Received</th>\n\t\t</tr>\n\t</thead>\n\t<tbody>" );
		$pings = 0;
		foreach( $servers as $server )
		{
			$id = $server['id'];

			if( isset($librarian['pings'][$id]) )
			{
				$name = $server['name'];
				if( $this->isModule( 'Server' ))
				{
					$name = sprintf( "<a href='%s/server/%s/'>%s</a>",
						parent::$Root, $id, $name );
				}
				$pings += $librarian['pings'][$id];
				FOstatusUI::content( "\n\t\t<tr>\n\t\t\t<td>%s</td><td>%d</td><td>%s</td><td>%s</td>\n\t\t</tr>\n",
					$name,
					$librarian['pings'][$id],
					$this->bytesToSize( $librarian['pings'][$id] * 4 ),
					$this->bytesToSize( $librarian['pings'][$id] * 16 )
				);
			}
		}
		FOstatusUI::content( "\t</tbody>\n\t<tfoot>\n\t\t<tr>\n\t\t\t<td></td><td>%d</td><td>%s</td><td>%s</td>\n\t\t</tr>\n\t</tfoot>",
			$pings,
			$this->bytesToSize( $pings * 4 ),
			$this->bytesToSize( $pings * 16 )
		);
		FOstatusUI::content( "\n</table>" );
	}
}

?>