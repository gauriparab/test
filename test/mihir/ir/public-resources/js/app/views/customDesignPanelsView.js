/*global define:false*/
define(['jquery', 'underscore', 'backbone',
    'views/common/bannersView',
    'hb!templates/workflow-ampliseq-custom-panels.html',
    'hb!templates/common/spinner.html'], function($, _, Backbone, BannerView, template, Spinner) {
    
    'use strict';
    
    var CustomDesignPanelsView = Backbone.View.extend({
        initialize: function() {
            this.model = this.options.model || null;
        },

        events: {
            'click #listCustomAmpliseqPanelsBtn': '_listCustomAmpliseqPanelsBtnClick'
        },

        _listCustomAmpliseqPanelsBtnClick: function (e) {
            var button = $(e.currentTarget);

            button.attr('disabled', 'disabled');

            this.collection.username = this.$el.find('#ampliseqUsername').val();
            this.collection.password = this.$el.find('#ampliseqPassword').val();

            button.after(Spinner());

            this.collection
                .fetch()
                .always(_.bind(this._enableButton, this))
                .done(_.bind(this.render, this));
        },

        _enableButton: function() {
            this.$('.icon-loader').remove();
            this.$('#listCustomAmpliseqPanelsBtn').removeAttr('disabled');
        },

        render: function() {
            this.$el.html(template({
                username: this.collection.username,
                password: this.collection.password,
                customDesignPanels: this.collection.toJSON()
            }));
            this.trigger('afterRender');

            return this;
        },

        getSelectedAmpliseqId: function () {
            var customPanelsList = this.$el.find('#customPanelsList');
            return customPanelsList.val();
        }
    });

    return CustomDesignPanelsView;
});