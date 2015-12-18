/*global define:false*/
define(['views/common/baseModalView', 
        'models/assay/assayModel',
        'views/assay/parametersView',
        'hb!templates/assay/assay-details-view.html',
        'hb!templates/common/view-details-footer.html'],
    function(BaseModalView, 
    		AssayModel, 
    		ParametersView,
    		bodyTemplate,
    		footerTemplate) {
    "use strict";

    var AssayDetailsView = BaseModalView.extend({

    	_options: function() {
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'assay.details.view',
				//onHide: function(){},
				width: "950px",
				modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true,
                    width: "950px",
                    heigth: "500px"
                }
			}
		},
		
		events: {
			'click #btnPrintDetails' : '_onPrint',
			'click #btnCloseDetails' : '_hide',
			'click #parametersTab li a' : '_onTabClick'
		},
    	
        initialize: function(options) {
	        this.model = new AssayModel({
	        	id : this.options.assayId
	        });
	        BaseModalView.prototype.initialize.call(this, options);
        },
        
        delegateEvents: function() {
        	BaseModalView.prototype.delegateEvents.apply(this, arguments);
            this.$el.on('hidden', _.bind(this.onHide, this));
        },
        
        undelegateEvents: function() {
        	BaseModalView.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self=this;        	
		    this.model.fetch({
			    success: function(){
			    	var list = self.model.toJSON().pluginsDto.pluginDtoList;
			    	var selectedPlugins = _.filter(list, function(data) { return data.isSelected;});
                    if(list.length === 0 || selectedPlugins.length === 0){
                        var temp = {};
                        temp.warning = $.t('assay.summary.noplugins');
                        self.model.setSelectedPlugins(temp);
                    }else{
                        self.model.setSelectedPlugins(list);
                    }
			    	BaseModalView.prototype.render.call(self);
				    self.$('#modalFooter').html(footerTemplate({
				    	closeKey: 'dialog.close',
				    	printId: 'btnPrintDetails',
		            	cancelId: 'btnCloseDetails'
		            }));
				    $("#parametersTab li a").first().click();
			    }
			});        
            return this;
        },
        
        _onTabClick: function(e){
        	var module = _.filter(this.model.toJSON().assayParameterDto.modules, function(mod){
        		return mod.name === $(e.currentTarget).html();
        	})[0];
        	this.parametersView = new ParametersView({
        		parameters: module.parameters
        	});
        	this.renderSubView(this.parametersView, "#parametersView");
        },
        
        _onPrint: function(){
        	
        }
    });

    return AssayDetailsView;
});
