/**
 * Parallax Slider
 * Version 1.1.7
 * Please fork on github!
 * @author Circle Tree, LLC
 * @TODO fix prev/next click not resetting timeout or clearing it altogether
 * @TODO fix options thumbnails disabled
 * @TODO test circular function
 * @TODO check width of each slider and thumbnail, to allow for unique widths
 */
(function($) {
	var options = {
			autoPlay			: 3000,//(mixed) (bool) false to disable, (int) duration to hold between slides in ms
			speed			: 1000,//(int) speed of each slide animation in ms
			easingBg		: 'easeInOutQuart',//(string) easing effect for the background animation
			easing			: 'easeInOutQuart',//(string) easing effect for the slide animation
			circular		: true,//(bool) true, will repeat, false, will stop at the end
			thumbs			: true,// (bool) true enables thumbnails, false disables
			thumbRotation	: 5,//(mixed): (int) degrees thumbs will be randomly rotated, bool false to disable rotation
			thumbAnimate 	: -10, //(int) px to animate thumbnails
			thumbAnimateTime: 100, //(int) ms animation for thumb animation
			fadein: 1000, //(int) ms after images loaded fade in duration
			numBackgrounds: 3, //(int) Number of parallax backgrounds
			customBackground: false, //(string) Custom Background markup
			debug: false //(bool) true: enable console statements for debugging
		};
	var methods = {
			init: function  (userOptions) {
				return this.each(function() {
					$.extend(options, userOptions);
					var $pxs_container 	= $(this),
					data = $pxs_container.data('lax');
					//If the element has already been initialized, just return it.
					if (data) return $pxs_container;
					if (options.debug) {
						console.group('jquery.parallax init');
						console.log('settings',options);
						if (options.speed > options.autoPlay) console.warn('Slide Transition duration should be shorter than automatic transitions');
					}
					//the main slider
					var $pxs_slider		= $('.pxs_slider',$pxs_container),
					$elems			= $pxs_slider.children(),
					total_elems		= $elems.length,
					$pxs_next		= $('.pxs_next',$pxs_container),
					$pxs_prev		= $('.pxs_prev',$pxs_container),
					$pxs_bg		= $('.pxs_bg',$pxs_container),
					backgrounds = [];
					for ( var int = options.numBackgrounds; int > 0; int--) {
						var $bkg = $('<div class="pxs_bg'+int+'"></div>');
						$bkg.appendTo($pxs_bg);
						backgrounds[int] = $bkg;
					}
					
					if (options.customBackground) {
						$(options.customBackground).appendTo($pxs_bg);
					}
					//the thumbs container
					$pxs_thumbnails = $('.pxs_thumbnails',$pxs_container),
					//the thumbs
					$thumbs			= $pxs_thumbnails.children(),
					//the loading image
					$pxs_loading	= $('.pxs_loading',$pxs_container),
					$pxs_slider_wrapper = $('.pxs_slider_wrapper',$pxs_container),
					$pxs_actions = $("<span class=\"pxs_actions\"></span>"), 
					$one_img = $($pxs_slider.find('img')[0]);
					$pxs_actions.appendTo($pxs_container);
					//Prepare the loading state
					$pxs_loading.show();
					$pxs_slider_wrapper.hide();
					//add data to DOM if not set
					if (! data) {
						$pxs_container.data('lax', {
							target: $pxs_container,
							total_elems: total_elems,
							backgrounds: backgrounds,
							buttons: {	play: $("<span class=\"pxs_play\">Play</span>"), 
											pause: $("<span class=\"pxs_pause\">Pause</span>") },
							current: 0,
							slideshow:-1,
							one_image_w: $one_img.width(),
							image_aspect: $one_img.width()/$one_img.height(),
							nav_offset: parseInt( $(".pxs_navigation SPAN").css('width') ) + parseInt( $("UL.pxs_slider LI IMG").css('border-left-width')),
							w_w: $(window).width(),
							viewport_width: $pxs_container.width(),
							images:$elems.find('IMG'),
							thumbs: $thumbs
						});
						data = $pxs_container.data('lax');
					}
					//Set up the play/pause buttons
					data.buttons.play.bind('click.lax', function  () {
						$pxs_container.parallaxSlider('play',true);
						return false;
						}).appendTo($pxs_actions);		 
					data.buttons.pause.bind('click.lax', function  () {
						$pxs_container.parallaxSlider('stop');
						return false;
						}).appendTo($pxs_actions).hide();		 
					if (options.debug) console.log('init data',data);
					/*
					 * Private method to resize the slider
					 */
					function _setWidths() {
						var position_nav	= 0,
						nav_top = 0;
						if (options.debug) console.log('setwidth called');
						//each element will have a width = windows width
						$elems.css({
							width: data.viewport_width + 'px'
						});
						if (data.viewport_width < (data.one_image_w + data.nav_offset*2)) {
							//Viewport is wider than images + nav
							var width = data.viewport_width - data.nav_offset*2,
							height = parseInt(width/data.image_aspect),
							nav_top = (height/2) + ($pxs_next.height()/4);
							var images_css_object = {width: width+'px',height:height+'px'};
						} else {
							//Images are larger than viewport
							var position_nav	= (data.viewport_width/2) - (data.one_image_w/2) - data.nav_offset;
							nav_top = ((data.one_image_w / data.image_aspect) / 2) + ($pxs_next.height()/4);
							var images_css_object = {width: data.one_image_w+'px',height:(data.one_image_w/data.image_aspect)+'px'};
						}
						data.images.css(images_css_object);
						if (options.debug) {
							console.log('slider viewport width',data.viewport_width);
							console.log('images_css_object',images_css_object);
							console.log('nav_top', nav_top);
							console.log('position nav',position_nav);
						}
						//Space the thumbs
						data.thumbs.each(function(i){
							var $this 	= $(this);
							//set the left offset to current thumb index *
							var left = 0,
							thumbwidth = $this.width(),
							thumbspace = thumbwidth * data.total_elems,
							offset = (data.viewport_width - thumbspace) / (data.total_elems + 1);
							if (i==0) left = offset;
							else left	= ((i+1) * offset) + (i * thumbwidth);
							$this.css('left',left+'px');
						});
						//Position the Thumbnail Container 
						$pxs_thumbnails.css({
							'width'			: data.viewport_width + 'px',
							'margin-left' 	: -data.viewport_width/2 + 'px'
						});
						$pxs_next.css('right', position_nav + 'px');
						$pxs_prev.css('left', position_nav + 'px');
						$pxs_next.add($pxs_prev).css('top',nav_top + 'px');
						var pxs_slider_w	= data.viewport_width * data.total_elems;
						//Set the widths of all backgrounds and the slider
						$pxs_slider.add(backgrounds).width(pxs_slider_w + 'px');
					}
					
					/*
					clicking a thumb will slide to the respective image
					 */
					data.thumbs.bind('click.lax',function(){
						var $thumb	= $(this);
						//if autoplay interrupt when user clicks
						if(options.autoPlay)
							$pxs_container.parallaxSlider('stop');
						data.current = $thumb.index();
						$pxs_container.parallaxSlider('slide',$thumb.index());
					});
					//slide when clicking the navigation buttons
					$pxs_next.on('click.lax',function(){
						//if autoplay interrupt when user clicks
						if(options.autoPlay)
							$pxs_container.parallaxSlider('stop');
						if (options.debug) console.log('next clicked: '+data.current);
//						data.current += 1;
						$pxs_container.parallaxSlider('slide');
					});
					$pxs_prev.on('click.lax',function(){
						//if autoplay interrupt when user clicks
						if(options.autoPlay)
							$pxs_container.parallaxSlider('stop');
						data.current--;
						if(data.current < 0)
							if(options.circular)
								data.current = data.total_elems - 1;
						else{
							data.current++;
							return false;
						}
						if (options.debug) console.log('prev clicked: '+data.current);
						$pxs_container.parallaxSlider('slide',data.current);
					});
							
					if(options.thumbRotation){
						var angle 	= Math.floor(Math.random()*(2*options.thumbRotation))-(options.thumbRotation);
						data.thumbs.css({
							'-o-transform'	: 'rotate('+ angle +'deg)',
							'-moz-transform'	: 'rotate('+ angle +'deg)',
							'-webkit-transform'	: 'rotate('+ angle +'deg)',
							'transform'			: 'rotate('+ angle +'deg)'
						});
					}
					//hovering the thumbs animates them up and down
					data.thumbs.on('mouseover.lax', function(e){
						$(this).stop().animate({top:options.thumbAnimate+'px'},options.thumbAnimateTime);
					}).on('mouseout.lax',function(){
						$(this).stop().animate({top:'0px'}, options.thumbAnimateTime);
					});
							
					//make the first thumb selected
					$($(".pxs_thumbnails LI",data.target)[0]).addClass('selected');
							
					/*
					when resizing the window,
					we need to recalculate the widths of the
					slider elements, based on the new windows width.
					we need to slide again to the current one,
					since the left of the slider is no longer correct
					 */
					$(window).resize(function(){
						data.w_w = $(window).width();
						data.viewport_width = $pxs_container.width();
						_setWidths();
						$pxs_container.parallaxSlider('slide',data.current,0);
					});
					/*
					 * Make sure all images have been loaded
					 * Check height is defined for IE compatibility
					 */
					var loaded = 0;
					data.images.each( function  () {
						if (data.images.css('height')) loaded++;
							if(loaded	== data.total_elems) {
								if (options.debug) console.log('all images loaded');
								$pxs_loading.hide();
								$pxs_slider_wrapper.fadeIn(options.fadein, function() {
									if (options.autoPlay) {
										$pxs_container.parallaxSlider('play');
									}
								});
								_setWidths();
							}
						});
				});//end jquery.each
				if (options.debug) console.groupEnd();
			},//End init
			stop: function  () {
				return this.each( function  () {
					var $this = $(this),
					data = $this.data('lax');
					//Toggle the buttons
					data.buttons.play.show();
					data.buttons.pause.hide();
					if (options.debug) console.log('pre-(stop) data',data.slideshow);
					clearInterval(data.slideshow);
					if (options.debug) console.log('stop data',data);
				});	
			},
			play: function  (playbutton) {
				//If this is a play button triggered event
				//Invoke a slide immediately for a more responsive "feel"
				if (playbutton) $this.parallaxSlider('slide',data.current+1);
				return this.each( function  () {
					options.circular = true;
					$this = $(this),
					data = $this.data('lax');
					if (options.debug) {
						console.log('play called on',$this);
						console.log('play data ',data);
						console.log('typeof data.slideshow',typeof(data.slideshow));
						console.log('data.slideshow',data.slideshow);
					}
					//Toggle the buttons
					data.buttons.pause.show();
					data.buttons.play.hide();
					if (options.autoPlay == 0) options.autoPlay = 3000; //Default override for API invoked play
					data.slideshow	= setInterval(function(){
						if (options.debug) console.log('play interval tick');
						//TODO
						$this.parallaxSlider('slide',undefined);
					}, options.autoPlay);
				});
			},
			/**
			 * slide method, slides to the specified slide
			 * @param slide int, slide number
			 */
			slide: function  (slide,timing) {
				return this.each( function  () {

				$this = $(this),
				data = $this.data('lax');
				if (typeof(slide) == 'undefined') {
					data.current++;
					if(data.current >= data.total_elems)
						if(options.circular)
							data.current = 0;
					else{
						data.current--;
						return false;
					}
					slide = data.current;
				} else data.current = slide;
				//If passed in timing is not undefined, allow it to override settings
				if (typeof(timing) != 'undefined') speed = timing;
				else speed = options.speed;
				if (options.debug) {
					console.log('slide called. Current: ',data.current);
					console.log(data);
				}
				$(".pxs_thumbnails LI",data.target).removeClass('selected');
				$($(".pxs_thumbnails LI",data.target)[data.current]).addClass('selected');
				var slide_to	= parseInt(-data.viewport_width * (slide));
				console.log(slide_to);
				//Animate the Slide
				$('.pxs_slider',data.target).stop().animate({
					left	: slide_to + 'px'
				},speed, options.easing);
				//Animate the Background Layers
				$.each(data.backgrounds, function (k,v) {
					$(v).stop().animate({
						left	: slide_to/((k+1)*2)+'px'
					},speed, options.easingBg);
				});
				});
			}, 
			/**
			 * Destroys the slider, and resets the DOM
			 */
			destroy: function  () {
				return this.each( function  () {
					$this = $(this),
					data = $this.data('lax');
					//Remove event delegation
					$("*",data.target).off('.lax');
					$.each(data.backgrounds, function  () {
						$(this).remove();
					});
					$.each(data.buttons, function  () {
						$(this).remove();
					});
					clearTimeout(data.slideshow);
					$this.removeData('lax');
					
				});
			}
	}; //End Methods
	
	$.fn.parallaxSlider = function(method) {
		// Method calling logic
	    if ( methods[method] ) {
	      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.parallaxSlider' );
	    }
	};/*****************************END jQuery Plugin **********/
})(jQuery);