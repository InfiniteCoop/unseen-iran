define(["storymaps/maptour/core/MapTourHelper",
        "storymaps/ui/HeaderHelper",
		"storymaps/utils/Helper",
		"storymaps/utils/ResamplePicture",
		"storymaps/ui/loadingIndicator/LoadingIndicator",
		"dojo/on",
		"dojo/topic",
		"dojo/has"],
	function(MapTourHelper, HeaderHelper, Helper, ResamplePicture, LoadingIndicator, on, topic/*, has*/)
	{
		/**
		 * ImageCentricView
		 * @class ImageCentricView
		 *
		 * TODO: SPLIT COMPONENT?  MAP CENTRIC AND IMAGE CENTRIC COMPONENTS?
		 *
		 */
		return function ImageCentricView(selector/*, isInBuilderMode*/)
		{
			//var isInit = false;
			var _panel = $(selector);
			var _layout = 'empty';
			var _mediaIsImg = true;
			var _title;
			var _fullScreenOpening;
			var _container;
			var _mapCentricLoadingIndicator = new LoadingIndicator("smallImageLoadingIndicator");
			var _imageCentricLoadingIndicator = new LoadingIndicator("largeImageLoadingIndicator");

			function init(title, subtitle, bgColor, isPicturesHosted, headerCfg/*, showEditButton*/)
			{

				this.update(bgColor);
				$('#largeImageContainer .largeImageAppTitle').html(title);

				$('#smallImageContainer .imageAppTitle').html(title);

				HeaderHelper.setLogo($('#largeImageContainer'), headerCfg);
				HeaderHelper.setLink($('#largeImageContainer'), headerCfg);
				HeaderHelper.setSocial($('#largeImageContainer'), headerCfg);
				HeaderHelper.initEvents($('#largeImageContainer'), "bottom");

				HeaderHelper.setLogo($('#smallImageContainer'), headerCfg);
				HeaderHelper.setLink($('#smallImageContainer'), headerCfg);
				HeaderHelper.setSocial($('#smallImageContainer'), headerCfg);
				HeaderHelper.initEvents($('#smallImageContainer'), "bottom");

				$('.photo, .landscapeIframe').hover(function(e){
					var isHoverPicture = e.type == "mouseenter"
						|| $(e.relatedTarget).hasClass('btn-fullscreen');

					$('.btn-fullscreen').toggleClass("hover", !! isHoverPicture);
				});

				on($('.btn-fullscreen'), 'click', fullScreen);

			}

			function update(bgColor)
			{
				_panel.css("background-color", bgColor);
			}

			function updatePicture(selector, picurl, name, caption, mediaIsImg, forceViewChange)
			{
				$('.introIframe').attr('src', '');

				_mediaIsImg = mediaIsImg;
				_title = name;
				_container = $(selector);
				var forceChange = forceViewChange;
				var changeFromIntro = changeFromIntro;
				var isVideo = false;
				var media = selector == '#largeImageContainer' ? 'map' : 'image';

				_container.find('.imageFader').show();
				if (selector == '#largeImageContainer') {
					if ($('.imageContainer').has($('#circleMap')) && $('.imageContainer').has($('#circleMap')).length === 0) {
						$('#mainMap').removeClass('introPanel');
						_container.find('.imageContainer').width($(window).width() - 130);
						$('#largeImageContainer').show();
					}
					_imageCentricLoadingIndicator.start();
				}
				else {
					$('#smallImageContainer').show();
					_mapCentricLoadingIndicator.start();
				}

				if (_mediaIsImg) {
					_container.find('iframe').hide();
					var image = new Image();
					image.src = picurl;
					$(image).load(function(){
						_container.find('iframe').attr('src', '');
						_container.find('iframe').hide();
						var imageHt = image.naturalHeight;
						var imageWdt = image.naturalWidth;
						_container.find('.photo').hide();
						// Image is portrait
						if (imageHt > imageWdt) {
							_container.find('.portrait').css('display', 'block');
							_container.find('.landscape').css('display', 'none');

							if (_layout != 'portrait') {
								_container.find('.layoutFader').show();
								if (selector == '#largeImageContainer') {
									forceChange = true;
									_container.find('.photoSocial').width('30%');
								}
							}
							else{
								if (selector == '#largeImageContainer' && _container.find('.portraitPhoto').has($('#largeImageLoadingIndicator')) && _container.find('.portraitPhoto').has($('#largeImageLoadingIndicator')).length === 0)
									_container.find('.portraitPhoto').append($('#largeImageLoadingIndicator'));
								if(_container.find('.portraitPhoto').has($('#smallImageLoadingIndicator')) && _container.find('.portraitPhoto').has($('#smallImageLoadingIndicator').length === 0))
										_container.find('.portraitPhoto').append($('#smallImageLoadingIndicator'));
							}


							_container.find('.portraitTitle').html(name);
							_container.find('.portraitSubtitle').html(caption);
							_container.find('.portraitTextArea').scrollTop(0);

							_layout = 'portrait';
							setTimeout(function(){
								if (selector == '#largeImageContainer')
									_imageCentricLoadingIndicator.stop();
								else
									_mapCentricLoadingIndicator.stop();
							}, 100);
						}

						// Image is landscape
						else {
							_container.find('.landscape').css('display', 'block');
							_container.find('.portrait').css('display', 'none');
							if (_layout != 'landscape') {
								_container.find('.layoutFader').show();
								if (selector == '#largeImageContainer') {
									forceChange = true;
									_container.find('.photoSocial').width('initial');
								}
								else{
									if(_container.find('.landscapeContent').width() * 0.3 < 250)
										_container.find('.landscapeTextArea').width(_container.find('.landscapeContent').width() - 250);
								}
							}
							else{
								if (selector == '#largeImageContainer' && _container.find('.landscapePhoto').has($('#largeImageLoadingIndicator')) && _container.find('.landscapePhoto').has($('#largeImageLoadingIndicator')).length === 0)
									_container.find('.landscapePhoto').append($('#largeImageLoadingIndicator'));
								if(_container.find('.landscapePhoto').has($('#smallImageLoadingIndicator')) && _container.find('.landscapePhoto').has($('#smallImageLoadingIndicator').length === 0))
									_container.find('.landscapePhoto').append($('#smallImageLoadingIndicator'));
							}

							_container.find('.photo').removeClass('error');
							_container.find('.landscapeTitle').html(name);
							_container.find('.landscapeSubtitle').html(caption);

							_container.find('.landscapeTextArea').scrollTop(0);

							_layout = 'landscape';
						}

						sizeLayout(media, _layout, forceChange);

						_container.find('.photo').data('picUrl', picurl);
						_container.find('.photo').css('background-image', 'url(' + picurl + ')');
						_container.find('.imageFader').fadeOut('slow');
						_container.find('.layoutFader').fadeOut('slow');
						_container.find('.photo').fadeIn('slow');
						setTimeout(function(){
							if (selector == '#largeImageContainer')
								_imageCentricLoadingIndicator.stop();
							else
								_mapCentricLoadingIndicator.stop();
						}, 100);


					});

					$(image).error(function(){
						_container.find('.photo').addClass('error');
						_container.find('.imageFader').fadeOut('slow');
						if (_layout == 'landscape') {
							_container.find('.landscapeTitle').html(name);
							_container.find('.landscapeSubtitle').html(caption);
						}
						else {
							_container.find('.portraitTitle').html(name);
							_container.find('.portraitSubtitle').html(caption);
						}
						if (selector == '#largeImageContainer')
							_imageCentricLoadingIndicator.stop();
						else
							_mapCentricLoadingIndicator.stop();
					});
				}
				//Media is video/website
				else{
					if (_layout != 'landscape')
						_container.find('.layoutFader').show();

					_container.find('.landscapeTitle').html(name);
					_container.find('.landscapeSubtitle').html(caption);
					_container.find('.landscape').css('display', 'block');
					_container.find('.portrait').css('display', 'none');
					_container.find('.landscapeTextArea').scrollTop(0);

					_layout = 'landscape';
					picurl = MapTourHelper.checkVideoURL(picurl);
					_container.find('iframe').attr('src', picurl);
					_container.find('iframe').show();
					_container.find('.photo').css('background-image', 'url(' + ')');
					_container.find('.layoutFader').fadeOut('slow');
					_container.find('.imageFader').fadeOut('slow');
					isVideo = true;
					sizeLayout(media, _layout, forceChange, isVideo);

					if (selector == '#largeImageContainer')
						_imageCentricLoadingIndicator.stop();
					else
						_mapCentricLoadingIndicator.stop();
				}
			}

			function sizeLayout(media, orientation, forceChange, isVideo){
				var container = media === 'map' ? $('#largeImageContainer') : $('#smallImageContainer');

				//IMAGE CENTRIC LANDSCAPE
				if (media === 'map') {
					//IMAGE CENTRIC LANDSCAPE
					if (orientation === 'landscape') {
						if (forceChange) {
							if (!$('body').hasClass('mobile-view')) {
								container.find('.landscapeCircleMapPlaceHolder').append($('#mainMap'));
								$('#mainMap').addClass('circleMap');
							}
							$('#smallImageContainer').hide();

								if (container.find('.imageContainer').height() * 0.2 > 150)
									container.find('.landscapeContent').height(container.find('.imageContainer').height() * 0.2);

								setTimeout(function(){
									container.find('.landscapePhoto').height(_container.find('.imageContainer').height() - container.find('.landscapeContent').height() - 60);
									container.find('.landscapePhoto').width('100%');
									$('.circleMap').height(container.find('.landscapeContent').height() + 100 + 'px');
									$('.circleMap').width(container.find('.landscapeContent').height() + 100 + 'px');

									app.map.resize(true);

								}, 0);
								container.find('.landscapeContent').prepend($('.largeImageAppTitleArea'));
								$('#smallImageContainer').hide();
							}
						}
						//IMAGE CENTRIC PORTRAIT
						else {
							if (forceChange) {
								if (!$('body').hasClass('mobile-view')) {
									container.find('.portraitCircleMapPlaceHolder').append($('#mainMap'));
									$('#mainMap').addClass('circleMap');
								}
								$('#smallImageContainer').hide();
								if (container.find('.portraitContent').width() * 0.8 < 315 && container.find('.portraitContent').height() * 0.5 > 315) {
									$('#mainMap').height(container.find('.portraitContent').width() * 0.8);
									$('#mainMap').width(container.find('.portraitContent').width() * 0.8);
									container.find('.portraitCircleMapPlaceHolder').width(container.find('.portraitContent').width() * 0.8);
									container.find('.portraitCircleMapPlaceHolder').height(container.find('.portraitContent').width() * 0.8);
								}
								else
									if (container.find('.portraitContent').height() * 0.5 < 315) {
										$('#mainMap').height(container.find('.portraitContent').width() * 0.6);
										$('#mainMap').width(container.find('.portraitContent').width() * 0.6);
										container.find('.portraitCircleMapPlaceHolder').width(container.find('.portraitContent').width() * 0.6);
										container.find('.portraitCircleMapPlaceHolder').height(container.find('.portraitContent').width() * 0.6);
									}
									else {
										$('#mainMap').height('315px');
										$('#mainMap').width('315px');
										container.find('.portraitCircleMapPlaceHolder').width('315px');
										container.find('.portraitCircleMapPlaceHolder').height('315px');
									}

								if($('.portraitCircleMapPlaceHolder').position().top - 11 < ($('#largeImageContainer .portraitTitle').height() + $('#largeImageContainer .portraitSubtitle').height())/*$('#largeImageContainer .portraitTextArea').height()*/){
									checkPortraitMap();
								}
								container.find('.photoSocial').prepend($('.largeImageAppTitleArea'));
								container.find('.portraitPhoto').height(container.find('.portrait').height() - 60 + 'px');

								app.map.resize(true);
							}
						}

						//IMAGE CENTRIC MEDIA
						if (isVideo) {
							if ($('.landscapeCircleMapPlaceHolder').has($('#mainMap')).length === 0) {
								$('.landscapeCircleMapPlaceHolder').append($('#mainMap'));
								$('#mainMap').addClass('circleMap');
								$('#smallImageContainer').hide();
								var contentHeight = $(window).height() - ($('.landscapePhoto').height() + 70);
								$('.landscapeContent').height(contentHeight - 20 + 'px');
								$('.circleMap').height($('.landscapeContent').height() + 100 + 'px');
								$('.circleMap').width($('.landscapeContent').height() + 100 + 'px');
								_container.find('.landscapeIframe').height(_container.find('.landscapePhoto').height() - 40 + 'px');
								app.map.resize(true);
							}

						}

					}

				else {
					//MAP CENTRIC

					$('#mainMap').removeClass('circleMap');
					if (forceChange) {
						$('#mapPanel').append($('#mainMap'));
						$('#largeImageContainer').hide();
						$('#smallImageContainer').show();
						$('#fullIntroImage').hide();
						$('#mainMap').width('100%');
						$('#mainMap').height('100%');
						app.map.resize(true);
					}

					if (orientation === 'landscape') {
						container.find('.landscapePhoto').width(container.find('.imageContainer').width());
						container.find('.landscapeContent').width(container.find('.imageContainer').width());
						if (container.find('.imageContainer').height() * 0.2 > 160)
							container.find('.landscapeContent').height(container.find('.imageContainer').height() * 0.2);

						container.find('.landscapePhoto').height(container.find('.imageContainer').height() - container.find('.landscapeContent').height() - 20);
						container.find('.landscapeContent').prepend($('.imageAppTitleArea'));
						if (container.find('.landscapeContent').width() * 0.3 < 250) {
							container.find('.landscapeTextArea').width(container.find('.landscapeContent').width() - 250);
							container.find('.landscapeTextArea').css({left:  250});
						}
						else
							container.find('.landscapeTextArea').width('70%');
					}
					else
						container.find('.portraitContent').append($('.imageAppTitleArea'));

					$('#largeImageContainer').hide();

				}

				var graphic = app.data.getCurrentGraphic();
				if (graphic)
					setTimeout(function(){
						app.map.resize(true);
						topic.publish("CORE_UPDATE_CENTER_MAP", graphic.geometry);
					}, 0);

				setTimeout(function(){
					if (media == 'map') {
						if (orientation === 'landscape')
							$('#largeImageContainer .linkContainer').width(225 - $('#largeImageContainer .shareButtons').width() + 'px');
						else {
							setTimeout(function(){
								$('#largeImageContainer .linkContainer').width($('#largeImageContainer').width() * 0.3 - $('#largeImageContainer .shareButtons').width() - 50 + 'px');
							}, 50);
							$('#largeImageContainer .linkContainer').width($('#largeImageContainer').width() * 0.3 - $('#largeImageContainer .shareButtons').width() - 50 + 'px');
						}
					}
					else {
						$('#smallImageContainer .linkContainer').width($('#smallImageContainer').width() * 0.3 - $('#smallImageContainer .shareButtons').width() - 10 + 'px');
					}
				}, 0);

			}

			function checkPortraitMap()
			{
				setTimeout(function(){
					var mapSize = $(window).height() - $('#largeImageContainer .portraitTitle').height() - $('#largeImageContainer .portraitSubtitle').height()/*$('#largeImageContainer .portraitTextArea').height()*/ - $('#largeImageContainer .photoSocial').height() - 145;
					$('.portraitCircleMapPlaceHolder').height(mapSize);
					$('.portraitCircleMapPlaceHolder').width(mapSize);
					$('#mainMap').height(mapSize);
					$('#mainMap').width(mapSize);
				}, 0);
			}

			function fullScreen()
			{
				// TODO for builder
				//if( _fullScreenPreventOpening )
					//return;

				_fullScreenOpening = true;

				var imageUrl = null;
				$.each($('.photo'), function(index, photo){
					if(imageUrl)
						return false;
					if ($(photo).data('picUrl') !== 'none') {
						imageUrl = $(photo).data('picUrl');
					}
				});

				if( _mediaIsImg ) {
                    imageUrl = imageUrl.replace('url(','').replace(')','');
					$.colorbox({
						href: imageUrl,
						photo: true,
						title: _title,
						scalePhotos: true,
						maxWidth: '90%',
						maxHeight: '90%'
					});
				}
				else {
					$.colorbox({
						href: $('.landscapeIframe'),
						inline: true,
						title: _title,
						width: '80%',
						height: '80%'
					});
				}

				setTimeout(function(){
					_fullScreenOpening = false;
				}, 800);
			}

			return {
				init: init,
				updatePicture: updatePicture,
				//showLayout: showLayout,
				checkPortraitMap: checkPortraitMap,
				update: update
			};
		};
	}
);
