define(["storymaps/ui/crossfader/CrossFader",
		"storymaps/maptour/core/MapTourHelper",
		"storymaps/ui/HeaderHelper",
		"storymaps/maptour/core/WebApplicationData",
		"storymaps/utils/Helper",
		"storymaps/utils/ResamplePicture",
		"dojo/topic",
		"dojo/on",
		"dojo/has"], 
	function(CrossFader, MapTourHelper, HeaderHelper, WebApplicationData, Helper, ResamplePicture, topic, on, has)
	{
		/**
		 * PicturePanel
		 * @class PicturePanel
		 *
		 * UI component that display a picture and previous/next button
		 * Emit picture change event through PIC_PANEL_PREV and PIC_PANEL_NEXT
		 */
		return function CentricIntroPanel(selector/*, isInBuilderMode*/)
		{
			var _isInit = false;
			var _panel = $(selector);
			var _layout = null;
			var _firstLoad = true;
	
			function init(hideDesktop, title, subtitle, bgColor, headerCfg/*, showEditButton*/)
			{			
				this.update(bgColor);
				_panel.find(' .introTextArea .title').html(title);
				_panel.find(' .introTextArea .subtitle').html(subtitle);
				
				HeaderHelper.setLogo($('#centricIntroPanel'), headerCfg);
				HeaderHelper.setLink($('#centricIntroPanel'), headerCfg);
				HeaderHelper.setSocial($('#centricIntroPanel'), headerCfg);
				HeaderHelper.initEvents($('#centricIntroPanel'), "bottom");
				
				_panel.css("display", "block");
				if(has("safari") || has("agent-ios"))
					$('#mainMap').addClass('safari');
					
				$('.startTourImg').css('margin-left', $('.introStartTour').width() + 5);
				var startTourW = $('.introStartTour').width() + $('.startTourImg').width();
				$('.startTour').css('margin-left', ($('.startTour').width() - startTourW)/2);
			}
	
			function update(bgColor)
			{
				_panel.css("background-color", bgColor);
			}
			
			function showPoint()
			{
				topic.publish("maptour-start-tour");
			}
			
			function showLayout(selector, attributes){
				if(app.data.hasIntroRecord() && $('.introImageTitleArea').length){
					$('.introImageTitleArea').remove();
					$('.introImageDescriptionArea').remove();
					
				}
				if (selector == '#largeImageContainer') {
					if(! attributes.isVideo() && MapTourHelper.mediaIsSupportedImg(attributes.getURL()))
						$('#fullIntroImage').css('background-image', 'url(' + attributes.getURL() + ')');
					else{
						var picurl = MapTourHelper.checkVideoURL(attributes.getURL());
						$('.introIframe').attr('src', picurl);
						$('.introIframe').show();
					}
					if (!$('body').hasClass('mobile-view')) {
						$('#mainMap').addClass('circleMap');
						$('#mapPanel').css('position', 'absolute');
						$('#mapPanel').css({
							'top': 0
						});
						if ($('.introMediaPanel').has($('#mainMap')).length === 0) 
							$('.introMediaPanel').append($('#mainMap'));
	
						$('#mainMap').addClass('introPanel');
						on.once(app.map, 'resize', function(){
							setTimeout(function(){
								topic.publish("CORE_UPDATE_EXTENT", Helper.getWebMapExtentFromItem(app.data.getWebMapItem().item));
							},0);
						});
						app.map.resize(true);
						if(_layout === 'map')
							topic.publish("CORE_UPDATE_EXTENT", Helper.getWebMapExtentFromItem(app.data.getWebMapItem().item));
							
						if(app.data.hasIntroRecord())
							app.map.getLayer('mapTourGraphics').hide();
						else
							$.each(app.map.getLayer('mapTourGraphics').graphics, function(index, graphic){
								if (index !== 0) 
									graphic.hide();
							});
						_layout = 'map';
						var graphic = app.data.getCurrentGraphic();
						if (graphic) 
							topic.publish("CORE_UPDATE_CENTER_MAP", graphic.geometry);
						
					}
					
					$('#centricIntroPanel').show();
					$('#largeImageContainer').hide();
					$('#smallImageContainer').hide();
					
					$('#fullIntroImage').show();
					
				}				
				else{
					$('#mainMap').removeClass('circleMap');
					if(app.data.hasIntroRecord())
						app.map.getLayer('mapTourGraphics').show();
					
					else {
						app.map.getLayer('mapTourGraphics').show();
						$.each(app.map.getLayer('mapTourGraphics').graphics, function(index, graphic){
							graphic.show();
						});
					}
					$('#modernIntroPanel').show();
					$('#centricIntroPanel').show();
					$('#largeImageContainer').hide();
					$('#smallImageContainer').hide();
					$('#fullIntroImage').hide();
					
					if(!attributes.isVideo() && MapTourHelper.mediaIsSupportedImg(attributes.getURL()))
						$('.introMediaPanel').css('background-image', 'url(' + attributes.getURL() + ')');
					else{
						$('.introMediaPanel').css('background-image', 'url(' + attributes.getThumbURL() + ')');
						$('.introIframe').attr('src', '');
					}
					
					if($('#mapPanel').has($('#mainMap')).length === 0)
						$('#mapPanel').append($('#mainMap'));

					if(!_firstLoad){
						on.once(app.map, 'resize', function(){
							setTimeout(function(){
								topic.publish("CORE_UPDATE_EXTENT", Helper.getWebMapExtentFromItem(app.data.getWebMapItem().item));
							},500);
						});
						app.map.resize(true);
					}
					if(_layout === 'media')
						topic.publish("CORE_UPDATE_EXTENT", Helper.getWebMapExtentFromItem(app.data.getWebMapItem().item));

					_firstLoad = false;
					_layout = 'media';
				}
				
				if(attributes.getName()){
					$('.introImageTitle').html(attributes.getName());
					$('.introImageDescription').html(attributes.getDescription());
				}

				topic.publish("CORE_RESIZE");
			}
			
			function initImageInfo(attributes){
				if(_isInit)
					return;
				$('.introImageTitle').html(attributes.getName());
				$('.introImageDescription').html(attributes.getDescription());
				
				_isInit = true;
			}
	
			return {
				init: init,
				showPoint: showPoint,
				showLayout: showLayout,
				initImageInfo: initImageInfo,
				update: update
			};
		};
	}
);