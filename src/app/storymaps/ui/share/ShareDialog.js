define([
        "./ShareURLPanel",
        "./ShareEmbedPanel"
    ],
	function (
		ShareURLPanel,
		ShareEmbedPanel
	) {
		return function ShareDialog(container)
		{
			var _shareURLPanel = new ShareURLPanel(container.find('.share-url-panel')),
				_shareEmbedPanel = new ShareEmbedPanel(container.find('.share-embed-panel'));
			
			container.on('shown.bs.modal', function () {
				_shareURLPanel.focus();
			});
			
			this.present = function(url, indexIncluded)
			{
				if($('#centricIntroPanel').css('display') === 'block')
					$('.linkPoint').hide();
				else
					$('.linkPoint').show();
				
				_shareURLPanel.present(url);
				_shareEmbedPanel.present(url);
				
				container.find('.modal-title').html(i18n.viewer.headerFromCommon.share);
				container.find('.embed-title').html(i18n.viewer.shareFromCommon.embed);
				container.find('.btn-close').html(i18n.viewer.common.close);
				
				if( !indexIncluded && container.find('#bitlyStartIndex').is(":checked") )
					container.find('#bitlyStartIndex').click();
				
				container.modal({ keyboard:true });
			};
		};
	}
);