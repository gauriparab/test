define(['views/common/baseModalView',
        'models/note',
        'hb!templates/add-notes.html',
        'hb!templates/common/confirm-modal-footer.html'], 
    function(
    	BaseModalView,
    	Note,
    	bodyTemplate,
    	footerTemplate){
	'use strict';
	
	var AddNotesView = BaseModalView.extend({
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'specimen.add.note.label',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "455px"
                }
			}
		},
		
		events: {
			'click #btnNotesSave' : '_onSave',
			'click #btnNotesCancel' : '_hide'
		},
		
		initialize: function(options){
			this.model = new Note(options);
			BaseModalView.prototype.initialize.call(this, options);
			this.onComplete = options.onComplete;
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
        
        render: function() {
			BaseModalView.prototype.render.call(this);
            this.$('#modalFooter').html(footerTemplate({
            	confirmClass: 'btn-primary',
            	cancelClass: 'btn-default',
            	cancelKey: 'dialog.cancel',
            	confirmKey: 'dialog.save',
            	confirmId: 'btnNotesSave',
            	cancelId: 'btnNotesCancel'
            }));
			
			return this;
		},
		
		_onSave: function() {
			this.disableButton();
			var self = this;
			this.model.set("message", $(this.$el.find('#notes')).val());
			this.model.set("entityId", this.options.entityId);
			this.model.save(null, {
				success: function(){
					self.$el.modal('hide');
					self.onComplete();
				},
				error: _.bind(self.enableButton, self)
			});
		}
	});
	
	return AddNotesView;
});