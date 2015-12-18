/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'handlebars',
    'views/workflow/module',
    'views/common/plugins/modalViewPlugin',
    'hb!templates/workflow/module-parameters-preview.html',
    'hb!templates/workflow/module.html',
    'hb!templates/workflow/module-parameters.html',
    'hb!templates/workflow/module-parameter.html'
], function(
    $,
    _,
    Backbone,
    Handlebars,
    ModuleView,
    ModalViewPlugin,
    template,
    moduleTemplate,
    moduleParametersTemplate,
    moduleParameterTemplate
) {
    'use strict';

    var ModuleParametersPreview = Backbone.View.extend({

        events : {
            'click ul.parameters-sidebar li a' : '_onModuleSelected'
        },

        initialize: function(options) {
            options = options || {};
            this.collection = options.modules;
        },

        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.call(this);
            this.listenTo(this, ModalViewPlugin.Event.RENDERED, this._onPostRender);
        },

        undelegateEvents: function() {
            this.stopListening(this);
            Backbone.View.prototype.undelegateEvents.call(this);
        },

        render: function() {
            this.$el.html(template({
                modules: this.collection.toJSON()
            }));
            this._onPostRender();
            return this;
        },

        _onPostRender: function() {
            this._onModuleSelected($.Event('click', { currentTarget: this.$('ul.parameters-sidebar li:first a')}));
            if (this.$el.data('modal')) {
                this.$el.modal('layout');
            }
        },

        _onModuleSelected: function(e) {
            var cid = $(e.currentTarget).data('cid'),
                module = this.collection.get(cid),
                parameters = module.get('parameters'),
                sections = parameters.getSections(),
                parametersBySectionByGroup = parameters.getParametersBySectionThenByGroupMap();

            $(e.currentTarget).parent().siblings().removeClass('active');
            $(e.currentTarget).parent().addClass('active');

            this.$('#parameters').html(moduleTemplate({
                sections: sections
            }));

            this.$('#module-tab-content').html(moduleParametersTemplate({
                parametersBySectionByGroup: parametersBySectionByGroup
            }));

            _.each(parametersBySectionByGroup, function(parametersByGroup/*, section*/) {
                _.each(parametersByGroup, function(parameters/*, group*/) {
                    _.each(parameters, function(parameter) {
                        this.$('#' + parameter._key).html(moduleParameterTemplate(parameter));
                    }, this);
                }, this);
            }, this);

            this.$('#parameters [data-toggle="tab"]:first').tab('show');
        }

    });

    new ModalViewPlugin(ModuleParametersPreview, {
        title: $.t('workflow.parameters.preview.title', { workflowName: ''}),
        maxHeight: 500,
        width: (function() {
            return ($(window).width() <= 1024) ? '92%' : '75%';
        }())
    });

    return ModuleParametersPreview;
});