/*global define:false*/
define([
    'jquery',
    'i18n',
    'backbone',
    'underscore',
    'models/apiToken',
    'views/errorsView',
    'views/ParentView',
    'views/common/dialog',
    'hb!templates/manage-api-token.html'
],
    function ($,
              i18n,
              Backbone,
              _,
              ApiToken,
              ErrorsView,
              ParentView,
              Dialog,
              template) {

        'use strict';

        var ManageApiTokenView = ParentView.extend({

            initialize: function () {
                this.errorsView = new ErrorsView({
                    model: this.model
                });
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.listenTo(this.model, "error", this._errorModel);
            },

            undelegateEvents: function() {
                // undelegate events in reverse order as delegate events.
                this.stopListening(this.model, "error", this._errorModel);
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            events: {
                'click #btn-manageApiTokenModal-generate': '_onGenerateToken'
            },

            render: function () {
                this.$el.html(template(this.model.toJSON()));
                this.renderSubView(this.errorsView, "#apiTokenServerErrors");
            },

            _updateToken: function() {
                this.render();
                this.$('input#apiToken').focus().select();
            },

            _errorModel: function (model, response) {
                var error = JSON.parse(response.responseText);
                _.each(error.errors.allErrors, function(e) {
                    if (e.field) {
                        this._addErrorToField(e.field);
                    }
                }, this);
            },

            _onGenerateToken: function (event) {
                event.preventDefault();
                this.model.save({}, {success: _.bind(this._updateToken, this)});
            }
        });

        ManageApiTokenView.openDialog = function (el) {
            var model = new ApiToken();
            var dialog;
            model.fetch({
                success: function() {
                    dialog = Dialog.open(
                    {
                        el: el,
                        id: 'manageApiTokenModal',
                        idPrefix: 'manageApiTokenModal',
                        headerKey: 'dialog.manageApiToken.title',
                        closeKey: 'dialog.manageApiToken.close',
                        bodyView: ManageApiTokenView,
                        autoValidate: false
                    }, {
                        model: model
                    });
                }
            });

            return {
                dialogView: dialog
            };
        };

        return ManageApiTokenView;

    });