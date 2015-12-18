/*global define:false*/
define(['views/ParentView', 
        'views/common/bannersView', 
        'events/eventDispatcher', 
        'collections/modules', 
        'views/workflow/modules',
        'views/workflow/module',
        'models/module',  
        'hb!templates/parameters.html', 
        'hb!templates/common/spinner.html'],
    function(ParentView, 
    		BannerView, 
    		dispatcher, 
    		Modules, 
    		ModulesView, 
    		ModuleView,
    		Module,
    		template,
    		Spinner) {
    "use strict";
            
    var ParametersView = ParentView.extend({
    	initialize: function(options) {
    		dispatcher.on("change:modules", this._updateFragement, this);
            /*if (this.model.has('modules')) {
                this.modules = new Modules(this.model.getModules());
                this.modules._dataLoaded = true;
            } else {*/
            this.modules = new Modules({
               	baseUrl: '/ir/secure/api/assay',
               	assayId: this.model.attributes.assayId
            });
            //}
            if (!this.modules.isDataLoaded()) {
                this._fetchAllowedModulesPromise = 
                    this.modules.fetch();
            }
            this.modulesView = new ModulesView({
                collection: this.modules,
                model: this.model
            });
            this.moduleView = new ModuleView(this.options.model.attributes.applicationVersion);
            this.listenTo(this.modulesView, 'moduleSelected', this.renderModuleSubView);
            this.modelFragement = new Module();
            this.modelFragement.set("assayId", this.model.getAssayId());
        },

        renderModuleSubView: function(selectedModule) {
            this.moduleView.model = selectedModule;
            this.renderSubView(this.moduleView, '#module-parameters');
            return this;
        },

        render: function() {
        	
        	if(this.model.getReference() && this.model.getReference().id == '-1'){
        		this.$el.html(template({
        			isNone:true
        		}));
        	} else{
        		if (this.modules.isDataLoaded()) {
	                this._displayModules();
	                this.modelFragement.set("modules", this.model.getModules());
	            } else {
	                this.$el.html(Spinner());
	                $.when(this._fetchAllowedModulesPromise)
	                    .done(_.bind(this._updateAssayModules, this))
	                    .done(_.bind(this._displayModules, this));
	            }
        	}
            return this;
        },
        
        _updateAssayModules: function() {
            this.model.setModules(this.modules.toJSON());
            this.modelFragement.set("modules", this.model.getModules());
        },
        
        _displayModules: function() {
            this.$el.html(template({
            	isNone: false
            }));
            var selectedModule = this.modules.first();
            this.modulesView.selected = selectedModule;
            this.renderSubView(this.modulesView, "#modules");
            this.moduleView.model = selectedModule;
            this.renderSubView(this.moduleView, '#module-parameters');
        },
        
        _updateFragement: function(data){
			var mod=this.model.getModules();
			for(var index in mod)	{
				for(var paramIndex in mod[index].parameters){
					if(mod[index].parameters[paramIndex].name === data.attributes.name){
						mod[index].parameters[paramIndex].value=data.attributes.value;
					}
				}
			}
        	this.modelFragement.set("modules", mod);
        	this.model.trigger('change');
        }

    });

    return ParametersView;
});