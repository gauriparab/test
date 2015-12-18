/*global define:false*/
define(['backbone', 
        'collections/assayFilterChains',
        'models/baseModel',
        'events/eventDispatcher',
        'hb!templates/common/select-dropdown-with-label.html'], 
    function(Backbone, 
        	FilterChains,
        	BaseModel,
        	dispatcher,
        	template) {
	
    "use strict";
    var FilterChainView = Backbone.View.extend({
        initialize: function(options) {
        	this.collection = new FilterChains();
            this.listenTo(this.collection, 'sync', this.render);
            this.model = options.model || null;
            this.temp = new BaseModel();
            this.temp.set("applicationType", this.model.getApplicationType());
            this.temp.set("version", this.model.getVersion());
            this.collection.getAllowed(this.temp);
        },

        events: {
            'change select#filterChain': 'selectionChanged'
        },

        render: function() {
            this.$el.html(template({
                collection: _.filter(this.collection.toJSON(), function(filterChain){ return filterChain.status !== 'PUBLISHED'; }),
                idKey: "filterChain",
                labelKey: "assay.summary.filterChain",
                canBeNone: true
            }));
            if(this.model.getFilterChain()){
            	$("#filterChain").val(this.model.getFilterChain().id);
            	dispatcher.trigger('change:filterChain', this.model.getFilterChain());
            } else{
            	var filterChain = {id: -1};
            	if(filterChain){
            		this.model.setFilterChain(filterChain);
            		dispatcher.trigger('change:filterChain', filterChain);
            	}
            }
            
            return this;
        },

        selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            if(value == -1) {
            	this.model.setFilterChain({id: -1});
            } else {
            	this.model.setFilterChain(this.collection.get(value).toJSON()); 
            }
            dispatcher.trigger('change:filterChain', this.model.getFilterChain());
        }
    });

    return FilterChainView;
});
