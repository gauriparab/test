
define(['views/ParentView', 
        'views/panelReferenceGenomes', 
        'models/panel',
        'events/eventDispatcher',
        'hb!templates/panel-reference.html'],
    function(ParentView, 
    		PanelReferenceGenomesView,
    		Panel,
    		dispatcher,
    		template) {
    "use strict";

    var PanelView = ParentView.extend({
	    initialize: function(options) {		    
	    	dispatcher.on('change:genomeReference', this._genomeReferenceChanged, this);
		    this.modelFragement = new Panel();
	        this.modelFragement.setAssayId(this.model.getAssayId());
		    
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	this.$el.html(template({}));
            var self = this;
            /*this.model.setReference(this.modelFragement.getReference());
            this.panelReferenceGenomeView = new PanelReferenceGenomesView({
            	model: self.model
            });
	        
		    self.renderSubView(self.panelReferenceGenomeView, "#referenceDiv");*/
		    this.modelFragement.fetch({
				success: function() {
					self.model.setReference(self.modelFragement.getReference());
			        self.panelReferenceGenomeView = new PanelReferenceGenomesView({
		            	model: self.model
		            });
			        
				    self.renderSubView(self.panelReferenceGenomeView, "#referenceDiv");
				}
			});
            return this;
        },


        _genomeReferenceChanged: function(reference){
        	this.modelFragement.setReference(reference);
        }
        
    });

    return PanelView;
});
