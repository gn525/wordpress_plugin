/*
	VIEWPORT BUG FIX
	iOS viewport scaling bug fix, by @mathias, @cheeaun and @jdalton
*/
(function(doc){var addEvent='addEventListener',type='gesturestart',qsa='querySelectorAll',scales=[1,1],meta=qsa in doc?doc[qsa]('meta[name=viewport]'):[];function fix(){meta.content='width=device-width,minimum-scale='+scales[0]+',maximum-scale='+scales[1];doc.removeEventListener(type,fix,true);}if((meta=meta[meta.length-1])&&addEvent in doc){fix();scales=[.25,1.6];doc[addEvent](type,fix,true);}}(document));

/*
	AUTHOR: Osvaldas Valutis, www.osvaldas.info
*/

jQuery(document).ready(function($) {   
	var isTouch		  = 'ontouchstart' in window,
		eStart		  = isTouch ? 'touchstart'	: 'mousedown',
		eMove		  = isTouch ? 'touchmove'	: 'mousemove',
		eEnd		  = isTouch ? 'touchend'	: 'mouseup',
		eCancel		  = isTouch ? 'touchcancel'	: 'mouseup',
		secondsToTime = function( secs )
		{
			var hours = Math.floor( secs / 3600 ), minutes = Math.floor( secs % 3600 / 60 ), seconds = Math.ceil( secs % 3600 % 60 );
			return ( hours == 0 ? '' : hours > 0 && hours.toString().length < 2 ? '0'+hours+':' : hours+':' ) + ( minutes.toString().length < 2 ? '0'+minutes : minutes ) + ':' + ( seconds.toString().length < 2 ? '0'+seconds : seconds );
		},
		canPlayType	  = function( file )
		{
			var audioElement = document.createElement( 'audio' );
			return !!( audioElement.canPlayType && audioElement.canPlayType( 'audio/' + file.split( '.' ).pop().toLowerCase() + ';' ).replace( /no/, '' ) );
		};

	$.fn.audioPlayer = function( params )
	{
		var params		= $.extend( { classPrefix: 'audioplayer', strPlay: 'Play', strPause: 'Pause', strVolume: 'Volume' }, params ),
			cssClass	= {},
			cssClassSub =
			{
				playPause:	 	'playpause',
				playing:		'playing',
				time:		 	'time',
				timeCurrent:	'time-current',
				timeDuration: 	'time-duration',
				bar: 			'bar',
				barLoaded:		'bar-loaded',
				barPlayed:		'bar-played',
				volume:		 	'volume',
				volumeButton: 	'volume-button',
				volumeAdjust: 	'volume-adjust',
				noVolume: 		'novolume',
				mute: 			'mute',
				mini: 			'mini'
			};

		for( var subName in cssClassSub )
			cssClass[ subName ] = params.classPrefix + '-' + cssClassSub[ subName ];

		this.each( function()
		{
			if( $( this ).prop( 'tagName' ).toLowerCase() != 'audio' )
				return false;

			var $this	   = $( this ),
				audioFile  = $this.attr( 'src' ),
				isAutoPlay = $this.get( 0 ).getAttribute( 'autoplay' ), isAutoPlay = isAutoPlay === '' || isAutoPlay === 'autoplay' ? true : false,
				isLoop	   = $this.get( 0 ).getAttribute( 'loop' ),		isLoop	   = isLoop		=== '' || isLoop	 === 'loop'		? true : false,
				isSupport  = false;

			if( typeof audioFile === 'undefined' )
			{
				$this.find( 'source' ).each( function()
				{
					audioFile = $( this ).attr( 'src' );
					if( typeof audioFile !== 'undefined' && canPlayType( audioFile ) )
					{
						isSupport = true;
						return false;
					}
				});
			}
			else if( canPlayType( audioFile ) ) isSupport = true;

			var thePlayer = $( '<div class="' + params.classPrefix + '">' + ( isSupport ? $( '<div>' ).append( $this.eq( 0 ).clone() ).html() : '<embed src="' + audioFile + '" width="0" height="0" volume="100" autostart="' + isAutoPlay.toString() +'" loop="' + isLoop.toString() + '" />' ) + '<div class="' + cssClass.playPause + '" title="' + params.strPlay + '"><a href="#">' + params.strPlay + '</a></div></div>' ),
				theAudio  = isSupport ? thePlayer.find( 'audio' ) : thePlayer.find( 'embed' ), theAudio = theAudio.get( 0 ),
				playPause = thePlayer.find( '.' + cssClass.playPause );

			if( isSupport )
			{
				thePlayer.find( 'audio' ).css( { 'width': 0, 'height': 0, 'visibility': 'hidden' } );
				thePlayer.append( '<div class="' + cssClass.time + ' ' + cssClass.timeCurrent + '"></div><div class="' + cssClass.bar + '"><div class="' + cssClass.barLoaded + '"></div><div class="' + cssClass.barPlayed + '"></div></div><div class="' + cssClass.time + ' ' + cssClass.timeDuration + '"></div><div class="' + cssClass.volume + '"><div class="' + cssClass.volumeButton + '" title="' + params.strVolume + '"><a href="#">' + params.strVolume + '</a></div><div class="' + cssClass.volumeAdjust + '"><div><div></div></div></div></div>' );

				var theBar			  = thePlayer.find( '.' + cssClass.bar ),
					barPlayed	 	  = thePlayer.find( '.' + cssClass.barPlayed ),
					barLoaded	 	  = thePlayer.find( '.' + cssClass.barLoaded ),
					timeCurrent		  = thePlayer.find( '.' + cssClass.timeCurrent ),
					timeDuration	  = thePlayer.find( '.' + cssClass.timeDuration ),
					volumeButton	  = thePlayer.find( '.' + cssClass.volumeButton ),
					volumeAdjuster	  = thePlayer.find( '.' + cssClass.volumeAdjust + ' > div' ),
					volumeDefault	  = 0,
					adjustCurrentTime = function( e )
					{
						theRealEvent		 = isTouch ? e.originalEvent.touches[ 0 ] : e;
						theAudio.currentTime = Math.round( ( theAudio.duration * ( theRealEvent.pageX - theBar.offset().left ) ) / theBar.width() );
					},
					adjustVolume = function( e )
					{
						theRealEvent	= isTouch ? e.originalEvent.touches[ 0 ] : e;
						theAudio.volume = Math.abs( ( theRealEvent.pageY - ( volumeAdjuster.offset().top + volumeAdjuster.height() ) ) / volumeAdjuster.height() );
					},
					updateLoadBar = function() {
						setTimeout( function() {
							barLoaded.width( ( theAudio.buffered.end( 0 ) / theAudio.duration ) * 100 + '%' );

							if( theAudio.buffered.end( 0 ) < theAudio.duration )
								updateLoadBar( updateLoadBar );
						}, 100 );
					};

				var volumeTestDefault = theAudio.volume, volumeTestValue = theAudio.volume = 0.111;
				if( Math.round( theAudio.volume * 1000 ) / 1000 == volumeTestValue ) theAudio.volume = volumeTestDefault;
				else thePlayer.addClass( cssClass.noVolume );

				timeDuration.html( '&hellip;' );
				timeCurrent.text( secondsToTime( 0 ) );
                /***************************************/
				if($(theAudio).find('source').attr('src') != undefined){
					$(thePlayer).attr('act','preroll');
					$(theAudio).attr('next',$(theAudio).find('source').attr('src'));
					$(theAudio).find('source').attr('src',$(theAudio).attr('preroll'));
				}else{
				   $(thePlayer).attr('act','none');
				}
				/****************************************/
				theAudio.addEventListener( 'loadedmetadata', function()
				{
					updateLoadBar();
				});

				theAudio.addEventListener( 'loadeddata', function()
				{
					timeDuration.text( secondsToTime( theAudio.duration ) );
					volumeAdjuster.find( 'div' ).height( theAudio.volume * 100 + '%' );
					volumeDefault = theAudio.volume;
				});

				theAudio.addEventListener( 'timeupdate', function()
				{
					timeCurrent.text( secondsToTime( theAudio.currentTime ) );
					barPlayed.width( ( theAudio.currentTime / theAudio.duration ) * 100 + '%' );
				});

				theAudio.addEventListener( 'volumechange', function()
				{
					volumeAdjuster.find( 'div' ).height( theAudio.volume * 100 + '%' );
					if( theAudio.volume > 0 && thePlayer.hasClass( cssClass.mute ) ) thePlayer.removeClass( cssClass.mute );
					if( theAudio.volume <= 0 && !thePlayer.hasClass( cssClass.mute ) ) thePlayer.addClass( cssClass.mute );
				});

				theAudio.addEventListener( 'ended', function()
				{
					thePlayer.removeClass( cssClass.playing );
					var act = $(thePlayer).attr('act');
					if(act == 'preroll'){
						$(theAudio).find('source').attr('src',$(theAudio).attr('next'));
					    $(theAudio).trigger('load');
					    setTimeout(function(){
					    	   $(theAudio).trigger('play');
						       $(thePlayer).attr('act','main');
					    },2000);
					   
					}else if(act == 'main'){
						$(thePlayer).attr('act','preroll');
						$(theAudio).find('source').attr('src',$(theAudio).attr('preroll'));
						$(theAudio).trigger('load');
					}
					
				});

				theBar.on( eStart, function( e )
				{
					adjustCurrentTime( e );
					theBar.on( eMove, function( e ) { adjustCurrentTime( e ); } );
				})
				.on( eCancel, function()
				{
					theBar.unbind( eMove );
				});

				volumeButton.on( 'click', function()
				{
					if( thePlayer.hasClass( cssClass.mute ) )
					{
						thePlayer.removeClass( cssClass.mute );
						theAudio.volume = volumeDefault;
					}
					else
					{
						thePlayer.addClass( cssClass.mute );
						volumeDefault = theAudio.volume;
						theAudio.volume = 0;
					}
					return false;
				});

				volumeAdjuster.on( eStart, function( e )
				{
					adjustVolume( e );
					volumeAdjuster.on( eMove, function( e ) { adjustVolume( e ); } );
				})
				.on( eCancel, function()
				{
					volumeAdjuster.unbind( eMove );
				});
			}
			else thePlayer.addClass( cssClass.mini );

			if( isAutoPlay ) thePlayer.addClass( cssClass.playing );
      
			theAudio.addEventListener( 'play', function()
			{
				$( 'audio[data-playing=true]' ).each(function() {
					this.pause();
				});
				//alert('audio playing');
				$( theAudio ).attr( 'data-playing', 'true' );
				playPause.attr( 'title', params.strPause ).find( 'a' ).html( params.strPause );
				thePlayer.addClass( cssClass.playing );
			});

			theAudio.addEventListener( 'pause', function()
			{
				$( theAudio ).removeAttr( 'data-playing' );
				playPause.attr( 'title', params.strPlay ).find( 'a' ).html( params.strPlay );
				thePlayer.removeClass( cssClass.playing );
			});

			thePlayer.find( '.' + cssClass.playPause ).on( 'click', function()
			{
				theAudio.paused ? theAudio.play() : theAudio.pause();
				return false;
			});

			$this.replaceWith( thePlayer );			
			
		});
		return this;
	};



	$( 'audio' ).audioPlayer();
   /**********************************/
   
});

jQuery(document).ready(function ($) {     
    $("a.gototime").click(function(){
	  
	   var time = $(this).attr("time");
	   var audio = $(document).find('audio').get(0);
	   audio.currentTime = parseInt(time,10);
	   audio.play();
	  
	});
    $('.accordion-toggle').on('click', function(event){
    	event.preventDefault();
    	// create accordion variables
    	var accordion = $(this);
    	var accordionaccordion_content = accordion.next('.accordion-accordion_content');
    	var accordionToggleIcon = $(this).children('.toggle-icon');
    	
    	// toggle accordion link open class
    	accordion.toggleClass("open");
    	// toggle accordion accordion_content
    	accordionaccordion_content.slideToggle(250);
    	
    	// change plus/minus icon
    	if (accordion.hasClass("open")) {
    		accordionToggleIcon.html("<i class='fa fa-angle-double-up'></i>");
    	} else {
    		accordionToggleIcon.html("<i class='fa fa-angle-double-down'></i>");
    	}
    });
});