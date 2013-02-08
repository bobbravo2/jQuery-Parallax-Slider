/**
 * jquery.imagesloaded
 */
(function(b){var j="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";b.fn.imagesLoaded=function(k){function l(){var c=b(h),a=b(g);d&&(g.length?d.reject(e,c,a):d.resolve(e));b.isFunction(k)&&k.call(f,e,c,a)}function m(c){var a=c.target;a.src===j||-1!==b.inArray(a,i)||(i.push(a),"error"===c.type?g.push(a):h.push(a),b.data(a,"imagesLoaded",{event:c.type,src:a.src}),o&&d.notify(e.length,i.length,h.length,g.length),0>=--n&&(setTimeout(l),e.unbind(".imagesLoaded",m)))}var f=this,
d=b.isFunction(b.Deferred)?b.Deferred():0,o=b.isFunction(d.notify),e=f.find("img").add(f.filter("img")),n=e.length,i=[],h=[],g=[];n||l();e.bind("load.imagesLoaded error.imagesLoaded",m).each(function(){var c=this.src,a=b.data(this,"imagesLoaded");a&&a.src===c?b(this).triggerHandler(a.event):(this.src=j,this.src=c)});return d?d.promise(f):f}})(jQuery);
/**
 * jQuery Parallax Image Slider
 * Version 1.2.1
 * Please fork on github!
 * @author Circle Tree, LLC
 * @depends imagesloaded https://github.com/desandro/imagesloaded
 * @TODO fix options thumbnails disabled
 * @TODO check width of each slider and thumbnail, to allow for unique widths
 */
(function($) {
	var globalOptions = {
			autoPlay			: 3000,//(mixed) (bool) false to disable, (int) duration to hold between slides in ms
			circular		: true,//(bool) true, will repeat, false, will stop at the end
			css3			: false, //(bool) enable CSS3 transitions?
			css3Easing		: 'ease',//(string) easing CSS3 for the animation
			easing			: 'swing',//(string) easing effect for the animation
			easingBg		: 'swing',//(string) easing effect for the background animation
			fadein: 1000, //(int) ms after images loaded fade in duration
			hash			: true, //(bool) use hashes to track the current slide in history
			speed			: 1000,//(int) speed of each slide animation in ms
			thumbs			: true,// (bool) true enables thumbnails, false disables
			thumbRotation	: 5,//(mixed): (int) degrees thumbs will be randomly rotated, bool false to disable rotation
			thumbAnimate 	: -10, //(int) px to animate thumbnails
			thumbAnimateTime: 100, //(int) ms animation for thumb animation
			numBackgrounds: 3, //(int) Number of parallax backgrounds
			customBackground: false, //(string) Custom Background markup
			debug: false //(bool) true: enable console statements for debugging
		};
	var methods = {
			init: function  (userOptions) {
				return this.each(function() {
					var options = $.extend({}, globalOptions, userOptions);
					var $this 	= $(this),
					data = $this.data('lax');
					//If the element has already been initialized, just return it.
					if (data) return $this;
					//If jQuery mobile, disable hash
					if (typeof(jQuery.mobile) == 'object') options.hash = false;
					if (options.debug) {
						console.group('jquery.parallax init'); 
						console.log('settings',options);
						if (options.speed > options.autoPlay) console.warn('Slide Transition duration should be shorter than automatic transitions');
					}
					//the main slider
					var $pxs_slider		= $('.pxs_slider',$this),
					$elems			= $pxs_slider.children(),
					total_elems		= $elems.length,
					$pxs_next		= $('.pxs_next',$this),
					$pxs_prev		= $('.pxs_prev',$this),
					$pxs_bg		= $('.pxs_bg',$this),
					backgrounds = new Array();

					//Check if Modernizr is in the DOM
					if (typeof(Modernizr)=='undefined') Modernizr=false;
					if (Modernizr.csstransitions && options.css3 ) {
						var speed_string = options.speed / 1000+'s',
						css_transitions_object = 
							{
								'-webkit-transition':'left '+speed_string+' '+options.css3Easing,
								'-moz-transition':'left '+speed_string+' '+options.css3Easing,
								'-o-transition':'left '+speed_string+' '+options.css3Easing,
								'-ms-transition':'left '+speed_string+' '+options.css3Easing,
								'transition':'left '+speed_string+' '+options.css3Easing,
							};
						$pxs_slider.css(css_transitions_object);
						
					}
					//Build Backgrounds
					for ( var int = options.numBackgrounds; int > 0; int--) {
						var $bkg = $('<div class="pxs_bg'+int+'"></div>');
						if (Modernizr.csstransitions && options.css3) $bkg.css(css_transitions_object);
						$bkg.appendTo($pxs_bg);
						backgrounds[int] = $bkg;
					}
					
					//Fix for an undefined first array element
					if (typeof(backgrounds[0]) == 'undefined') backgrounds.shift();
					
					if (options.customBackground) {
						$(options.customBackground).appendTo($pxs_bg);
					}
					//the thumbs container
					$pxs_thumbnails = $('.pxs_thumbnails',$this),
					//the thumbs
					$thumbs			= $pxs_thumbnails.children(),
					//the loading image
					$pxs_loading	= $('.pxs_loading',$this),
					$pxs_slider_wrapper = $('.pxs_slider_wrapper',$this),
					$pxs_actions = $("<span class=\"pxs_actions\"></span>"), 
					$one_img = $($pxs_slider.find('img')[0]);
					
					$pxs_actions.appendTo($this);
					//Prepare the loading state
					$pxs_loading.show().append('<span class="percent">0%</span>') ;
					$pxs_slider_wrapper.hide();
					//add data to DOM if not set
					if (! data) {
						$this.data('lax', {
							target: $this,
							slider: $pxs_slider,
							options: options,
							elems: $elems,
							total_elems: total_elems,
							backgrounds: backgrounds,
							buttons: {		play: $("<span class=\"pxs_play\">Play</span>"),
											pause: $("<span class=\"pxs_pause\">Pause</span>"),
											prev: $pxs_prev,
											next: $pxs_next
											},
							current: 0,
							slideshow:null,
							one_image_w: parseInt( $one_img.attr('width') ),
							image_aspect: parseInt( $one_img.attr('width') ) / parseInt( $one_img.attr('height') ),
							nav_offset: parseInt( $(".pxs_navigation SPAN").css('width') ) + parseInt( $("UL.pxs_slider LI IMG").css('border-left-width')),
							w_w: $(window).width(),
							viewport_width: $this.width(),
							images:$elems.find('IMG'),
							thumbs_container:$pxs_thumbnails,
							thumbs: $thumbs,
						});
						data = $this.data('lax');
					}
					if (options.debug) {
						console.log('init data',data);
					}

					//Set up the play/pause buttons
					data.buttons.play.on('click.lax', function  () {
						$this.parallaxSlider('play',true);
						return false;
						}).appendTo($pxs_actions);		 
					data.buttons.pause.on('click.lax', function  () {
						$this.parallaxSlider('stop');
						return false;
						}).appendTo($pxs_actions).hide();		 
					
					
					//slide when clicking the navigation buttons
					$pxs_next.on('click.lax',function(){
						//if autoplay interrupt when user clicks
						if(options.autoPlay)
							$this.parallaxSlider('stop');
						if (options.debug) console.log('next clicked: '+data.current);
						$this.parallaxSlider('slide');
					});
					$pxs_prev.on('click.lax',function(){
						//if autoplay interrupt when user clicks
						if(options.autoPlay)
							$this.parallaxSlider('stop');
						data.current--;
						if(data.current < 0)
							if(options.circular)
								data.current = data.total_elems - 1;
						else{
							data.current++;
							return false;
						}
						if (options.debug) console.log('prev clicked: '+data.current);
						$this.parallaxSlider('slide',data.current);
					});
					//Only do this if thumbnails are enabled
					if (options.thumbs) {
						
						//hovering the thumbs animates them up and down
						data.thumbs.on('mouseover.lax', function(e){
							$(this).stop().animate({top:options.thumbAnimate+'px'},options.thumbAnimateTime);
						}).on('mouseout.lax',function(){
							$(this).stop().animate({top:'0px'}, options.thumbAnimateTime);
						}).on('click.lax',function(){
							var $thumb	= $(this);
							//if autoplay interrupt when user clicks
							if(options.autoPlay)
								$this.parallaxSlider('stop');
							data.current = $thumb.index();
							$this.parallaxSlider('slide',$thumb.index());
						});
						
						//make the first thumb selected
						$($(".pxs_thumbnails LI",data.target)[0]).addClass('selected');
						//use CSS3 rotation if enabled
						if(options.thumbRotation){
							var angle 	= Math.floor(Math.random()*(2*options.thumbRotation))-(options.thumbRotation);
							data.thumbs.css({
								'-o-transform'	: 'rotate('+ angle +'deg)',
								'-moz-transform'	: 'rotate('+ angle +'deg)',
								'-webkit-transform'	: 'rotate('+ angle +'deg)',
								'transform'			: 'rotate('+ angle +'deg)'
							});
						}

					} else {
						//Hide any thumbs in the DOM
						data.thumbs.hide();
					}
					//Delegate window event handlers
					$(window).on('resize.lax', function(e){
						//Resize 
						$this.parallaxSlider('slide',data.current,0);
						$this.parallaxSlider('refresh');
					});

					/*
					 * Make sure all images have been loaded using imagesLoaded jQuery plugin
					 */
					var loaded = $this.find("IMG").imagesLoaded(), percent = $pxs_loading.find('.percent');
					loaded.progress( function  (total,loaded,proper,broken) {
						percent.html(( Math.round( ( loaded * 100 ) / total ) ) + '%' );
					}).always( function  (images) {
						$pxs_loading.hide();
						//Trigger hash change if enabled
						if (true == options.hash) {
							var slide_int = parseInt(window.location.hash.replace('#slide',''));
							if (! isNaN(slide_int) ) {
								$this.parallaxSlider('slide',slide_int,0);
							}
						}
						$pxs_slider_wrapper.fadeIn(options.fadein, function() {
							//if autoplay is enabled, trigger play action at the end of the animation
							if (options.autoPlay) {
								$this.parallaxSlider('play');
							}
						});
						$this.parallaxSlider('refresh');
					});
					if (options.debug) console.groupEnd();
				});//end jquery.each for init
			},//End init
			stop: function  () {
				return this.each( function  () {
					var $this = $(this),
					data = $this.data('lax'),
					options = data.options;
					//Toggle the buttons
					data.buttons.play.show();
					data.buttons.pause.hide();
					if (options.debug) console.log('pre-(stop) data',data.slideshow);
					clearInterval(data.slideshow);
					data.slideshow = null;
					if (options.debug) console.log('post-(stop) data',data.slideshow);
				});	
			},
			play: function  (playbutton) {
				//If this is a play button triggered event
				//Invoke a slide immediately for a more responsive "feel"
				if (playbutton) $this.parallaxSlider('slide');
				return this.each( function  () {
					$this = $(this),
					data = $this.data('lax'),
					options = data.options;
					if (options.debug) {
						console.log('play called on',$this);
						console.log('play data ',data);
						console.log('typeof data.slideshow', typeof(data.slideshow) );
						console.log('data.slideshow',data.slideshow);
					}
					//Toggle the buttons
					data.buttons.pause.show();
					data.buttons.play.hide();
					if (options.autoPlay == 0) options.autoPlay = 3000; //Default override for API invoked play
					if ( data.slideshow == null ) {
						data.slideshow	= setInterval(function(){
							if (options.debug) console.log('play interval tick');
							$this.parallaxSlider('slide');
						}, options.autoPlay );
					}
				});
			},
			/**
			 * slide method, slides to the specified slide
			 * @param slide int, slide number
			 */
			slide: function  (slide,timing) {
				return this.each( function  () {
				$this = $(this),
				data = $this.data('lax'),
				options = data.options;
				if (!data) return;
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
				} else {
						data.current = slide;
				}
				//If passed in timing is not undefined, allow it to override settings
				if (typeof(timing) != 'undefined') speed = timing;
				else speed = options.speed;
				if (options.debug) {
					console.log('slide called. Current: ',data.current);
					console.log(data);
				}
				$(".pxs_thumbnails LI",data.target).removeClass('selected');
				$($(".pxs_thumbnails LI",data.target)[data.current]).addClass('selected');
				var slide_to	= parseInt( -data.viewport_width * slide ),
				animCssObject = {
						left	: slide_to + 'px'
				};
				if (options.hash) {
					//Update the history hash
					if (isNaN(slide)) slide = 0;
					window.location.replace('#slide'+slide);
				}
				//Animate the Slide
				if (Modernizr.cssanimations && options.css3) {
					if (options.debug) console.log('using css animations');
					$('.pxs_slider',data.target).css(animCssObject);
					$.each(data.backgrounds, function (k,v) {
						$(v).css({
							left	: slide_to/((k+1)*2)+'px'
						});
					});
				} else {
					if (options.debug) console.log('using fallback animations');
					//use fallback
					$('.pxs_slider',data.target).stop().animate(animCssObject,speed, options.easing);
					//Animate the Background Layers
					$.each(data.backgrounds, function (k,v) {
						$(v).stop().animate({
							left	: slide_to/((k+1)*2)+'px'
						},speed, options.easingBg);
					});
				}
				});
			}, 
			/**
			 * refresh the width of the slider and elements
			 * @returns jQuery
			 */
			refresh: function  () {
				return this.each( function  () {
					var $this = $(this),
					data = $this.data('lax'),
					options = data.options,
					position_nav = 0,
					nav_top = 0;
					data.w_w = $(window).width();
					data.viewport_width = $this.width();
					if (options.debug) console.log('refresh called');
					//each element will have a width = windows width
					data.elems.css({
						width: data.viewport_width + 'px'
					});
					var images_css_object;
					if (data.viewport_width < (data.one_image_w + data.nav_offset*2)) {
						//Viewport is wider than images + nav
						var width = data.viewport_width - data.nav_offset*2,
						height = parseInt(width/data.image_aspect),
						nav_top = (height/2) + (data.buttons.next.height()/4);
						images_css_object = {width: width+'px',height:height+'px'};
					} else {
						//Images are larger than viewport
						position_nav	= (data.viewport_width/2) - (data.one_image_w/2) - data.nav_offset;
						nav_top = ((data.one_image_w / data.image_aspect) / 2) + (data.buttons.next.height()/4);
						images_css_object = {width: data.one_image_w+'px',height:(data.one_image_w/data.image_aspect)+'px'};
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
						var $thumb 	= $(this);
						//set the left offset to current thumb index *
						var left = 0,
						thumbwidth = $thumb.width(),
						thumbspace = thumbwidth * data.total_elems,
						offset = (data.viewport_width - thumbspace) / (data.total_elems + 1);
						if (i==0) left = offset;
						else left	= ((i+1) * offset) + (i * thumbwidth);
						$thumb.css('left',left+'px');
					});
					//Position the Thumbnail Container 
					data.thumbs_container.css({
						'width'			: data.viewport_width + 'px',
						'margin-left' 	: -data.viewport_width/2 + 'px'
					});
					data.buttons.next.css('right', position_nav + 'px');
					data.buttons.prev.css('left', position_nav + 'px');
					data.buttons.next.add(data.buttons.prev).css('top',nav_top + 'px');
					var pxs_slider_w	= data.viewport_width * data.total_elems;
					//Set the widths of all backgrounds and the slider
					data.slider.add(data.backgrounds).width(pxs_slider_w + 'px');
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