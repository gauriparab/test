/* global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'views/ParentView',
    'views/common/bannersView',
    'views/monitor/runView',
    'events/eventDispatcher',
    'collections/monitor/runs',
    'views/monitor/selectRunView',
    'views/assay/assayDetailView',
    'views/assay/templateDetailsView',
    'views/common/baseModalView',
    'hb!templates/monitor/runs-view.html'
],
    function(
        $,
        _,
        Backbone,
        ParentView,
        BannerView,
        RunView,
        Dispatcher,
        Runs,
        SelectRunView,
        AssayDetailModel,
    	TemplateDetailsView,
    	BaseModalView,
        template) {

	'use strict';

    var RunsView = ParentView.extend({

        _template: template,

        initialize: function(options) {
            this.runs = new Runs(options.data);
            Dispatcher.on('change:run', this.runChanged, this);
            Dispatcher.on('render:run', this.renderRun, this);
        },
        
        events:{
		    //"change select#filterRuns" : "runChanged",
		    'change select#libraries': '_selectLibrary',
		    'click .assayDetails' : '_showAssayDetails',
		    "click #refresh" : "refreshRun",
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
            this.$el.html(this._template({
                runsList: this.runs.toJSON()
            }));
            this.renderSelectRunView();
        },

		runChanged: function(value) {
			this.renderRun(value);
		},
		
		refreshRun: function(e) {
			this.selectedPlanId=$("#filterRuns").val();
			this.selectedLibrary=$("select#libraries").val();
			this.renderSelectRunView();
		},
		
		renderSelectRunView : function() {
			this.selectRunView = new SelectRunView({
				selectedPlanId: this.selectedPlanId
			});
			this.renderSubView(this.selectRunView, "#selectRun");
		},
		
		renderRun: function(planId) {
			var self=this;
			$.ajax({
				url: '/ir/secure/run/exp?id='+planId,
		        type: 'GET',
		        contentType: 'application/json',
		        dataType: 'json',
		        success: function(runs) {
		        	self.selectedRun=runs[0];
				 	if(self.selectedRun) {
					 	self.$('#libraries').html("");
					 	$("#assayName").html(self.selectedRun.assayDisplayName);
				    	if(!self.selectedRun.template) {
				    		 self.$('#selectLibraries').show()
			    			 _.each(self.selectedRun.libraryResultDtos, function(lib) {
			    				 self.$('#libraries')
				                .append($('<option></option>', {
				                    value: lib.id,
				                    text: lib.value
				                }));
				    		});
				    	} else {
				    		self.$('#selectLibraries').hide()
				    	}
					    var temp = new RunView({			    	
				    		data: self.selectedRun,
				    		selectedLibrary: self.selectedLibrary
				    	});
					    self.renderSubView(temp, "#runView");
				 	}
		        }
			});
		 	
		},
		
		_selectLibrary: function() {
			Dispatcher.trigger('change:libraries');
		},
		
		_showAssayDetails: function() {
			var selectedPlanId= this.selectedRun.planId;
        	
        	var id=this.selectedRun.assayId;
        	var name= this.selectedRun.assayDisplayName;
            if(!this.selectedRun.template) {
    	       	 new AssayDetailModel({
    	       		 assayId: id
    	         }).render();
            } else {
            	BaseModalView.open(null, {
                    el: "#templateDetailsModal",
                    templateId : id,
    		   		templateName : name
                }, TemplateDetailsView);
            }
		}
	
    });

    return RunsView;
});
