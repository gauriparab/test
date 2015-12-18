/* global define:false*/
define([
        'views/ParentView',
        'views/common/baseModalView',
        'views/settings/instrumentLogView',
        'hb!templates/settings/instrument-diagnostics-view.html'
        ],

		function(
				ParentView,
				BaseModalView,
				InstrumentLogView,
				template) {

			'use strict';

			var InstrumentDiagnosticsView = ParentView.extend({
				_template : template,

				initialize : function() {
				},
				
				events: {
					'click #passedViewLog' : 'viewLog',
					'click #passedDownload' : 'download',
					'click #failedViewLog' : 'viewLog',
					'click #failedDownload' : 'download',
					'click #accordion-heading' : '_toggle'
				},

				delegateEvents : function() {
					Backbone.View.prototype.delegateEvents.apply(this, arguments);
				},

				undelegateEvents : function() {
					Backbone.View.prototype.undelegateEvents.apply(this, arguments);
				},

				render : function() {
					var self=this;
					$.ajax({
              		    url: '/ir/secure/api/settings/instrumentDiagnostics',
              		    type: 'GET',
              		    contentType: 'application/json',
            		    success: function(data) {
            		    	self.$el.html(self._template({data: data}));
            		    }
					});
				},
				
				viewLog : function(e) {
					var value = $(e.currentTarget).attr('alt');
					var result = value.split(",");
					BaseModalView.open(null, {
                        el: "#logView",
                        folderPath: result[0],
                        name:result[1]
                    }, InstrumentLogView);
				},
				
				download : function(e) {
					var value = $(e.currentTarget).attr('alt');
					var result = value.split(",");
					window.location='/ir/secure/api/settings/downloadInstrumentDiagnosticsFiles?folderPath='+result[0]+'&name='+result[1];
				},
				
				_toggle: function(e) {
					var closed= $(e.currentTarget).hasClass("collapsed");
					if(closed){
						$(e.currentTarget).children("i#toggle-intrument").removeClass('icon-plus-sign').addClass('icon-minus-sign');
		        	} else {
		        		$(e.currentTarget).children("i#toggle-intrument").removeClass('icon-minus-sign').addClass('icon-plus-sign');
		        	}
		        	
		        }
				
				
			});
			return InstrumentDiagnosticsView;
		});