<?php

if( !defined( 'FODEV:STATUS' ))
{
	header( 'Location: /', true, 303 );
	exit;
}

abstract class FOStatusModule
{
	//+++ informations for About module +++//

	// modules objects
	public static $Instances = array();

	// Root URI
	public static $Root = NULL;

	// Description
	public static $CoreDescription = 'Base modules functionality';

	// list of routes handled by module
	public $Routes = array();

	// extra informations when listing routes provided by the module (html)
	// used as associative array, key name must be the same as route path,
	// without leading/trailing slash
	public $RoutesInfo = array();

	// if true, module won't be listed
	public $Hidden = false;

	// module author (html)
	public $Author = NULL;

	// short module description (html)
	public $Description = NULL;

	// additional description (html)
	public $Info = NULL;

	//--- informations for About module ---//

	// Slim object
	public static $Slim = NULL;

	// FOstatus object
	public static $FO = NULL;

	// various module tools

	public static function initialize( \Slim\Slim $app, FOstatus $status )
	{
		self::$Slim = $app;
		self::$Root = self::$Slim->request->getRootUri();

		self::$FO = $status;

		foreach( get_declared_classes() as $class )
		{
			if( is_subclass_of( $class, 'FOstatusModule' ))
			{
				$module = new $class();
				if( $module )
				{
					array_push( self::$Instances, $module );
				}
			}
		}

		foreach( self::$Instances as $module )
		{
			$old_routes = self::getSlimRoutes();
			$module->init();
			$module->Routes = array_diff( self::getSlimRoutes(), $old_routes );
		}
	}

	private static function getSlimRoutes()
	{
		$routes = array();

		$classRouter = new ReflectionClass( self::$Slim->router );
		$protectedRoutes = $classRouter->getProperty( 'routes' );
		$protectedRoutes->setAccessible( true );
		foreach( $protectedRoutes->getValue( self::$Slim->router ) as $protectedRoute )
		{
			$classRoute = new ReflectionClass( $protectedRoute );
			$protectedPattern = $classRoute->getProperty( 'pattern' );
			$protectedPattern->setAccessible( true );
			array_push( $routes, $protectedPattern->getValue( $protectedRoute ));
		}

		return( $routes );
	}

	public static function isModule( $name )
	{
		foreach( self::$Instances as $instance )
		{
			$className = get_class( $instance );
			if( $className == $name )
				return( true );
		}

		return( false );
	}

	public static function getModule( $name )
	{
		foreach( self::$Instances as $instance )
		{
			$className = get_class( $instance );
			if( $className && $className == $name )
				return( $instance );
		}

		return( NULL );
	}

	public function bytesToSize( $size, $precision = 2 )
	{
		$base = log($size) / log(1024);
		$suffixes = array('B', 'KB', 'MB', 'GB', 'TB');

		return( round( pow( 1024, $base - floor( $base )), $precision ) . ' ' . $suffixes[floor($base)] );
	}

	public function filterServers( $input, array &$result, $path, $allowSingleplayer = true )
	{
		if( !is_string($input) )
			return( false );

		if( !is_array($result) )
			return( false );

		$result = array();

		// strict arguments
		if( !preg_match( '!^[a-z0-9_]+$!', $input ) && !preg_match( '!^[a-z0-9_,]+$!', $input ))
		{
			parent::$Slim->redirect( parent::$Root.$path, 303 );
			return( false );
		}

		// recreate servers list

		// remove duplicates and sort
		$original = array_unique( explode( ',', $input ));

		// strip unneeded servers
		foreach( $original as $id )
		{
			if( !isset( self::$FO->Config['server'][$id] ))
				continue;

			if( !$allowSingleplayer &&
				isset(self::$FO->Config['server'][$id]['singleplayer']) &&
				self::$FO->Config['server'][$id]['singleplayer'] == true )
				continue;

			array_push( $result, $id );
		}

		// "pretty urls" taken to whole new level!
		sort( $result );

		// if recreated servers list is different than original,
		// redirect user to new address
		if( count($original) != count($result) || $original !== $result )
		{
			if( count($result) > 0 )
				self::$Slim->redirect( self::$Root.$path.implode( ',',$result ).'/', 303 );
			else
				self::$Slim->redirect( self::$Root.$path, 303 );

			return( false );
		}

		return( true );
	}

	//
	// module stub
	//

	// module initialization
	// called after spawning module
	abstract public function init();
};

?>