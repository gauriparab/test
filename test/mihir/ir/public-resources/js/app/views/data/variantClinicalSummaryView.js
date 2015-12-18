/*global define:false*/
define(['backbone',
        'models/data/summary',
        'hb!templates/data/variant-clinical-summary-view.html'], 
    function(Backbone,
    		Summary,
        	template) {
	
    "use strict";
    var VariantSummaryView = Backbone.View.extend({
        initialize: function(options) {            
            this.model = new Summary({
            	url: options.url,
            	resultId: options.id
            });
            this.listenTo(this.model, 'sync', this.render);
            this.model.fetch();
        },

        render: function() {
            this.$el.html(template(this.formatJSON()));
            return this;
        },
        
        formatJSON: function() {
        	var obj = {};
        	obj.content = [];
        	var data = this.model.toJSON();
        	//var data = {"content":{"Gene fusion found":{"ROS1 Fusion":{"Associated Therapy":"crizotinib"},"ALK Fusion":{"Associated Therapy":"crizotinib"}},"Variants found":{"EGFR Exon 19 deletion":{"Associated Therapy":"crizotinib"},"EGFR L858R":{"Associated Therapy":"crizotinib"},"BRAF V600E":{"Associated Therapy":"dabrafenib in combination with trametinib"}},"CNV found":{"None": {"Associated Therapy" : "None"}}}}
        	var keys = _.keys(data.content);
        	// collect all the custom fields eg. "Associated Therapy".
        	var columns = [];
        	_.each(keys, function(key){
        		var genedata = data.content[key];
        		var genekeys = _.keys(genedata);
        		// only exam the first gene's custom fields
        		if (genekeys != null && genekeys[0] != null) { 
        			_.each(_.keys(genedata[genekeys[0]]), function(therapyKey){
        				_.contains(columns, therapyKey) ? "" : columns.push(therapyKey);
        			});
        		}
        	});

        	_.each(keys, function(key){
        		var temp = {};
        		temp.columns = [];
        		temp.columns.push(key);
        		if(columns.length > 0) {
        			temp.columns= _.union(temp.columns, columns);
        		}
        		var genedata = data.content[key];
        		temp.values = [];
        		_.each(_.keys(genedata), function(genekey){
        			var customfields = [];
        			customfields.push(genekey);        			
        			_.each(columns, function(customfieldKey){
        				var customfieldVal = genedata[genekey] == null ? null : genedata[genekey][customfieldKey];
        				customfields.push(customfieldVal == null ? "none" : customfieldVal);        				
        			});
        			temp.values.push(customfields);
        		});
        		obj.content.push(temp);
        	});
        	return obj;
        }
    });

    return VariantSummaryView;
});
