/*global define:false*/
define(['jquery',
        'underscore',
        'views/common/baseModalView', 
        'models/assay/filterChainDetails',
        'views/assay/parametersView',
        'hb!templates/assay/filter-chain-details-view.html',
        'hb!templates/common/view-details-footer.html',
        'utils/filterDisplayHandler'],
    function($,
    		_,
    		BaseModalView, 
    		FilterChainDetails, 
    		ParametersView,
    		bodyTemplate,
    		footerTemplate,
    		FilterDisplayHandler) {
    "use strict";

    var FilterChainDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'assay.presets.filterChainDetails',
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
			}
		},
		
		events: {
			'click #btnPrintDetails' : '_onPrint',
			'click #btnCloseDetails' : '_hide',
			'click #btnExportDetails' : "_onExport",
			'click #parametersTab li a' : '_onTabClick'
		},
    	
        initialize: function(options) {
	        this.model = new FilterChainDetails({
	        	id : this.options.filterChainId
	        });
	        BaseModalView.prototype.initialize.call(this, options);
        },
        
        delegateEvents: function() {
        	BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },

        render: function() {
        	var self=this;        	
		    this.model.fetch({
			    success: function(){
			    	self.model.set('_filters',self._modelToJSON().filters);
			    	BaseModalView.prototype.render.call(self);
				    self.$('#modalFooter').html(footerTemplate({
				    	closeKey: 'dialog.close',
				    	printId: 'btnPrintDetails',
		            	cancelId: 'btnCloseDetails'
		            }));
			    }
			});        
            return this;
        },
        
        _modelToJSON: function() {
            var self = this;
            var filters = this.model.get("filters").map(function(filter) {
            	var includeMissing;
            	var handleMissing;
            	if(filter.getConfiguredIncludeMissing){
            		includeMissing = filter.getConfiguredIncludeMissing(); 
            	}
            	if(filter.getHandleMissing){
            		handleMissing = filter.getHandleMissing()
            	}
            	
                return {
                    id: filter.id,
                    type: filter._type,
                    name: filter.name,
                    displayValue: self._getFilterDisplayValue(filter),
                    includeMissing: includeMissing || false,
                    handleMissing: handleMissing || false
                };
            });

            var json = this.model.toJSON();
            json.filters = filters;
            return _.defaults(_.extend(json, {
                // fields here that override the default values
                creator: json.createdBy && json.createdBy.lastName + ', ' + json.createdBy.firstName,
                createdOn: json.createdOn && kendo.toString(new Date(Date.parse(json.createdOn)), 'MMM dd yyyy hh:mm tt')

            }), {
                // default values here to apply in case of null
                name : '',
                description : '',
                creator: ''
            });
        },

        _getFilterDisplayValue: function(filter) {
            return new FilterDisplayHandler().getFilterDisplayValue(filter);
        }

    });

    return FilterChainDetailsView;
});
