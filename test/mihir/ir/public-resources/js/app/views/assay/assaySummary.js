/*global define:false*/
define(['jquery', 'backbone', 'hb!templates/assay/assay-summary.html','hb!templates/workflow/workflow-reference-popover-content.html'].concat("bootstrap"), 
    function ($, Backbone, template, referencesPopoverTemplate) {
    "use strict";
    var AssaySummaryView = Backbone.View.extend({

        initialize: function () {
            this.listenTo(this.model, 'change', this.render);
            if($("#sidebarOpen").parent().parent().is(":visible")){
            	this.closeSideBar = true;
            }
        },
        
        render : function () {
            var templateJson = this.model.toJSON();
            if(templateJson.applicationType === "DNA")
            	templateJson.dnaType= true;
    		else if(templateJson.applicationType === "RNA" )
    			templateJson.rnaType= true;
    		else {
    			templateJson.dnaType= true;
    			templateJson.rnaType= true;
    		}
            this.$el.html(template(templateJson));
		    if($("#summary-table")[0]) {
		    	$("#summary-table").scrollTop($("#summary-table")[0].scrollHeight);
		    }
		    if(this.closeSideBar){
		    	$("#sidebarClose").click();
		    } else{
		    	$("#sidebarOpen").click();
		    }
		    /*this.$("#multipleSelectedReferences").popover({
                trigger: "hover", 
                placement: "right", 
                content: referencesPopoverTemplate(templateJson),
                html: true
            });*/
            return this;
        }
    });

    return AssaySummaryView;
});
