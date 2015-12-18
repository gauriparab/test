define(['views/common/baseModalView',
        'events/eventDispatcher', 
        'hb!templates/data/confirm-restore-view.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
        BaseModalView,
        dispatcher,
        bodyTemplate,
        footerTemplate) {
	'use strict';
	
	var ExtractionView = BaseModalView.extend({
				
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: this.headerKey,
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                }
			}
		},
		
		events: {
			'click #btnExtractionSave' : '_onSave',
			'click #btnExtractionCancel' : '_hide'
		},
		
		initialize: function(options){
			this.options.headerKey = "data.results.restore";
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		
		render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'confirm.ok',
            	confirmId: 'btnExtractionSave',
            	cancelId: 'btnExtractionCancel'
            }));
		},
		
		_onSave: function() {
			var self=this;
			this.$('#btnExtractionSave').hide();
			this.$('#confirmationMessage').hide();
			this.$('#restorationProgress').show();
			$.ajax({
      		    url: '/ir/secure/api/data/restoreArchivedData?expLibraryprepId='+this.model.toJSON().expLibraryprepId,
      		    type: 'PUT',
      		    contentType: 'application/json',
    		    success: function() {
    		    	self._hide();
    		    	dispatcher.trigger('restoration:complete',  'results.restore.success');
    		    },
    		    error: function() {
    		    	self.$('#restorationProgress').hide();
    		    }
    		});
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        }
		
		
	});
	
	return ExtractionView;
});