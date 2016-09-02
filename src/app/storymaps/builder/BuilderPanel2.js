define(["storymaps/utils/CommonHelper"/*,
		"dojo/topic"*/],
	function (CommonHelper/*, topic*/) {
		return function BuilderPanel(container, builderSave, builderDirectCreationFirstSave, builderGalleryCreationFirstSave) 
		{
			var _this = this,
				_builderView = null;
			
			this.init = function(builderView) 
			{	
				_builderView = builderView;
				
				initLocalization();
				
				container.removeClass('hide');
				
				app.builder.hideSaveConfirmation = hideSaveConfirmation;
				
				container.find('.builder-save').click(save);
				container.find(".builder-share").click(showShare);
				container.find('.builder-settings').click(showSettingsPopup);
				container.find('.builder-help').click(showHelpPopup);
				container.find('.builder-preview').click(showPreview);
				
				$(window).bind('keydown', function(event) {
					if (event.ctrlKey || event.metaKey) {
						// CTRL+S
						if (String.fromCharCode(event.which).toLowerCase() == 's') {
							if (!container.find('.builder-save').attr("disabled") && ! app.initScreenIsOpen) {
								event.preventDefault();
								save();
							}
						}
					}
				});
				
				if ( app.isDirectCreationFirstSave )
					container.find(".status-bar").addClass("hideCounterAndSharing");
				
				createSavePopover();
			};
			
			//
			// Panel buttons
			//
			
			function save()
			{
				console.log("common.builder.Builder - save");
				
				container.find('.builder-save').addClass('saving').html(i18n.viewer.builderPanel.buttonSaving + ' <img src="resources/icons/loader-upload.gif" style="vertical-align: -3px">');
				changeBuilderPanelButtonState(false);
				
				// ??
				app.isInitializing = false;
				
				if (app.isDirectCreationFirstSave) {
					var appTitle = $('#headerDesktop .title .text_edit_label').text();
					var appSubTitle = $('#headerDesktop .subtitle .text_edit_label').text();
					
					if ( appSubTitle == i18n.viewer.headerJS.editMe )
						appSubTitle = "";
					
					if ( ! appTitle || appTitle == i18n.viewer.headerJS.editMe ) {
						_this.saveFailed("NONAME");
						return;
					}
					
					builderDirectCreationFirstSave(appTitle, appSubTitle);
				}
				// If the app rely on a webmap and it's a gallery workflow
				// Has to do special workflow for first save
				else if (app.isGalleryCreation) {
					builderGalleryCreationFirstSave();
				}
				else {
					// Save the app 
					// If OK and needed call save webmap 
					// If OK call appSaveSucceeded
					builderSave();
				}
			}
			
			function showSettingsPopup()
			{
				closePopover();
				_builderView.openSettingPopup(false);
			}
			
			function showHelpPopup()
			{
				closePopover();
				app.builder.openHelpPopup();
			}
			
			function showPreview()
			{
				if ( ! $(this).hasClass("disabled") )
					window.open(CommonHelper.getAppViewModeURL(), '_blank');
			}
			
			function showShare()
			{
				if ( ! $(this).hasClass("disabled") )
					app.builder.openSharePopup(false);
			}
			
			//
			// Save callbacks
			//
			
			this.saveSucceeded = function()
			{
				if( app.isDirectCreationFirstSave || app.isGalleryCreation )
					app.builder.openSharePopup(true);

				resetSaveCounter();
				changeBuilderPanelButtonState(true);
				
				container.find('.builder-save').html(i18n.viewer.builderPanel.buttonSaved + ' <span class="icon icon-ok" style="vertical-align: -1px; margin-left: 6px;"></span>');
				
				setTimeout(function(){
					container.find('.builder-save').removeClass('saving').html(i18n.viewer.common.save);
				}, 3500);
			};
			
			this.saveFailed = function(source, error)
			{
				container.find('.builder-save').removeClass('saving').html(i18n.viewer.common.save);
				container.find(".builder-save").tooltip('show');
				
				if( source == "FS" && error && error.code == 400 && error.details && error.details[0] && error.details[0].split('html content').length >= 2 ) {
					container.find(".builder-save").next(".popover").find(".stepFailed2").css("display", "block");
				}
				else if (source == "NONAME") {
					container.find(".builder-save").next(".popover").find(".stepFailed3").css("display", "block");
					
					$("#headerDesktop .title").addClass("titleEmpty");
					
					container.find(".builder-save").attr("disabled", false);
					container.find(".builder-settings").attr("disabled", false);
					container.find(".builder-help").attr("disabled", false);
					
					return;
				}
				else 
					container.find(".builder-save").next(".popover").find(".stepFailed").css("display", "block");
				
				changeBuilderPanelButtonState(true);
			};
			
			//
			// Counter
			//
			
			this.hasPendingChange = function()
			{
				return container.find(".save-counter").html() && container.find(".save-counter").html() != i18n.viewer.builderPanel.noPendingChange;
			};
	
			this.incrementSaveCounter = function(/*nb*/)
			{
				var value = "";
				
				value = i18n.viewer.builderPanel.unSavedChangePlural;
				container.find(".save-counter").addClass("pendingChanges").html(value);
				
				// Don't activate save button in direct creation until there is one section
				container.find(".builder-save").toggleClass("disabled", app.isDirectCreationFirstSave && ! app.data.getStoryLength());
				
				if ( app.isDirectCreationFirstSave && app.data.getStoryLength() )
					container.find(".status-bar").removeClass("hideCounterAndSharing");
			};
	
			function resetSaveCounter()
			{
				container.find(".save-counter").removeClass("pendingChanges").html(i18n.viewer.builderPanel.noPendingChange);
				container.find(".builder-save").addClass("disabled");
			}
			
			//
			// Popover
			//
	
			function closePopover()
			{
				container.find(".builder-save").tooltip('hide');
			}
			
			function createSavePopover()
			{
				var containerId = "#" + container.attr("id");
				
				// App saved confirmation
				container.find(".builder-save").popover({
					//containerId: containerId,
					html: true,
					trigger: 'manual',
					placement: 'bottom',
					content: '<script>'
								+ '$("' + containerId + ' .builder-save").next(".popover").addClass("save-popover-2");'
								+ '$("' + containerId + ' .builder-save").next(".popover").find(".stepSave").css("display", "block");'
								+ '$("' + containerId + ' .builder-save").next(".popover").find(".stepHidden").css("display", "none");'
								+ '</script>'
								+ '<div class="stepHidden stepFailed" style="color: red;">'
								+  i18n.viewer.builderJS.saveError + ' '
								+ '<button type="button" class="btn btn-danger btn-small" onclick="app.builder.hideSaveConfirmation()" style="vertical-align: 1px;">'+i18n.viewer.builderJS.gotIt+'</button> '
								+ '</div>'
								+ '<div class="stepHidden stepFailed2" style="color: red;">'
								+  i18n.viewer.builderJS.saveError2 + ' '
								+ '<button type="button" class="btn btn-danger btn-small" onclick="app.builder.hideSaveConfirmation()" style="vertical-align: 1px;">'+i18n.viewer.builderJS.gotIt+'</button> '
								+ '</div>'
								+ '<div class="stepHidden stepFailed3" style="color: red;">'
								+  i18n.viewer.builderJS.saveError3 + ' '
								+ '<button type="button" class="btn btn-danger btn-small" onclick="app.builder.hideSaveConfirmation()" style="vertical-align: 1px;">'+i18n.viewer.builderJS.gotIt+'</button> '
								+ '</div>'
				});
			}
	
			//
			// UI
			//
			
			function hideSaveConfirmation()
			{
				container.find(".builder-save").tooltip('hide');
			}
			
			function changeBuilderPanelButtonState(activate)
			{
				container.find(".builder-cmd").attr("disabled", ! activate);
			}
			
			this.updateSharingStatus = function()
			{
				/*
				 * Sharing status
				 */
				if( app.isDirectCreationFirstSave || app.isGalleryCreation )
					container.find(".sharing-status").html(i18n.viewer.builderPanel.shareStatus1);
				else if ( app.data.getAppItem().access == "public" )
					container.find(".sharing-status").html(i18n.viewer.builderPanel.shareStatus2);
				else if ( app.data.getAppItem().access == "account" )
					container.find(".sharing-status").html(i18n.viewer.builderPanel.shareStatus3);
				else
					container.find(".sharing-status").html(i18n.viewer.builderPanel.shareStatus4);
				
				/*
				 * Share & preview button state
				 */
				
				var disableShare = app.isDirectCreationFirstSave,
					disablePreview =  app.data.webAppData.isBlank() || app.data.getAppItem().access == "private";
				
				container.find('.builder-share').toggleClass("disabled", disableShare);
				container.find('.builder-preview').toggleClass("disabled", disablePreview);
				
				if ( disableShare )
					container.find('.builder-share').tooltip();
				else
					container.find('.builder-share').tooltip('destroy');
				
				if ( disablePreview )
					container.find('.builder-preview').tooltip();
				else
					container.find('.builder-preview').tooltip('destroy');
			};
			
			this.resize = function()
			{
				//
			};
			
			function initLocalization()
			{
				container.find('.builder-save').html(i18n.viewer.common.save);
				container.find('.builder-share').html(i18n.viewer.builderPanel.buttonShare);
				container.find('.builder-settings').html(i18n.viewer.builderPanel.buttonSettings);
				container.find('.builder-help').html(i18n.viewer.builderPanel.buttonHelp);
				container.find('.builder-preview').html(i18n.viewer.builderPanel.buttonPreview);
				container.find('.builder-share').data('title', i18n.viewer.builderPanel.tooltipFirstSave);
				container.find('.builder-preview').data('title', i18n.viewer.builderPanel.tooltipNotShared);
				container.find('.save-counter').html(i18n.viewer.builderPanel.noPendingChange);
			}
		};
	}
);