define(["dojo/has"], 
	function(
		has
	)
	{
		return {
			addCSSRule: function(style)
			{
				if( has("ie") <= 8 )
					return;
				
				$("<style>")
					.prop("type", "text/css")
					.html(style)
					.appendTo("head");
			},
			getAppViewModeURL: function()
			{
				return document.location.protocol 
					+ '//' + document.location.host 
					+ document.location.pathname 
					+ '?appid=' + app.data.getAppItem().id;
			}
		};
	}
);