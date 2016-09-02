// Fixing popover issue with slow image loading in twitter bootstrap 2.3.2
// https://github.com/twbs/bootstrap/issues/5235#issuecomment-29806787
			
!function ($) {
	var popover_content_tmp = $.fn.popover.Constructor.prototype.setContent;
	$.fn.popover.Constructor.prototype.setContent = function () {
		popover_content_tmp.call(this);
		
		// Following is a copy from tooltip.js. Basically we are doing the alignment again
		var $tip = this.tip();
		
		$tip.find('img').on('load', {self: this}, function(event){
		
			setTimeout(function(){
				$('#thumbLoading').hide();
			}, 0);
			var self = event.data.self;
			$tip.removeClass('fade in top bottom left right');
			
			var placement, pos, actualWidth, actualHeight, tp;
			
			placement = typeof self.options.placement == 'function' ?
				self.options.placement.call(this, $tip[0], self.$element[0]) :
				self.options.placement;
			
			pos = self.getPosition();
			
			actualWidth = $tip[0].offsetWidth;
			actualHeight = $tip[0].offsetHeight;
			
			switch (placement) {
				case 'bottom':
					tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2};
					break;
				case 'top':
					tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2};
					break;
				case 'left':
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth};
					break;
				case 'right':
					tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
					break;
			}
			setTimeout(function(){
				$('#thumbLoading').hide();
			}, 0);
			self.applyPlacement(tp, placement);
			//    self.$element.trigger('shown')
		});

		$tip.find('img').on('error', {self: this}, function(event){
		
		$('#thumbLoading').hide();
		console.log("imagePopover - thumbnail fail to load");
		var self = event.data.self;
		$tip.removeClass('fade in top bottom left right');
		
		var placement, pos, actualWidth, actualHeight, tp;
		
		placement = typeof self.options.placement == 'function' ?
			self.options.placement.call(this, $tip[0], self.$element[0]) :
			self.options.placement;
		
		pos = self.getPosition();
		
		actualWidth = $tip[0].offsetWidth;
		actualHeight = $tip[0].offsetHeight;
		
		switch (placement) {
			case 'bottom':
				tp = {top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2};
				break;
			case 'top':
				tp = {top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2};
				break;
			case 'left':
				tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth};
				break;
			case 'right':
				tp = {top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width};
				break;
		}
		
		self.applyPlacement(tp, placement);
		//    self.$element.trigger('shown')
		});
	};
}(window.jQuery);