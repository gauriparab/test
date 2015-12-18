define(['backbone',
        'models/assay/control',
        'collections/sample/barcodes',
        'hb!templates/assay/controls-view.html'], 
    function(Backbone,
    		 Control,
    		 Barcodes,
    		 template){
	'use strict';
	
	var ControlsView = Backbone.View.extend({
		
		initialize: function(options){
			this.model = new Control(options);
			this.barcodes = new Barcodes({
				url : '/ir/secure/api/library/getBarcodes?assayId=' +  options.id
			});
		},
		
		render: function(){
			var self = this;
			$.when(this.barcodes.fetch(), this.model.fetch()).done(function(){
				self._finalizeRender();
			});
			return this;
		},
		
		_finalizeRender: function(){
			this.model.set("barcodes", this.barcodes.toJSON());
			this.$el.html(template(this.model.toJSON()));
			if(this.options.afterRenderComplete){
				this.options.afterRenderComplete();
			}
		}
	});
	
	return ControlsView;
});