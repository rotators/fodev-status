<?php

// helper (temporary?)

include( 'lib/FOnlineFont.php' );

if( !isset($_GET['t']) || !isset($_GET['f']) || !isset($_GET['r']) || !isset($_GET['g']) || !isset($_GET['b']) )
	exit;

$text = $_GET['t'];
$font = $_GET['f'];
$r = $_GET['r'];
$g = $_GET['g'];
$b = $_GET['b'];

if( !ctype_digit($r) || !ctype_digit($g) || !ctype_digit($b) )
	exit;

if( !file_exists( "fonts/$font.fofnt" ))
	exit;

$fofnt = new FOnlineFont( "fonts/$font.fofnt" );
$img = $fofnt->TextToImage( $text, $r, $g, $b );
header( "Content-Type: image/png" );
imagepng($img);
imagedestroy($img);

?>