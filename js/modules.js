/**
 * modules.js
 *
 * autor:
 *	freek van der wand
 */
(function($) {	// namespace / closure wrapper
	"use strict";
	// crossbrowser-logging
	window.log=function(){
		"use strict"
		window.log.history = window.log.history || [];
		window.log.history.push(arguments);
		if(window.console){
				window.console.log(Array.prototype.slice.call(arguments));
		}
	};
	// jQuery plugins/extensions
	$.fn.extend({
		equalHeight: function() {
			var h = 0,	//max height
				$t = $(this);
			return $t.css('height','auto').each(function(ind, el) {
				h = Math.max(h, $(el).outerHeight());
			}).css('height',h+'px');
		},
		equalWidth: function() {
			var w = 0,	//max width
				$t = $(this);
			return $t.css('width','auto').each(function(ind, el) {
				w = Math.max(w, $(el).outerWidth());
			}).css('width', w+'px')
		}
	})

	var newProjekt = newProjekt || (function() {
		// Closure scope == fake constructor of uninstanced Object 'newProjekt'
		// it also enebles to set private / static vars and methods
		
		var self = {};

		// private constant
		var DEBUG = true;

		// public methodes (modules)
		var _modules = {
			moduleone : {	// testing / site init
				init : function() {
					log("moduleone init");
					_equalHeight.add( $('.height div') );
					_equalWidth.add( $('.width div') );
					_onResize.add(_modules.moduletwo.orf);
					_onResize.add(function() {
						_modules.moduletwo.orfwp('hui', 'bla', 'bäm');
					},'orfwp');
					_mquery.addListener('M',_modules.moduletwo.cbf,'enter');
					// _modules.overlayModule.init();

					this.initListeners();
				},
				initListeners : function() {
					$('#open').on('click',function(e) {
						log("open clicked");
						e.stopPropagation();
						e.preventDefault();
						_modules.moduletwo.open();
					});
					$('#close').on('click',function(e) {
						log("close clicked")
						e.stopPropagation();
						e.preventDefault();
						_modules.moduletwo.close();
					});
					$('#removeorf').on('click',function(e) {
						log("removeorf clicked");
						e.stopPropagation();
						e.preventDefault();
						_onResize.remove('orfwp');
					});
					$('#addorf').on('click',function(e) {
						log("addorf clicked");
						e.stopPropagation();
						e.preventDefault();
						_onResize.add(function() {
							_modules.moduletwo.orfwp('this', 'is', 'second', 'add');
						},'orfwp');
					});
				}
			},
			moduletwo : (function() {
				var hasInstance = false;
				// private
				var init = function() {
					log("moduletwo singleton private init");
					hasInstance = true;
				};
				// public
				var self = {
					init : function() {
						if(!hasInstance)
							init();
						log("moduletwo public init");
						return self;
					},
					cbf : function() {	// callback function
						$('.example.mquerys').append(" <p>mQuery-Listener triggered</p> ");
						return self.cbf;
					},
					orf : function() {	// onResize function
						$('.example.onresize').append( " <p>onResize triggers all added functions</p> " );
						return self.orf;
					},
					orfwp : function($a, $b, $c, $d) { // onResize function with parameters
						$('.example.onresizewithparam').append("<p>onResize triggered with the following param: "+$a+" - "+$b+" - "+$c+" - "+$d+"</p>");
						return self.orfwp;
					},
					open: function() {
						log("open function called");
						$('#ovone').addClass('open');
						_overlayHandler.setActive(self);
					},
					close: function() {
						log("close function called");
						$('#ovone').removeClass('open');
						_overlayHandler.unsetActive(self);
					}
				};
				return self;
			})(),
			overlayModule : (function() {
				var self = {
					init : function() {
						$('#o').on('click',function(e) {
							e.preventDefault();
							e.stopPropagation();
							self.open();
						});
						$('#c').on('click',function(e) {
							e.stopPropagation();
							e.preventDefault();
							self.close();
						});
						$('.overlay').on('click',function(e) {
							e.stopPropagation();
							e.preventDefault();
						});
					},
					open: function() {
						log("overlayModule open");
						$('#ovtwo').addClass('open');
						_overlayHandler.setActive(self);
					},
					close: function() {
						log("overlayModule close");
						$('#ovtwo').removeClass('open');
						_overlayHandler.unsetActive(self);
					}
				};
				return self;
			})()
		};

		// private methodes
		var _privMethod = function() {
				log("_privMethod");
			},
			/**
			 * _init() - initalizies the modules
			 *
			 * @type {Object} static pseudo class
			 */
			_init = function() {
				log("_init");
				$(function() {	// shorttag for $.ready()
					// init modules
					log("_init (init modules)");
					
					// core methodes/modules
					_onResize.init();
					_mquery.init();
					_overlayHandler.init();

					// other methodes/modules
					_modules.moduleone.init();
					_modules.overlayModule.init();
					// _modules.moduletwo.init();
				});

				if( DEBUG ) {	// expose to newProjekt scope
					self.modules = _modules;
					self.onReszie = _onResize
					self.mquery = _mquery;
					self.overlayHandler = _overlayHandler;
				}

				return self;
			},
			/**
			 * _onResize() - wrapper function for $(window).resize()
			 *
			 * info:
			 *	triggers only if the window isn't resized for X miliseconds (default = 500ms)
			 *	
			 * functions:
			 *	add: adds functions to trigger
			 *	setTimeoutMs: change timeout
			 *	
			 * @type {Object} static pseudo class
			 */
			_onResize = {
                fnArr: [],
                t: undefined,
                tms: 500,	// default timeout in MS
                init: function() {
                    var self = this;
                    $(window).on('resize', function() {
                        if (self.t) {
                            window.clearTimeout(self.t);
                        }
                        self.t = window.setTimeout(function() {
                            self.loop();
                        }, self.tms);
                    });
                },
                /* add(fn) - adds a function
                 *
				 * info:
				 *	adds a function that will be triggered on each resize
				 *
				 * usage:
				 *	_onResize.add(fn[arg1,arg2,...,argN]);
				 *
				 * param:
				 *	{function} fn - a function that will be triggered
				 *
				 * @type {Object} static pseudo class
				 */
                add: function(fn, name) {
                    if (!fn || typeof fn !== 'function') {
                        return 0;
                    }
                    var args = Array.prototype.slice.call(arguments, 1);
                    this.fnArr.push([fn, name, args]);
                    return 1;
                },
                loop: function() {
                    $.each(this.fnArr, function(index, fnWithArgs) {
                        fnWithArgs[0].apply(undefined, fnWithArgs[2]);
                    });
                },
                /* setTimeoutMs(ms) - change timeout
                 *
				 * info:
				 *	changes the timeout till the functions get triggered
				 *
				 * usage:
				 *	_onResize.setTimeoutMs(ms);
				 *
				 * param:
				 *	{ms} fn - time in Milliseconds
				 *
				 * @type {Object} static pseudo class
				 */
                setTimeoutMs: function(ms) {
                    if (parseInt(ms, 10)) {
                        this.tms = ms;
                    }
                },
                remove: function(name) {
                	var $this = this,
                		removeIndex = undefined;
                	$.each(this.fnArr, function(index, fnWithArgs) {
                		if( fnWithArgs[1] == name )
                			removeIndex = index;
                	});
               		$this.fnArr.splice(removeIndex,1);
                }
            },
            /**
			 * _mquery() - JS implementation of media querys
			 *
			 * info:
			 *	to trigger js-dom-manipulation in responsive designs
			 *
			 * functions:
			 *	init: dosn't do anything
			 *	addListener: adds a 'queryListener'
			 *	check: gives back true or false depending on querykey
			 *	getMQL:  gives back MediaQueryList-object
			 *	
			 * @type {Object} static pseudo class
			 */
            _mquery = function() {
            	var mm = {},
            		mediaQuerys = {	// mediaQuery definitions
            			'S' : 'only screen and (max-width: 479px)',
            			'M'	: 'only screen and (min-width: 480px) and (max-width: 768px)',
            			'L'	: 'only screen and (min-width: 769px) and (max-width: 1023px)',
            			'XL': 'only screen and (min-width: 1024px)'
            		},
            		self = {
            			/**
            			 * init() - doesn't do anaything
            			 *
            			 * info:
            			 *	can be used to init-add queryListeners
            			 *
            			 * usage:
            			 *	_mquery.init();
            			 *
            			 * @type {Object} static pseudo class
            			 */	
            			init: function() {
            				// does nothing - neccessary?
            			},
            			/**
            			 * addListener(querykey,callback,type) - adds a 'queryListener'
            			 *
            			 * info:
            			 *	add 'queryListeners' to trigger the callback functions on defined mediaQuery-breakpoints
            			 *
            			 * usage:
            			 *	_mquery.addListener('querykey', callback, ['enter','leave','both'] );
            			 *
            			 * param:
            			 *	{string} querykey - a mediaQuery-key from var mediaQuerys
            			 *	{function} callback - a function used as callback
            			 *	{string} type - ['enter','leave','both'] - defines when the callback function gets triggers (defautl: enter)
            			 * 
            			 * @type {Object} static pseudo class
            			 */
            			 addListener: function(querykey,callback,type) {
            			 	if(!type) {
            			 		type = 'enter';
            			 	}

            			 	var instance = this.getMQL(querykey);

            			 	instance.addListener(function() {
	                            if ((type === 'enter' && instance.matches) ||
	                                (type === 'leave' && !instance.matches) ||
	                                type === 'both') {
	                                callback.call();
	                            }
	                        });
            			},
            			/**
            			 * check(querykey) - gives back true or false
            			 *
            			 * usage:
            			 *	_mquery.addListener('querykey');
            			 *
            			 * param:
            			 *	{string} querkey - a mediaQuery-key from var mediaQuerys
            			 *
            			 * @type {Object} static pseudo class
            			 */		
            			 check: function(querykey) {
            			 	return this.getMQL(querykey).matches;
            			 },
            			 /**
            			 * getMQL(querykey) - gives back MediaQueryList
            			 *
            			 * usage:
            			 *	_mquery.getMQL('querykey');
            			 *
            			 * param:
            			 *	{string} querkey - a mediaQuery-key from var mediaQuerys
            			 *
            			 * @type {Object} static pseudo class
            			 */	
            			 getMQL: function(querykey) {
            			 	if(!mm[querykey]) {
            			 		if ( !! querykey) {
            			 			mm[querykey]=matchMedia(mediaQuerys[querykey]);
            			 		} else {
            			 			log("error");	// todo: log-levels/error-codes
            			 		}
            			 	}
            			 	return mm[querykey];
            			 },
            			 /**
            			 * get() - gives back Array  with keys of all matching mediaQuerys
            			 *
            			 * usage:
            			 *	_mquery.get();
            			 *
            			 * @type {Object} static pseudo class
            			 */	
            			 get: function() {
            			 	var matching = new Array();
            			 	for( var key in mediaQuerys ) {
            			 		if(this.getMQL(key).matches)
            			 			matching.push(key);
            			 	}
            			 	return matching;
            			 }
            		};

            		window.mquery = self;

            		return self;
            }(),
			/**
			 * _equalHeight() - sets equal height to jQuery-elements
			 *
			 * usage:
			 *	you can add jQuery selectors by _equalHeight.add( $('mySelector','name') );
			 *	to remove call _equalHeight.remove('myselector','name');
			 *
			 * @type {Object} static pseudo class
			 */
			_equalHeight = {
				add: function($e,$n) {
					$e.equalHeight();
					_onResize.add( function() {
						$e.css('height','auto');	// reset height
						$e.equalHeight();	
					},$n );
				},
				remove: function($e,$n) {
					$e.css('height','auto');
					_onResize.remove($n);
				}
			},
			/**
			 * _equalWidth() - sets equal width to jQuery-elements
			 *
			 * usage:
			 *	you can add jQuery selectors by _equalWidth.add( $('mySelector'), 'myName' );
			 *	to remove call _equalWidth.remove( $('mySelector'), 'myName');
			 *
			 * @type {Object} static pseudo class
			 */
			_equalWidth = {
				add: function($e, $n) {
					$e.equalWidth();
					_onResize.add( function() {
						$e.css('width','auto'); // reset width
						$e.equalWidth();
					} );
				},
				remove: function($e, $n) {
					$e.css('width','auto');
					_onResize.remove($n);
				}
			},
			/**
			 * overlayHandler() - handles overlays, dropdowns and other open modules
			 *
			 * info:
			 *	only 1 open Overlay (= [overlay,dropdown,tooltip,etc]) at the same time
			 *	if a new gets opened, the other auto-closes
			 *	
			 * usage:
			 *	on open: _overlayHandler.setActive(module);
			 *	on clos: _overlayHandler.unsetActive(module);
			 *
			 * functions:
			 *	checkModule: check if it's a module with close function
			 *	checkActive: check if module is active
			 *	setActive: set as active module
			 *	unsetActive: unset as active module
			 *	close: triggers close event of active module
			 *	
			 * @type {Object} static pseudo class
			 */
			_overlayHandler = (function() {
				var checkModule = function(module) {
						if(!module) {
							log("error: no module"); // todo: error handling
							return false;
						}
						if(typeof module.close !== 'function') {
							log("error: no close function");	// todo: error handling
							return false;
						}
						return true;
					},
					checkActive = function(module) {
						if(!self.active) {
							return false;
						}
						return true;
					};

				var self = {
					active: undefined,
					init: function() {
						this.active = !! this.active || undefined;

						$(document).on('click','body',function(e) {
							log("clicked on: " + e.originalEvent.target);
							_overlayHandler.close(_overlayHandler.active);
						});
					},
					setActive: function(module) {
						var self = this;

						if(checkActive(module)) {
							this.close(module);
						}
						if( !! module && module !== self.active ) {
							self.active = module;
							return true;
						}
						return false;
					},
					unsetActive: function(module) {
						if(this.active === module) {
							this.active = undefined;
							return true;
						} else {
							console.log("error"); // todo error handling
						}
						return false;
					},
					close: function(module) {
						log("overlayHandler close function called")
						if(checkActive(module)) {
							self.active.close.apply(self.active);
							self.unsetActive();
						}
					}
				};
				return self;
			})();

		return _init();	// returns the newProjekt object
	}());
	$(function() {	// document ready
		window.newProjekt = newProjekt;	// expose to public window scope
	});
})(window.jQuery);