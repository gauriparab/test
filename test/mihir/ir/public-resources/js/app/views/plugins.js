/*global define:false*/
define(['views/ParentView', 
        'models/plugins',
        'events/eventDispatcher',
        'hb!templates/plugins.html'],
    function(ParentView,
    		Plugins,
    		dispatcher,
    		template) {
    "use strict";

    var PluginsView = ParentView.extend({
	    initialize: function(options) {
	    	this.modelFragement = new Plugins({
				assayId:this.model.getAssayId()
			});
	    	this.modelFragement.setAssayId(this.model.getAssayId());
        },
        
        delegateEvents: function() {
            ParentView.prototype.delegateEvents.apply(this, arguments);
        },
        
        undelegateEvents: function() {
            ParentView.prototype.undelegateEvents.apply(this, arguments);
        },
        
        events: {
        	'change #plugins input' : '_changePluginSelection'
        },

        render: function() {
        	var that = this;
        	
        	this.modelFragement.fetch({
        		success:function(){
        			var list = that.modelFragement.toJSON().pluginDtoList;
                    var selectedPlugins = _.filter(list, function(data) { return data.isSelected;});
                    if(list.length === 0 || selectedPlugins.length === 0){
                        var temp = {};
                        temp.warning = $.t('assay.summary.noplugins');
                        that.model.setSelectedPlugins(temp);
                    }else{
                        that.model.setSelectedPlugins(list);
                    }
        			that.$el.html(template({
        				data:that.modelFragement.toJSON()
        			}));
				}
			});
            return this;
        },
        
        _changePluginSelection: function() {
        	var that = this;
        	var selected = [];
			$('#plugins input:checked').each(function(){
				var temp = {};
				temp.name = that.$(this).val();
				temp.isSelected = true;
				selected.push(temp);
			});
			that.modelFragement.set('pluginDtoList',selected);
			 if(selected.length === 0){
                 var temp = {};
                 temp.warning = $.t('assay.summary.noplugins');
                 that.model.setSelectedPlugins(temp);
	         }else{
	             that.model.setSelectedPlugins(selected);
	         }
        }
    });

    return PluginsView;
});
