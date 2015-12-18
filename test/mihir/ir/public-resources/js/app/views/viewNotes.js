define(['views/common/baseModalView',
        'views/noteListView',
        'models/note',
        'hb!templates/view-notes.html',
        'hb!templates/common/modal-done-footer.html'], 
    function(
    	BaseModalView,
    	NoteListView,
    	Note,
    	bodyTemplate,	
    	footerTemplate){
	'use strict';
	
	var ViewNotes = BaseModalView.extend({
		
		_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'sample.planARun.addNote',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
		events: {
			"click #addInlineNote" : "_addNote",
			"click #removeNote" : "_removeNote",
			"click #saveNote" : "_saveNote"
		},
		
		initialize: function(options){
			this.noteListView = new NoteListView(options);
			this.model = new Note(options);
			BaseModalView.prototype.initialize.call(this, options);
		},
		
		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
        
        render: function() {
        	BaseModalView.prototype.render.call(this);
        	this.renderSubView(this.noteListView, "#allNotes");
            this.$('#modalFooter').html(footerTemplate({
            	class: 'btn-default',
            	messageKey: 'dialog.close'
            }));
			return this;
		},
		
		_addNote: function(e) {
			this.$el.find('textarea').parent().show();
			$(e.currentTarget).parent().hide();
			$("#removeNote").parent().show();
			$("#saveNote").parent().show();
		},
		
		_removeNote: function() {
			$("#removeNote").parent().hide();
			$("#saveNote").parent().hide();
			this.$el.find('textarea').parent().hide();
			this.$el.find('textarea').val("");
			$("#addInlineNote").parent().show();
		},
		
		_saveNote: function() {
			var self = this;
			this.model.set("message", this.$el.find('textarea').val());
			this.model.set("entityId", this.options.entityId);
			this.model.save(null, {
				success: function() {
					self._removeNote();
					self.renderSubView(self.noteListView, "#allNotes");
				}
			});
		}
	});
	
	return ViewNotes;
});