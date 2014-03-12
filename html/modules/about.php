<?php

if( !defined( 'FODEV:STATUS' ) || !class_exists( 'FOstatusModule' ) || !class_exists( 'FOstatusUI' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

class About extends FOstatusModule
{
	public function init()
	{
		FOstatusUI::menu( 'about','About', 999 );

		parent::$Slim->get( '/about/', function()
		{
			FOstatusUI::title( 'About' );

			$this->aboutMain();
			$this->aboutSoftware();
		});

		$this->RoutesInfo['about/modules'] = "Auto-generated informations about used modules";
		parent::$Slim->get( '/about/modules/', function()
		{

			$this->aboutModules();
		});

		parent::$Slim->get( '/modules/', function()
		{
			parent::$Slim->redirect( parent::$Root.'/about/modules/' );
		});
	}

	private function aboutMain()
	{
		FOstatusUI::content( "<a href='modules/'>Modules info</a><br/>\n" );
	}

	private function aboutSoftware()
	{
		$software = array(
			'*1'			=> "\n\t<hr>",
			'Perl'			=> 'http://www.perl.org/',
			'Slim'			=> 'http://www.slimframework.com/',
			'FOnlineFont'		=> 'https://github.com/wipe2238/fowww/blob/master/class/FOnlineFont.php',
			'*2'			=> "\n\t<hr>",
			'jQuery'		=> 'http://jquery.com/',
			'Highcharts'		=> 'http://www.highcharts.com/products/highcharts/',
			'Highstock'		=> 'http://www.highcharts.com/products/highstock/',
		);

		foreach( $software as $name => $link )
		{
			$info = explode( '|', $name, 2 );

			if( $name == 'jQuery' && isset(FOstatusUI::$vJquery) )
				array_push( $info, "(v" . FOstatusUI::$vJquery . ")" );
			if( $name == 'Highcharts' && isset(FOstatusUI::$vHighcharts ))
				array_push( $info, "(v" . FOstatusUI::$vHighcharts . ")" );
			if( $name == 'Highstock' && isset(FOstatusUI::$vHighstock ))
				array_push( $info, "(v" . FOstatusUI::$vHighstock . ")" );

			if( $name[0] == '*' )
				FOstatusUI::content( $link );
			else
			{
				FOstatusUI::content( "\n\t<a href='%s'>%s</a>%s%s<br>",
					$link, $info[0],
					isset($info[1]) ? " $info[1]" : "",
					isset($info[2]) ? " $info[2]" : "" );
			}
		}
	}

	private function aboutModules()
	{
		FOstatusUI::title( 'About : modules' );

		FOstatusUI::content( "\n<strong id='Core'>Core</strong><br/>" );

		if( isset(parent::$CoreDescription) )
			FOstatusUI::content( "\nDescription: %s<br/>", parent::$CoreDescription );

		$class = new ReflectionClass( 'FOstatusModule' );
		if( $class )
		{
			FOstatusUI::content( "\nLast update: %s<br/>",
				date ("j F Y, H:i", filemtime( $class->getFileName() )));
		}

		foreach( FOstatusModule::$Instances as $instance )
		{
			if( $instance->Hidden )
				continue;

			$className = get_class( $instance );
			if( !$className )
				continue;

			FOstatusUI::content( "\n<hr/>" );

			FOstatusUI::content( "\nModule: <strong id='%s'>%s</strong>",
				$className, $className
			);

			$class = new ReflectionClass( $instance );
			$parents = array();

			$pClass = $class;
			while( $parent = $pClass->getParentClass() )
			{
				$parents[] = $parent->getName();
				$pClass = $parent;
			}
			array_pop( $parents );
			if( count($parents) )
			{
				FOstatusUI::content( " : %s", implode( ' -> ', $parents ));
			}
			FOstatusUI::content( "\n<br/>" );

			if( isset($instance->Author) )
				FOstatusUI::content( "\nAuthor: %s<br/>", $instance->Author );

			if( isset($instance->Version) )
				FOstatusUI::content( "\nVersion: %s<br/>", $instance->Version );

			FOstatusUI::content( "\nLast update: %s<br/>",
				date ("j F Y, H:i", filemtime( $class->getFileName() ))
			);

			if( isset($instance->Description) )
				FOstatusUI::content( "\nDescription: %s<br/>",
					$instance->Description );

			if( count($instance->Routes) )
			{
				FOstatusUI::content( "\nProvides:<br/>" );
				FOstatusUI::content( "\n<table>" );
				foreach( $instance->Routes as $route )
				{
					// remove leading/trailing slash(es)
					FOstatusUI::content( "\n\t<tr>" );
					if( preg_match( '!^[/]+(.*)$!', $route, $match ))
						$route = $match[1];
					if( preg_match( '!^(.*)[/]+$!', $route, $match ))
						$route = $match[1];

					$rawRoute = $route;
					$rawArgs  = false;

					if( preg_match_all( '!:(\w+)!m', $route, $match ))
					{
						$rawArgs = true;
						foreach( $match[1] as $m )
						{
							$route = str_replace( ":$m", "<strong>[</strong>$m<strong>]</strong>", $route );
						}
						$route = str_replace( "_", " ", $route );
						FOstatusUI::content( "\n\t\t<td>$route/</td>" );
					}
					else
						FOstatusUI::content(
							"\n\t\t<td><a href='%s/%s'>%s/</a></td>",
							parent::$Root,
							$route != '' ? "$route/" : '',
							$route
						);
					if( isset($instance->RoutesInfo[$rawRoute]) )
						FOstatusUI::content( "\n\t\t<td>%s</td>",
							$instance->RoutesInfo[$rawRoute] );
					/*
					else
						FOstatusUI::content( "\t\t<td>%s</td>",
							"route&lt;$rawRoute&gt;" );
					*/

					FOstatusUI::content( "\n\t</tr>" );
				}
				FOstatusUI::content( "\n</table>" );
			}

			if( isset($instance->Info) )
			{
				FOstatusUI::content( "\nAdditional informations:<br/>\n%s<br/>",
					$instance->Info );
			}
		}
	}
};

?>