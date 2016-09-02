define([
    ], 
	function (
	) {
		return function ShareEmbedPanel(container)
		{
			var EMBED_TPL  = '<iframe width="%WIDTH%" height="%HEIGHT%" src="%URL%" frameborder="0" scrolling="no"></iframe>',
			_url = null;
			
			this.present = function(url)
			{
				_url = url;
				
				container.find('.embed-explain').html(i18n.viewer.shareFromCommon.embedExplain);
				container.find('.embed-lbl-size').html(i18n.viewer.shareFromCommon.size);
				
				setEmbed('100%', '800px');
			};
			
			function setEmbed(width, height)
			{
				container.find(".embedTextarea").val(
					EMBED_TPL
						.replace("%URL%", _url)
						.replace("%WIDTH%", width)
						.replace("%HEIGHT%", height)
				);
			}
		};
	}
);