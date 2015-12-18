/* global define:false */
define(['models/assay/assayModel',
        'views/ParentView',
        'hb!templates/sample/library-prep.html'],
    function(AssayModel,
    		 ParentView,
    		 template) {
    'use strict';

    var LibraryPrepView = ParentView.extend({
    	
    	

        initialize: function(options) {
            this.assayId = options.id;
            this.barcodes=options.barcodes;
            this.assay= new AssayModel({id: this.assayId});
        },
        

        render: function() {
        	var self=this
        	this.assay.fetch({
			    success: function(){
			    	var kits= (self.assay.toJSON().applicationType == "DNA and Fusion" || self.assay.toJSON().applicationType == "OCP") ? true : false;
			    	self.$el.html(template({
			    		libraryPrepType: (self.assay.toJSON().applicationType == "DNA_RNA") ? 'DNA+RNA' : self.assay.toJSON().applicationType,
			    		isPanelKit: kits,
			    		isControlsKit: kits,
			    		isCNVCalibrator: kits,
			    		barcodes: self.barcodes
			    	}));
			    }
			});   
        }

    });
    return LibraryPrepView;
});