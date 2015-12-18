/*global define:false*/
define(['backbone', 
        'models/baseModel',
        'collections/geneFiles',
        'events/eventDispatcher',
        'hb!templates/assay/gene-file-select-dropdown.html'], 
    function(Backbone,
    		BaseModel,
    		GeneFiles,
    		dispatcher,
        	template) {
    "use strict";
    var GeneFilesView = Backbone.View.extend({
        initialize: function() {
        	this.collection = new GeneFiles();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = this.options.model || null;
            this.collection.fetch();
        },

        events: {
            'change select#geneFiles': 'selectionChanged',
            'click input#enableSummaryReport': 'summaryReportChecked'
        },

        render: function() {
        	var that = this;
            this.$el.html(template({
            	collection: this.collection.toJSON(),
            	idKey: 'geneFiles',
            	labelKey: 'assay.chevron.panelTab.genesToReport',
            	model: this.model.toJSON()
            }));
			//this.$('select#geneFiles').trigger('change',{});
			
			if(this.model.getSubsetReport()) {
				this.$('input#enableSummaryReport').prop('checked',true);
				this.enableSummaryReport()
				if(that.model.getGeneFile()){
		        	$("select#geneFiles").val(that.model.getGeneFile());
		        	dispatcher.trigger('change:geneFile', that.model.getGeneFile());
		        } else{
		        	var geneFile = that.collection.toJSON()[0].id;
		        	var geneFileName=that.collection.toJSON()[0].name;
		        	if(geneFile){
		        		that.model.setGeneFile(geneFile);
		        		that.model.setGeneFileName(geneFileName);
		        		dispatcher.trigger('change:geneFile', geneFile);
		        	}
		        }
				
			} else {
				this.$('input#enableSummaryReport').prop('checked',false);
				this.enableSummaryReport();
			}
			
            return this;
        },

        selectionChanged: function(e) {
        	var isChecked = this.$('input#enableSummaryReport').is(':checked');
        	var value = '';
        	var name = '';
        	if(isChecked){
        		value = $(e.currentTarget).val();
        		name = $('select#geneFiles > option:selected').text();
        	} 
            this.model.setGeneFile(value);
            this.model.setGeneFileName(name);
            dispatcher.trigger('change:geneFile', this.model.getGeneFile());
        },
        
        summaryReportChecked :function() {
        	var isChecked = this.$('input#enableSummaryReport').is(':checked');
			if(isChecked){
				this.$('#geneFilesSection').show();
				this.model.setSubsetReport(true);
				dispatcher.trigger('change:subSetReport', true);
			} else{
				this.$('#geneFilesSection').hide();
				this.model.setSubsetReport(false);
				dispatcher.trigger('change:subSetReport', false);
			}
			this.$('select#geneFiles').trigger('change',{});
        },
        
        enableSummaryReport: function() {
        	var isChecked = this.$('input#enableSummaryReport').is(':checked');
			if(isChecked){
				this.$('#geneFilesSection').show();
				this.model.setSubsetReport(true);
				dispatcher.trigger('change:subSetReport', true);
			} else{
				this.$('#geneFilesSection').hide();
				this.model.setSubsetReport(false);
				dispatcher.trigger('change:subSetReport', false);
			}
        }
    });

    return GeneFilesView;
});