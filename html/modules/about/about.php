<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'UI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class About extends FOstatusModule
{
	public function init()
	{
		UI::menu( 'about','About', 999 );

		parent::$Slim->get( '/about/', function()
		{
			$this->aboutSoftware();
		});

		$this->RoutesInfo['about/config'] = "Informations about configuration format";
		parent::$Slim->get( '/about/config/', function()
		{
			$this->aboutConfig();
		});

		$this->RoutesInfo['about/modules'] = "Auto-generated informations about used modules";
		parent::$Slim->get( '/about/modules/', function()
		{
			$this->aboutModules();
		});
	}

	private function aboutSoftware()
	{
		UI::start( $this );
		UI::title( 'About' );
		UI::contentStatic( 'main' );

		$software = array(
			'*1'			=> "\n\t<hr>",
			'Perl'			=> 'http://www.perl.org/',
			'PHP'			=> 'https://php.net/',
			'Slim'			=> 'http://slimframework.com/',
			'FOnlineFont'		=> 'https://github.com/wipe2238/fowww/blob/master/FOnlineFont.php',
			'*2'			=> "\n\t<hr>\nClient-side<br>",
			'jQuery'		=> 'https://jquery.com/',
			'Highcharts'		=> 'http://www.highcharts.com/products/highcharts/',
			'Highstock'		=> 'http://www.highcharts.com/products/highstock/',
			'*3'            => "\n\t<hr>\nArt<br>",
			'Fugue Icons'   => 'https://p.yusukekamiyamane.com/' 
		);

		foreach( $software as $name => $link )
		{
			$info = explode( '|', $name, 2 );

			if( $name == 'jQuery' && isset(UI::$vJquery) )
				array_push( $info, "(v" . UI::$vJquery . ")" );
			if( $name == 'Highcharts' && isset(UI::$vHighcharts ))
				array_push( $info, "(v" . UI::$vHighcharts . ")" );
			if( $name == 'Highstock' && isset(UI::$vHighstock ))
				array_push( $info, "(v" . UI::$vHighstock . ")" );

			if( $name[0] == '*' )
				UI::content( $link );
			else
			{
				UI::content( "\n\t<a href='%s'>%s</a>%s%s<br>",
					$link, $info[0],
					isset($info[1]) ? " $info[1]" : "",
					isset($info[2]) ? " $info[2]" : "" );
			}
		}
	}

	private function aboutModules()
	{
		UI::start( $this );
		UI::title( 'About : modules' );
		UI::contentStatic( 'modules' );

		foreach( array( 'Core' => 'FOstatusModule', 'UI' => 'UI' ) as $coreName => $coreClass )
		{
			UI::content( "\n<hr id='%s'>\n<table>\n\t<tr>\n\t\t<td colspan='2'><strong>%s</strong></td>\n\t</tr>",
				$coreName, $coreName );

			if( isset($coreClass::$CoreDescription) )
				UI::content( "\n\t<tr>\n\t\t<td>Description</td>\n\t\t<td>%s</td>\n\t</tr>", $coreClass::$CoreDescription );

			$class = new ReflectionClass( $coreClass );
			if( $class )
			{
				UI::content( "\n\t<tr>\n\t\t<td>Last update</td>\n\t\t<td>%s</td>\n\t</tr>",
					date ("j F Y, H:i", filemtime( $class->getFileName() )));
			}
			UI::content( "\n</table>" );
		}

		$instances = parent::$Instances;
		usort( $instances, function( $a, $b )
		{
			return( get_class( $a ) > get_class( $b ) ? 1 : -1 );
		});

		foreach( $instances as $instance )
		{
			$className = get_class( $instance );
			if( !$className )
				continue;

			UI::content( "\n<hr id='%s'>", $className );

			UI::content( "\n<table>" );

			UI::content( "\n\t<tr>\n\t\t<td>Module</td>\n\t\t<td><strong>%s</strong>",
				$className );

			$class = new ReflectionClass( $instance );
			$parents = array();

			$pClass = $class;
			while( $parent = $pClass->getParentClass() )
			{
				$parents[] = $parent->getName();
				$pClass = $parent;
			}
			array_pop( $parents ); // cut 'FOstatusModule' from list
			if( count($parents) )
			{
				UI::content( " &raquo; %s", implode( ' &raquo; ', $parents ));
			}
			UI::content( "</td>\n\t</tr>" );

			if( isset($instance->Author) )
				UI::content( "\n\t<tr><td>Author:</td><td>%s</td>>", $instance->Author );

			if( isset($instance->Version) )
				UI::content( "\n\t<tr><td>Version:</td><td>%s</td</tr>", $instance->Version );

			if( isset($instance->ID) )
				UI::content( "\n\t<tr>\n\t\t<td>Internal ID:</td>\n\t\t<td>%s</td>\n\t</tr>", $instance->ID );

			UI::content( "\n\t<tr>\n\t\t<td>Last update:</td>\n\t\t<td>%s</td>\n\t</tr>",
				date ("j F Y, H:i", filemtime( $class->getFileName() ))
			);

			if( isset($instance->Description) )
				UI::content( "\n\t<tr>\n\t\t<td>Description:</td>\n\t\t<td>%s</td>\n\t</tr>",
					$instance->Description );

			if( count($instance->Routes) )
			{
				UI::content( "\n\t<tr>\n\t\t<td colspan='2'>Provides:</td>\n\t</tr>" );
//				UI::content( "\n<table>" );
				foreach( $instance->Routes as $route )
				{
					// remove leading/trailing slash(es)
					UI::content( "\n\t<tr>" );
					if( preg_match( '!^[/]+(.*)$!', $route, $match ))
						$route = $match[1];
					if( preg_match( '!^(.*)[/]+$!', $route, $match ))
						$route = $match[1];

					$rawRoute = $route;
					$rawArgs  = false;

					$colspan = '';
					if( !isset($instance->RoutesInfo[$rawRoute]) )
						$colspan = " colspan='2' ";

					if( preg_match_all( '!:(\w+)!m', $route, $match ))
					{
						$rawArgs = true;
						foreach( $match[1] as $m )
						{
							$route = str_replace( ":$m", "<strong>[</strong>$m<strong>]</strong>", $route );
						}
						$route = str_replace( "_", " ", $route );
						UI::content( "\n\t\t<td%s>$route/</td>",
							$colspan );
					}
					else
						UI::content(
							"\n\t\t<td%s><a href='%s/%s'>%s/</a></td>",
							$colspan,
							parent::$Root,
							$route != '' ? "$route/" : '',
							$route
						);
					if( isset($instance->RoutesInfo[$rawRoute]) )
						UI::content( "\n\t\t<td>%s</td>",
							$instance->RoutesInfo[$rawRoute] );

					UI::content( "\n\t</tr>" );
				}
//				UI::content( "\n</table>" );
			}

			UI::content( "\n</table>" );
			if( isset($instance->Info) )
			{
				// split the table
				UI::content( "</table>\n<table>" );
				UI::content( "\nAdditional informations:<br>\n%s\n<br>",
					$instance->Info );
			}

		}
	}

	private function aboutConfig()
	{
		UI::start( $this );

		$context = array(
			'server' => array(
				'!'			=> 'Game definition',
				'='			=> 'test',
				'=id'			=> 'Virtual. Set to server identifier when returning array of servers',
				'=address'		=> 'Server will be checked only if both fields are set',
				'=url'			=> 'If <strong>website</strong> is set, <strong>link</strong> should be ignored',
				'=noping'		=> 'If true, server status will not be checked',
				'=color'		=> 'Should be respected by all types of charts',
				'id@id'			=> '',
				'name*'			=> 'Server name',
				'host@address'		=> 'Game address',
				'port@address'		=> 'Game port',
				'website@url'		=> 'Address of official game site',
				'link@url'		=> 'Place where to look for general informations about game - forum thread, games listings sites, etc.',
				'source'		=> 'Link to game source',
				'librarian'		=> 'Internal server ID set by Librarian. used to download and parse server database',
				'irc'			=> 'IRC channel, on ForestNet network, for given server, must start with "<strong>#</strong>"',
				'color@color'		=> 'Color of server used when drawing charts',
				'singleplayer@noping'	=> 'Boolean. Defines singleplayer-only game',
				'closed@noping'		=> 'Boolean. Server is no longer online, or not yet open for public'
			),
			'files' => array(
				'!'			=> 'Contains paths to all available data files<br>When property contains string like "<strong>{DIR:name}</strong>", config parser must replace it with property <strong>name</strong> in <strong>dirs</strong> section',
				'?'			=> 'TODO'
			),
			'dirs' => array(
				'!'			=> 'Dirs definitions, used when parsing entries from <strong>files</strong> section',
				''			=> 'Properties in this section are not supposed to be used directly as they are just a simple replacements, and may change without warning'
			)
		);

		UI::content( "\n\t<table>" );
		foreach( $context as $context_name => $context_info )
		{
			UI::content( "\n\t\t<tr>\n\t\t\t<td>%s</td>\n\t\t\t<td></td>\n\t\t\t<td>%s</td>\n\t\t\t<td></td>\n\t\t</tr>",
				$context_name,
				isset( $context[$context_name]['!'])
					? $context[$context_name]['!']
					: ''
			);
			UI::content( "\n\t\t<tr>\n\t\t\t<td>{</td>\n\t\t\t<td></td>\n\t\t\t<td></td>\n\t\t\t<td></td>\n\t\t</tr>" );

			$info = array();
			foreach( $context_info as $var_name => $var_description )
			{
				$required = false;
				$general = NULL;
				
				if( $var_name == '!' )
					continue; // already checked
				elseif( substr($var_name,0,1) == '=' )
				{
					$name = substr( $var_name, 1 );
					if( $name )
						$info[$name] = $var_description;
					continue;
				}
				else
				{
					UI::content( "\n\t\t<tr>" );
					$infos = array();
					if( substr( $var_name, -1 ) == '*' )
					{
						$required = true;
						$var_name = substr( $var_name, 0, -1 );
						UI::content( "\n\t\t\t<td>(required)</td>" );
					}
					else
						UI::content( "\n\t\t\t<td></td>" );

					$expl = explode( '@', $var_name, 2 );

					if( count($expl) > 1 )
					{
						$var_name = $expl[0];
						$infos = explode( ',', $expl[1] );
					}

					UI::content( "\n\t\t\t<td>%s</td>\n\t\t\t<td>%s</td>",
						$var_name, $var_description );

					if( count($infos) )
					{
						$useInfo = array();
						foreach( $infos as $extra )
						{
							if( isset($info[$extra]) )
							{
								array_push( $useInfo, $info[$extra] );
							}
						}
						UI::content( "\n\t\t\t<td>%s</td> ",
							implode( '<br>', $useInfo ));
					}
					else
						UI::content( "\n\t\t\t<td></td>" );

					UI::content( "\n\t\t</tr>" );
				}
			}
			UI::content( "\n\t\t<tr>\n\t\t\t<td>}</td>\n\t\t\t<td></td>\n\t\t\t<td></td>\n\t\t\t<td></td>\n\t\t</tr>" );
		}
		UI::content( "\n\t</table>" );
	}
};

?>