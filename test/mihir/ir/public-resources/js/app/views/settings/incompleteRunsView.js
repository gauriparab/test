/* global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'views/settings/incompleteRunsGridView',
         'views/common/confirmDeleteModalView',
         'views/common/auditReasonView',
		'hb!templates/settings/incomplete-runs-grid-view.html'],

function(
		$,
		_,
		Backbone,
		IncompleteRunsGridView,
		ConfirmDeleteModalView,
		AuditReasonView,
		template) {

	'use strict';

	var ReferenceSequence = Backbone.View.extend({

		_template : template,
		_gridEl : '#incomplete-runs',

		initialize : function(options) {
			options = options || {};
			this.gridView = new IncompleteRunsGridView();
		},
		
		events: {
            'click #delete-incomplete-runs' : '_onDelete',
        },

		delegateEvents : function() {
			Backbone.View.prototype.delegateEvents.apply(this, arguments);
		},

		undelegateEvents : function() {
			Backbone.View.prototype.undelegateEvents.apply(this, arguments);
		},

		render : function() {
			this.$el.html(this._template({}));
			this.gridView.setElement(this.$(this._gridEl)).render();
		},
		
		_onDelete: function() {
        	var self = this;
        	ConfirmDeleteModalView.open(function(){
        		AuditReasonView.open(function(){
        			var ids = _.pluck(self.gridView.getSelected().toJSON(), 'id'); 
        			var data = {};
        			data.ids = ids;
        			data.reason = document.getElementById("reason").value;
    	        	$.ajax({
    	        		url: '/ir/secure/api/settings/datamanagement/deleteIncompletePlanruns',
    	        		method: 'DELETE',
    	        		contentType : 'application/json',
    	        		data: JSON.stringify(data),
    	        		success: function(){
    	        			var checkboxes = self.gridView.$el.find('tbody tr td :checked');
    	        			_.each(checkboxes, function(checkbox){
    	        				$(checkbox).click();
    	        			});
    	        			self._onCompleteFunc('settings.dataManagement.delete.success');
    	        		}
    	        	});
        		});	        	
        	}, {
        		headerKey: 'settings.dataManagement.deleteLabel',
        		confirmMessageKey: 'settings.dataManagement.delete.message',
        		cancelClass: 'btn-default',
        		confirmClass: 'btn-primary'
        	}, ConfirmDeleteModalView);
        },
	});

	return ReferenceSequence;
});
