/*global define:false*/
define(['jquery', 
        'underscore', 
        'backbone',
        'events/eventDispatcher',
        'hb!templates/workflow-finalreport-selection.html'].concat('bootstrap.select'), 
        function($, _, Backbone, dispatcher, template) {
    'use strict';
    var WorkflowFinalReportTemplateCollectionSelectView = Backbone.View.extend({

        initialize: function() {
        },
        
        events : {
            'change #selected-final-report' : '_selectionChanged'
        },
        
        delegateEvents: function() {
            Backbone.View.prototype.delegateEvents.apply(this, arguments);
            this.listenTo(this.collection, 'sync', this.render);
            this.listenTo(this.collection, 'add', this.render);
            this.listenTo(this.collection, 'change', this.render);
            dispatcher.on('finalReportTemplate:selectionChanged', _.bind(this._changeSelection, this));
            dispatcher.on('finalReportTemplate:valueChanged', _.bind(this._valueChanged, this));
        },

        undelegateEvents: function() {
            dispatcher.off('finalReportTemplate:valueChanged', _.bind(this._valueChanged, this));
            dispatcher.off('finalReportTemplate:selectionChanged', _.bind(this._changeSelection, this));
            this.stopListening(this.collection, 'change', this.render);
            this.stopListening(this.collection, 'add', this.render);
            this.stopListening(this.collection, 'sync', this.render);
            Backbone.View.prototype.undelegateEvents.apply(this, arguments);
        },
        
        render: function() {
            var selected = this.model.getReportTemplate();

            this.$el.html(template({
                reportTemplates: this.collection.toJSON()
            }));

            this.$('#selected-final-report')
                .val(selected ? selected.get('id') : '')
                .selectpicker({ size : 5});
            return this;
        },
        
        _valueChanged: function(collection) {
            this.collection = collection;
        },

        _changeSelection: function() {
            var selected = this.model.getReportTemplate();
            this.$('#selected-final-report')
                .val(selected ? selected.get('id') : '')
                .selectpicker('refresh');
        },
        
        _selectionChanged: function(e) {
            var value = $(e.currentTarget).val();
            var selected = this.collection.get(value) || null;
            this.model.setReportTemplate(selected);
        }

    });

    return WorkflowFinalReportTemplateCollectionSelectView;
});