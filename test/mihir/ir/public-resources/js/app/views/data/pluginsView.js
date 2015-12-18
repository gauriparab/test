/* global define:false*/
define([
    'jquery',
    'backbone',
    'models/data/plugins',
    'hb!templates/data/data-plugins-view.html'
],
    function(
        $,
        Backbone,
        Plugins,
        template) {
	'use strict';

    var PluginsView = Backbone.View.extend({

        _template: template,

        initialize: function(options) {
        	this.resultsId = options.id;
            options = options || {};
            this.model = new Plugins({
            	id: options.id
            });
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
        },

        undelegateEvents: function() {
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },

        render: function() {
        	var self = this;
        	this.model.fetch({
        		success: function(){
        			self.$el.html(self._template({
        				plugins: self.model.toJSON().pluginDtoList
                    }));
                    setTimeout(function(){
                    	$('#pluginsDropdown select').on('change',function(){
                    		var plugin = $(this).val();
                    		self.plugin = plugin;
                    		var url = '/ir/secure/api/plugins/executedPluginsFiles?resultId='+self.resultsId+'&pluginName='+plugin;
                    		$.ajax({
                    			url: url,
 			                    type: 'GET',
 			                    contentType: 'application/json',
 			                    dataType: 'json',
 			                    success: function(data) {
	 					            self.showPluginFiles(data.pluginFileDtoList);
 			                    }
                    		});
                    	});
                    	$('#pluginsDropdown select').trigger('change',{});
                    },10);
        		}
        	});
        },
        
        showPluginFiles:function(pluginDetails){
        	var self = this;
        	var output = $('#pluginDetails ul');
        	output.empty();
        	
        	$.each(pluginDetails,function(){
        		var wrapper = $('<li/>',{style:'list-style-type:none'});
        		var item = $('<a/>',{style:'cursor:pointer;'});
			var span = $('<span/>',{text:this.fileName,style:'margin:0px 10px;'});
			var icon = $('<i/>',{'class':'icon-file'});
        		item.on('click',function(e){
        			e.preventDefault();
        			var filename = $(this).find('span').html();
        			var url = '/ir/secure/api/plugins/executedPluginsFilesDetails?resultId='+self.resultsId+'&pluginName='+self.plugin+'&fileName='+filename;
        			$.ajax({
        				url: url,
		                type: 'GET',
		                success: function(data) {
		                	var printWindow = window.open();
					
		                    if (!printWindow) {
		                        alert("Please allow pop-ups");
		                    } else {
		                        printWindow.location = data.filePath;
		                    }
		                }
        			});
        			
        		});
			item.append(icon);
			item.append(span);
        		wrapper.append(item);
        		output.append(wrapper);
        	});
        }
	
    });

    return PluginsView;
});
