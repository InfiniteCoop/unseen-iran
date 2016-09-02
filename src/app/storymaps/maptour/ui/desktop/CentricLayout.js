define([
        "./CentricIntroPanel",
        "./CentricView",
        "./DotNavBar",
        "storymaps/maptour/core/WebApplicationData",
        "storymaps/maptour/core/MapTourHelper",
		"storymaps/utils/Helper",
        "dojo/on",
        "dojo/topic"
    ],
	function(
		CentricIntroPanel,
		CentricView,
		DotNavBar,
		WebApplicationData,
		MapTourHelper,
		Helper,
		on,
		topic
	){
		return function CentricLayout(isInBuilderMode)
		{
			var _introPanel = new CentricIntroPanel("#centricIntroPanel", '#smallImageContainer'),
				_view = new CentricView("#largeImageContainer", isInBuilderMode),
				_navDots = new DotNavBar($('.dotNavBar'), onDotNavigation),
				_this = this,
				_dots = [];
			
			this.init = function()
			{
				renderDotNav();
				
				$('.startTour').fastClick(_introPanel.showPoint);
				
				$('.leftNavButton').fastClick(navigateToPreviousPoint);
				$('.rightNavButton').fastClick(navigateToNextPoint);
				$('.smallImageLeftNavButton').fastClick(navigateToPreviousPoint);
				$('.smallImageRightNavButton').fastClick(navigateToNextPoint);
				
				$('.largeImageSwitchView').fastClick(changeView);
				$('.smallImageSwitchView').fastClick(changeView);
				
				if(isInBuilderMode)
					$("#basemapChooser").toggle(_this.currentView != '#largeImageContainer');
				else
					$("#basemapChooser").hide();
			};
			
			this.currentView = '#smallImageContainer';
			
			this.initHeader = function(
				title,
				subtitle,
				logoURL,
				logoTarget,
				showEditButton,
				linkText,
				linkURL,
				socialBtn
			){
				var appColors = WebApplicationData.getColors();
				
				// TODO depending on theme
				if ( logoURL == APPCFG.HEADER_LOGO_URL )
					logoURL = "resources/icons/esri-logo.jpg";
				
				var headerCfg = {
					logoURL: logoURL,
					logoTarget: logoTarget,
					linkText: linkText,
					linkURL: linkURL,
					socialBtn: socialBtn
				};
				
				_introPanel.init(
					!isInBuilderMode,
					title, 
					subtitle, 
					appColors[0],
					headerCfg, 
					showEditButton
				);
				
				_view.init(
					title, 
					subtitle, 
					appColors[0], 
					!app.data.sourceIsNotFSAttachments(),
					headerCfg,
					showEditButton
				);
			};
			
			this.setSelectedIndex = function(index)
			{
				if(index != -1 && index != null)
					_navDots.setActive(index);
				else if (index == null && app.data.hasIntroRecord())
					_navDots.setActive(0);
			};
			
			this.updatePoint = function(index, attributes)
			{
				// Panel media represents which media plays a minor role, so appLayout represents imageCentric vs mapCentric view
				var appLayoutSelector = _this.currentView == '#largeImageContainer' ? '#largeImageContainer' : '#smallImageContainer';
				var introAttsID = app.data.hasIntroRecord() ? app.data.getIntroData().attributes.getID() : null;
				if ((app.data.hasIntroRecord() && index === null) || (!app.data.hasIntroRecord() && index === 0) || attributes.getID() === introAttsID) {
					if (app.data.hasIntroRecord()) 
						_introPanel.initImageInfo(app.data.getIntroData().attributes);					
					
					if ($('body').hasClass('centric-layout')) {
						if (_this.currentView == '#largeImageContainer') {
							_introPanel.showLayout('#largeImageContainer', attributes);
						}
						else 
							_introPanel.showLayout('#smallImageContainer', attributes);
						
						$('.smallImageLeftNav').hide();
						_navDots.setActive(0);
						$('.smallImageRightNav').css ('z-index', '99');
					}
				}
				else {
					app.map.getLayer('mapTourGraphics').show();
					if(!app.map.getLayer('mapTourGraphics').graphics[1].visible){
						$.each(app.map.getLayer('mapTourGraphics').graphics, function(index, graphic){
							graphic.show();
						});
					}
					$('.smallImageRightNav').css ('z-index', '0');
					$('.smallImageLeftNav').show();
					
					var forceLayoutChange = false;
					if ($('#centricIntroPanel').css('display') === 'block' || $('body').hasClass('mobile-view')) {
						$('#centricIntroPanel').hide();
						forceLayoutChange = true;
						
					}
					$('#fullIntroImage').hide();
					if (app.data.hasIntroRecord()) {
						_navDots.setActive(index + 1);
						if (index + 2 === _dots.length) {
							$('.smallImageRightNavButton').hide();
							$('.rightNavButton').hide();
						}
						else{
							$('.smallImageRightNavButton').show();
							$('.rightNavButton').show();
						}
					}
					else {
						_navDots.setActive(index);
						if(index + 1 === _dots.length){
							$('.smallImageRightNavButton').hide();
							$('.rightNavButton').hide();
						}
						else{
							$('.smallImageRightNavButton').show();
							$('.rightNavButton').show();
						}
					}
					_view.updatePicture(appLayoutSelector, attributes.getURL(), attributes.getName(), attributes.getDescription(), (!attributes.isVideo()) && MapTourHelper.mediaIsSupportedImg(attributes.getURL()), forceLayoutChange);
				}
				
				topic.publish("CORE_PICTURE_CHANGED");
			};
			
			this.introShowing = function()
			{
				if($('#centricIntroPanel').css('display') === "block")
					return true;
				else
					return false;
			};
			
			this.resize = function(cfg)
			{
				if(cfg.isMobileView){
					if ($('#mapPanel').has($('#mainMap')).length === 0) {
						$('#mapPanel').css({
							position: 'relative'
						});
						$('#mainMap').removeClass('circleMap');
						$('#mapPanel').height('100%');
						$('#mainMap').height('100%');
						$('#mainMap').width('100%');
						$('#mapPanel').append($('#mainMap'));
					}
					return;
				}
				
				setTimeout(function(){
					$('.smallImageLeftNav').css({'top': $('#contentPanel').height() * 0.43 - 5});
				}, 0);
				
				var appLayoutSelector = _this.currentView == '#largeImageContainer' ? $('#largeImageContainer') : $('#smallImageContainer');
				setTimeout(function(){
					$('#mapPanel').height($('#contentPanel').height() - $('.dotsContainer').height());
				}, 50);
								
				if ($('#centricIntroPanel').css('display') == 'none') {
					if (appLayoutSelector.selector == $('#largeImageContainer').selector) {
						setTimeout(function(){
							appLayoutSelector.find('.imageContainer').width($(window).width() - 130);
						}, 0);
						if (appLayoutSelector.find('.landscape').css('display') === 'block') {
							if ($('.landscapeCircleMapPlaceHolder').has($('#mainMap')).length === 0) {
								$('.landscapeCircleMapPlaceHolder').append($('#mainMap'));
								$('#mainMap').addClass('circleMap');
							}
							
							if(appLayoutSelector.find('.imageContainer').height()*0.2 > 150)
								appLayoutSelector.find('.landscapeContent').height(appLayoutSelector.find('.imageContainer').height()*0.2);
							
							setTimeout(function(){
								appLayoutSelector.find('.landscapePhoto').height(appLayoutSelector.find('.imageContainer').height() - appLayoutSelector.find('.landscapeContent').height() - 60);
								appLayoutSelector.find('.landscapePhoto').width('100%');
								
								$('#mainMap').height(appLayoutSelector.find('.landscapeContent').height() + 100 + 'px');
								$('#mainMap').width(appLayoutSelector.find('.landscapeContent').height() + 100 + 'px');
								appLayoutSelector.find('.landscapeIframe').height(appLayoutSelector.find('.landscapePhoto').height() - 40 + 'px');
								appLayoutSelector.find('.imageFader').height(appLayoutSelector.find('.landscapePhoto').height() + 'px');	
								$('#largeImageContainer .linkContainer').width(225 - $('#largeImageContainer .shareButtons').width() + 'px');
							}, 0);
							
						}
						
						else {
							if ($('.portraitCircleMapPlaceHolder').has($('#mainMap')).length === 0) {
								$('.portraitCircleMapPlaceHolder').append($('#mainMap'));
								$('#mainMap').addClass('circleMap');
							}
							setTimeout(function(){
								if (appLayoutSelector.find('.portraitContent').width() * 0.8 < 315 && appLayoutSelector.find('.portraitContent').height() * 0.5 > 315) {
									$('#mainMap').height(appLayoutSelector.find('.portraitContent').width() * 0.8);
									$('#mainMap').width(appLayoutSelector.find('.portraitContent').width() * 0.8);
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').width(appLayoutSelector.find('.portraitContent').width() * 0.8);
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').height(appLayoutSelector.find('.portraitContent').width() * 0.8);
								}
								else if( appLayoutSelector.find('.portraitContent').height() * 0.5 < 315){
									$('#mainMap').height(appLayoutSelector.find('.portraitContent').width() * 0.6);
									$('#mainMap').width(appLayoutSelector.find('.portraitContent').width() * 0.6);
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').width(appLayoutSelector.find('.portraitContent').width() * 0.6);
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').height(appLayoutSelector.find('.portraitContent').width() * 0.6);
								}
								else{
									$('#mainMap').height('315px');
									$('#mainMap').width('315px');
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').width('315px');
									appLayoutSelector.find('.portraitCircleMapPlaceHolder').height('315px');
								}
								
								if($('.portraitCircleMapPlaceHolder').position().top - 11 < ($('#largeImageContainer .portraitTitle').height() + $('#largeImageContainer .portraitSubtitle').height())/*$('#largeImageContainer .portraitTextArea').height()*/){
									_view.checkPortraitMap();
								}
								appLayoutSelector.find('.layoutFader').height(appLayoutSelector.find('.imageContainer').height() + 'px');
								appLayoutSelector.find('.portraitPhoto').height(appLayoutSelector.find('.portrait').height() - 60 + 'px');
								$('#largeImageContainer .linkContainer').width($('#largeImageContainer').width() * 0.3 - $('#largeImageContainer .shareButtons').width() - 50 + 'px');
							}, 0 );
						}
					}
					else{
						setTimeout(function(){
							appLayoutSelector.find('.landscapePhoto').width(appLayoutSelector.find('.imageContainer').width());
							appLayoutSelector.find('.landscapeContent').width(appLayoutSelector.find('.imageContainer').width());
							if (appLayoutSelector.find('.landscapeContent').width() * 0.3 < 250) {
								appLayoutSelector.find('.landscapeTextArea').width(appLayoutSelector.find('.landscapeContent').width() - 250);
								appLayoutSelector.find('.landscapeTextArea').css({
									left: 250
								});
							}
							else
								appLayoutSelector.find('.landscapeTextArea').width('70%');
						}, 0);
						if(appLayoutSelector.find('.imageContainer').height()*0.2 > 160)
							appLayoutSelector.find('.landscapeContent').height(appLayoutSelector.find('.imageContainer').height()*0.2);
						setTimeout(function(){
							appLayoutSelector.find('.landscapePhoto').height(appLayoutSelector.find('.imageContainer').height() - appLayoutSelector.find('.landscapeContent').height() - 20);
						}, 0);
					}
				}
				
				else {
					if (_this.currentView === '#largeImageContainer') {
						if ($('.introMediaPanel').has($('#mainMap')).length === 0) 
							$('.introMediaPanel').append($('#mainMap'));

						$('#mainMap').addClass('introPanel circleMap');
						
						if (app.data.hasIntroRecord()) 
							app.map.getLayer('mapTourGraphics').hide();
						else 
							if (app.map.getLayer('mapTourGraphics')) {
								$.each(app.map.getLayer('mapTourGraphics').graphics, function(index, graphic){
									if (index !== 0) 
										graphic.hide();
								});
							}
					}
					//TODO better solution for embed
					if ($('#centricIntroPanel').height() > ($(window).height() - 250)) {					
						var newTextHeight = $(window).height() * 0.2 + $('.dotsContainer').height() + 380;
						$('.introTextArea').height($(window).height() - newTextHeight + 'px');					
					}
					else if ($('#centricIntroPanel').height() < ($(window).height() - 350)) 
						$('.introTextArea').height('auto');
						
					$('.startTourImg').css('margin-left', $('.introStartTour').width() + 5);
					var startTourW = $('.introStartTour').width() + $('.startTourImg').width();
					$('.startTour').css('margin-left', 0);
					$('.startTour').css('margin-left', ($('.startTour').width() - startTourW)/2);
				}
					
				$('#centricIntroPanel .linkContainer').width($('#centricIntroPanel .social').width() - $('#centricIntroPanel .logo').width() - $('#centricIntroPanel .shareButtons').width() - 35 + 'px');
				$('#centricIntroPanel .linkContainer').css({
					left: $('#centricIntroPanel .logo').width() + 10
				});
				$('#smallImageContainer .linkContainer').width($('#smallImageContainer').width() * 0.3 - $('#smallImageContainer .shareButtons').width() - 10 + 'px');
				
				setTimeout(function(){
					//app.map.resize();
				}, 0);
			};

			function changeView()
			{
				var prevView = _this.currentView == '#largeImageContainer' ? '#largeImageContainer' : '#smallImageContainer';
				_this.currentView = _this.currentView == '#largeImageContainer' ? '#smallImageContainer' : '#largeImageContainer';
				var introAtts = app.data.hasIntroRecord() ? app.data.getIntroData().attributes : app.data.getCurrentAttributes();
				if ($('#centricIntroPanel').css('display') === 'block') 
					_introPanel.showLayout(_this.currentView, introAtts);
				else {
					var attributes = app.data.getCurrentAttributes();
					var forceViewChange = true;
					if (attributes.isVideo() || ! MapTourHelper.mediaIsSupportedImg()) {
						$(prevView).find('iframe').attr('src', '');
					}
					_view.updatePicture(_this.currentView, attributes.getURL(), attributes.getName(), attributes.getDescription(), (!attributes.isVideo()) && MapTourHelper.mediaIsSupportedImg(attributes.getURL()), forceViewChange);
				}
				
				if(isInBuilderMode)
					$("#basemapChooser").toggle(_this.currentView != '#largeImageContainer');
				else
					$("#basemapChooser").hide();
			}
			
			function navigateToPreviousPoint()
			{
				topic.publish("PIC_PANEL_PREV");
			}
			
			function navigateToNextPoint()
			{
				topic.publish("PIC_PANEL_NEXT");
			}
			
			function renderDotNav()
			{				
				if(app.data.hasIntroRecord())
					_dots.push({
						'title': app.data.getIntroData().attributes.getName(),
						'thumbnail': app.data.getIntroData().attributes.getThumbURL()
					});
				
				$.each(app.data.getTourPoints(), function(index, feature){
					_dots.push({
						'title': feature.attributes.getName(),
						'thumbnail': feature.attributes.getThumbURL()
					});
				});
				
				_navDots.init({
					sections: _dots,
					bgColor: "#777777", 
					tooltipBgColor: "#000000",
					tooltipFontColor: "#FFFFFF",
					dotColor: "#444",
					tooltipPosition: "top"
				});
				$('.dotsContainer').show();
			}
			
			function onDotNavigation(index)
			{
				app.isFirstUserAction = false;
				var dotClick = true;
				if (index != null) {
					topic.publish("CAROUSEL_CLICK", index, dotClick);
				}
			}
		};
	}
);
