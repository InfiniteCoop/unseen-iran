define([
        "./SocialSharing", 
        "./share/ShareDialog",
		"storymaps/utils/Helper",
        "storymaps/maptour/core/WebApplicationData"
    ], 
	function(
		SocialSharing,
		ShareDialog,
		Helper,
		WebApplicationData
	){
		var _shareDialog = new ShareDialog($("#shareDialog"));
		
		$("#bitlyStartIndex").off('click').click(function(){
			
			var urlParams = Helper.getUrlParams();
			var currentIndex = app.data.getCurrentIndex() + 1;
			var targetUrl = document.location.href;
			
			if( $("#bitlyStartIndex").is(":checked") ) {
				if( urlParams.index )
					targetUrl = targetUrl.replace(/index\=[0-9]+/, 'index=' + currentIndex);
				else
					targetUrl = document.location.origin 
								+ document.location.pathname
								+ (!urlParams || $.isEmptyObject(urlParams) ? '?' : document.location.search + '&')
								+ 'index=' + currentIndex 
								+ document.location.hash;
				 
				_shareDialog.present(SocialSharing.cleanURL(targetUrl, true), true);
			}
			else
				_shareDialog.present(SocialSharing.cleanURL(targetUrl, true));
		});
		
		function resizeLinkContainer(container)
		{
			if ( ! container.find(".imageAppTitle").length || container === $('#smallImageContainer'))
				return;

			container.find(".linkContainer").css(
				"width",
				container.find(".imageAppTitle").width() - container.find(".shareButtons").outerWidth() 
			);
		}
		
		return {
			setLogo: function(container, headerCfg)
			{
				if ( ! headerCfg.logoURL || headerCfg.logoURL == "NO_LOGO" ) {
					container.find('.logoImg').hide();
					resizeLinkContainer(container);
				}
				else {
					container.find('.logoLink').css("cursor", headerCfg.logoTarget ? "pointer" : "default");
					
					if (headerCfg.logoTarget)
						container.find('a').attr("href", headerCfg.logoTarget);
					
					resizeLinkContainer(container);
					
					container.find('.logoImg')[0].onload = function(){
						resizeLinkContainer(container);
					};
					container.find('.logoImg')[0].onerror = function(){
						resizeLinkContainer(container);
					};
					
					container.find('.logoImg').attr("src", headerCfg.logoURL).show();
				}
			},
			setLink: function(container, headerCfg)
			{
				if( headerCfg.linkURL && headerCfg.linkText )
					container.find('.linkContainer').html('<a href="' + headerCfg.linkURL + '" class="link" target="_blank">' + headerCfg.linkText + '</a>');
				else 
					container.find('.linkContainer').html(headerCfg.linkText);
			},
			setSocial: function(container, headerCfg)
			{
				var socialCfg = headerCfg.socialBtn;
				
				container.find(".share_facebook").toggleClass(
					'active',
					APPCFG.HEADER_SOCIAL 
					&& APPCFG.HEADER_SOCIAL.facebook 
					&& (!socialCfg || socialCfg.facebook)
				);
				
				container.find(".share_twitter").toggleClass(
					'active',
					APPCFG.HEADER_SOCIAL 
					&& APPCFG.HEADER_SOCIAL.twitter 
					&& (!socialCfg || socialCfg.twitter)
				);
				
				container.find(".share_bitly").toggleClass(
					'active',
					APPCFG.HEADER_SOCIAL && APPCFG.HEADER_SOCIAL.bitly
					&& APPCFG.HEADER_SOCIAL.bitly.enable && APPCFG.HEADER_SOCIAL.bitly.login 
					&& APPCFG.HEADER_SOCIAL.bitly.key && (!socialCfg || socialCfg.bitly)
				);
			},
			initEvents: function(container/*, bitlyPlacement*/)
			{
				container.find(".share_facebook").off('click').click(function(){
					/*var title = $('<div>' + app.data.getWebAppData().getTitle() + '</div>').text(),
						subtitle = $('<div>' + app.data.getWebAppData().getSubtitle() + '</div>').text();*/

					SocialSharing.shareFacebook(
						"", 
						"", 
						null, 
						$(this).data('url')
					);
				});
				container.find(".share_twitter").off('click').click(function(){
					var title = WebApplicationData.getTitle() || app.data.getWebMapItem().item.title;
					
					SocialSharing.shareTwitter(
						title, 
						$(this).data('url')
					);
				});
				/*
				container.find(".share_bitly").off('click').click(function(){
					SocialSharing.shareBitly(
						$(this).parent(), 
						bitlyPlacement, 
						$(this).data('url')
					);
				});
				*/
				container.find(".share_bitly").off('click').click(function(){
					var url = $(this).data('url') || document.location.href;
					_shareDialog.present(SocialSharing.cleanURL(url, true));
				});
				
				$(window).resize(function(){
					resizeLinkContainer(container);
				});
			}
		};
	}
);