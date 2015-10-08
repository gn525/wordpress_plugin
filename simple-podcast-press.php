<?php

/*
Plugin Name: Simple Podcast Press

Description: 1-Click Podcast Website Publishing.  The simplest way to publish your podcasts to your WordPress site, attract more listeners, and grow your audience.

Version: 1.323

Author: Hani Mourra

Plugin URI: http://www.simplepodcastpress.com/
*/

require dirname(__FILE__) . '/updater/plugin-update-checker.php';
$MyUpdateChecker = PucFactory::buildUpdateChecker(
'http://simplepodcastpress.com/updater/?action=get_metadata&slug=simple-podcast-press', 
__FILE__, 
'simple-podcast-press'
);


include_once('spp.php');

$ob_wp_simplepodcastpress=new wp_simplepodcastpress();
	if(isset($ob_wp_simplepodcastpress)){
		register_activation_hook( __FILE__,array(&$ob_wp_simplepodcastpress,'simplepodcastpress_activate'));
		register_deactivation_hook( __FILE__, array(&$ob_wp_simplepodcastpress,'simplepodcastpress_deactivate') );
	}
?>
