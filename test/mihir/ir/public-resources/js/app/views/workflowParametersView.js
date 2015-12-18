/*global define:false*/
define(['jquery', 'underscore', 'views/ParentView', 'events/eventDispatcher', 'collections/modules', 'views/workflow/modules',
    'views/workflow/module', 'hb!templates/workflow-parameters.html', 'hb!templates/common/spinner.html'],
    function($, _, ParentView, dispatcher, Modules, ModulesView, ModuleView, template, Spinner) {
        "use strict";

        var WorkflowParametersView = ParentView.extend({

            initialize: function() {
                if (this.model.has('modules')) {
                    this.modules = this.model.getModules();
                } else {
                    this.modules = new Modules();
                }
                if (!this.modules.isDataLoaded()) {
                    this._fetchAllowedModulesPromise = 
                        this.modules.getAllowed(this.model);
                }
                this.modulesView = new ModulesView({
                    collection: this.modules,
                    model: this.model
                });
                this.moduleView = new ModuleView();
                this.listenTo(this.modulesView, 'moduleSelected', this.renderModuleSubView);
            },

            renderModuleSubView: function(selectedModule) {
                this.moduleView.model = selectedModule;
                this.renderSubView(this.moduleView, '#module-parameters');
                return this;
            },

            render: function() {
                if (this.modules.isDataLoaded()) {
                    this._displayModules();
                } else {
                    this.$el.html(Spinner());
                    $.when(this._fetchAllowedModulesPromise)
                        .done(_.bind(this._updateWorkflowModules, this))
                        .done(_.bind(this._displayModules, this));
                }
                return this;
            },
            
            _updateWorkflowModules: function() {
                this.model.setModules(this.modules);
            },
            
            _displayModules: function() {
                this.$el.html(template());
                var selectedModule = this.modules.first();
                this.modulesView.selected = selectedModule;
                this.renderSubView(this.modulesView, "#modules");
                this.moduleView.model = selectedModule;
                this.renderSubView(this.moduleView, '#module-parameters');
            }

        });

        return WorkflowParametersView;
    });