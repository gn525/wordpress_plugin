<?php
add_shortcode('spp-reviews','spp_reviews_shortcode');

function spp_reviews_shortcode($atts){
  extract( shortcode_atts( array(
		'limit' => 1		
	), $atts ) );
	return show_reviews($limit);
}
function show_reviews($limit){
			$reviews = get_reviews($limit);
			$html = '<ul>';
			foreach($reviews as $review){
				$html.='<li style="list-style:none !important">';
				$html.='<h5>'.$review['title'].'</h5>';
				$html.='<div><img src="http://simplepodcaster.com/wp-content/plugins/simple-podcast-press/icons/rating_stars/'.$review['ratings'].'star.gif"></div>';
				$html.='<p>'.$review['text'].'</p>';
				$html.='</li>';
			}
			$html.='</ul>';
			return $html;
}
function get_reviews($limit){
  
	
	$ret = array();
	$item = array();
  global $wpdb;
	$table_name = $wpdb->prefix.'spp_reviews';
	$reviews = $wpdb->get_results("select * from $table_name  where rw_ratings='5' OR rw_ratings='4' limit $limit");	
	foreach($reviews as $review){
		$item['title'] = $review->rw_title;
		$item['text'] = $review->rw_text;
		$item['ratings']  = $review->rw_ratings;
		$item['author'] = $reviews->rw_author;
		$ret[]  = $item;
	}
	return $ret;
}

class SppReviewsWidget extends WP_Widget{
	function __construct(){
	   parent::__construct('sppreviews_widget','Show Reviews',array('description'=>'Show Review from Database'));
	}
	
	public function widget($args,$instance){
		$limit = apply_filters( 'list', $instance['limit'] );
		echo $args['before_widget'];		
		if ( ! empty( $limit ) )
   	echo $args['before_title'].$args['after_title'];
    echo show_reviews($limit);
		echo $args['after_widget'];
	}
	
	public function form($instance){
	   if(isset($instance['limit'])){
		   $limit = $instance['limit'];
		 }else{
		   $limit = 5;
		 }
		 if(isset($instance['format'])){
		   $format = $instance['format'];
		 }else{
		   $format = 'list';
		 }
		 ?>
		  <table>
				<tr>
				  <td>limit:</td>
					<td><input type="text" value="<?php echo esc_attr($limit)?>" name="<?php echo $this->get_field_name('limit') ?>" id="<?php echo $this->get_field_id('limit')?>"></td>
				</tr>
				<tr>
				  <td>type:</td>						
					<td><input type="radio" value="list" id="<?php echo $this->get_field_id('format')?>" name="<?php echo $this->get_field_name('format') ?>" <?php if($format == 'list') { echo 'checked'; }; ?>> list</td>
				 	<td><input type="radio" value="rotator" id="<?php echo $this->get_field_id('format')?>" name="<?php echo $this->get_field_name('format') ?>" <?php if($format != 'list') { echo 'checked'; }; ?>> rotator</td>
				</tr>
			</table>			
		 <?php
	}
	
	public function update($newInstance,$oldInstance){
		$instance = array();
		$instance['limit'] = ( ! empty( $newInstance['limit'] ) ) ? strip_tags( $newInstance['limit'] ) : 5;
		$instance['format'] = ( ! empty( $newInstance['format'] ) ) ? strip_tags( $newInstance['format'] ) : 'list';
		return $instance;
	}
}

function spp_reviews_load(){
	register_widget('SppReviewsWidget');
}

add_action('widgets_init','spp_reviews_load');

function spp_reviews_enqueue_scripts(){
		wp_enqueue_script( 'rotator', plugins_url('/js/rotator.js', __FILE__), array('jquery'), false, true );
}

add_action( 'wp_enqueue_scripts', 'spp_reviews_enqueue_scripts' );