/*global define:false*/
define(['views/ParentView', 
        'models/assay/assayModel',
        'events/eventDispatcher',
        'hb!templates/assay/assay-save.html'],
    function(ParentView,
    		Assay,
    		dispatcher,
        	template) {
    "use strict";
            
    var SaveAssayView = ParentView.extend({
        initialize: function(options) {
        	this.modelFragement = new Assay({
        		url: "/ir/secure/api/assay/getAssaySave?id=" + this.model.getAssayId()
        	});
        	this.modelFragement.set("assayId", this.model.getAssayId());
        	dispatcher.on('saveAssay', this.saveAssay, this);
        },

        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.modelFragement.fetch({
        		success: function() {
        			self.model.set("assayDisplayedName", self.modelFragement.get("assayDisplayedName"));
        			self.model.set("description", self.modelFragement.get("description"));
        			if(self.modelFragement.toJSON().isParent){
        				self.$el.html(template({needsReason:self.model.toJSON().requiresReason}));
        			} else{
        				self.$el.html(template(self.model.toJSON()));
        			}
        		}
        	});
        	
            return this;
        },

        saveAssay: function() {
        	var self=this;
		    this.modelFragement.set("assayDisplayedName", $("#assay-name").val());
		    this.modelFragement.set("description", $("#assay-desc").val());
		    this.modelFragement.set("reason", $("#reason-for-change").val());
		    this.modelFragement.set("isCopyAssay", this.model.getIsCopyAssay());
		    this.modelFragement.save(null, {
		    	success: function(){
		    		if(self.model.getIsEditAssay()){
		    			window.location.href = "/ir/secure/assay.html#editSuccess";
		    		} else {
		    			window.location.href = "/ir/secure/assay.html#createSuccess";
		    		}
		    	}
		    });
		}

    });

    return SaveAssayView;
});
