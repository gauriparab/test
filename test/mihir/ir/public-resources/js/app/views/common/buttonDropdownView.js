/*global define:false*/
define([
    'jquery',
    'underscore',
    'backbone',
    'hb!templates/common/button-dropdown.html'
], function(
    $,
    _,
    Backbone,
    template
) {
    'use strict';

    var Events = {
        ACTION: 'action'
    };

    var ButtonDropdownView = Backbone.View.extend({

        events: {
            'click li>a': '_onItemClicked'
        },

        initialize: function(options) {
            options = options || {};
            this._label = options.label;
            this._items = options.items;
        },

        render: function() {
            this.$el.addClass('btn-group');
            this.$el.html(template({
                label: this._label,
                items: this._items
            }));
            this.$('.dropdown-menu [data-toggle=tooltip]').tooltip({
                placement: 'left'
            });
            return this;
        },

        _onItemClicked: function(e) {
            this.trigger(Events.ACTION + ':' + $(e.currentTarget).attr('id'));
        }

    });

    ButtonDropdownView.Events = Events;
    return ButtonDropdownView;

});
