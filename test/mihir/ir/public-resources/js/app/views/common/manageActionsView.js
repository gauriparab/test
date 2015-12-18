/*global define:false */
define(['jquery', 'underscore', 'backbone', 'hb!templates/common/managesample-actions-menu.html'],
    function($, _, Backbone, template) {
        'use strict';

        /**
         * An actions list widget
         *
         * @type {*}
         */
        var ActionsView = Backbone.View.extend({

            template: template,

            events: {
                'click li>a.disabled': '_onDisabledAction',
                'click li>a.enabled': '_onAction',
                'click #primary-action': '_onAction'
            },

            _validOptions: ['model', 'url', 'urlRoot', 'icon', 'actions', 'msgKeyPrefix', 'actionsEventSource',
                            'primaryAction', 'primaryActionMsgKeyPrefix' ],

            initialize: function(opts) {
                var self = this,
                    options = opts || {};

                _.extend(this, _.defaults(
                    _.pick(options, this._validOptions), {
                        model: null,
                        url: null,
                        icon: '',
                        urlRoot: '',
                        actions: null,
                        msgKeyPrefix: 'actions.',
                        primaryAction: null,
                        primaryActionMsgKeyPrefix: options.msgKeyPrefix || 'actions.'
                    }
                ));

                _.each(['show', 'hide'], function(fn) {
                    self[fn] = function() {
                        self.$el[fn]();
                    };
                });
            },

            setActions: function(actions) {
                this.actions = actions;
                return this;
            },

            setPrimaryAction: function(primaryAction) {
                this.primaryAction = primaryAction;
                return this;
            },
            
            render: function() {
                if (this.url) {
                    var self = this;
                    $.ajax({
                        url: this.url,
                        type: 'GET',
                        async: false,
                        contentType: 'application/json',
                        success: function(data) {
                            self.actions = data;
                            self._doRender.call(self);
                        }
                    });
                } else {
                    this._doRender();
                }
                return this;
            },
            
            clear: function() {
                this.setActions(null).setPrimaryAction(null).render().hide();
            },

            destroy: function() {
                this.clear();
                this.undelegateEvents();
            },

            renderActions: function(actions) {
                this.setActions(actions).render().show();
            },
            
            _doRender: function() {
                var actions = this.actions || (this.model ? this.model.get("actions") : []),
                    primaryAction = this.primaryAction;

                this.$el.html(template({
                    msgKeyPrefix: this.msgKeyPrefix,
                    primaryActionMsgKeyPrefix: this.primaryActionMsgKeyPrefix,
                    urlRoot: this.urlRoot,
                    actions: actions,
                    primaryAction: primaryAction,
                    icon: this.icon
                })).show();
            },

            _onAction: function(e) {
                var actionName = 'action:' + $(e.currentTarget).data('action').toLowerCase();
                e.preventDefault();
                if (this._events && this._events[actionName] || this.actionsEventSource === this) {
                    this.trigger(actionName, e);
                }
                if (this.actionsEventSource && this.actionsEventSource !== this) {
                    this.actionsEventSource.trigger(actionName, e);
                }
            },

            _onDisabledAction: function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        });

        return ActionsView;

    }
);


