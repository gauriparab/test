/*global define:false */
define(['jquery',
    'i18n',
    'underscore',
    'backbone',
    'kendo',
    'views/formView',
    'models/analysis/sharedAnalysisModel',
    'collections/sharing/sharedWithCollection',
    'views/common/bannersView',
    'hb!templates/analysis/analysis-share-modal.html'].concat('bootstrap.modal', 'bootstrap.modalmanager'),
    function($,
             i18n,
             _,
             Backbone,
             kendo,
             FormView,
             SharedAnalysisModel,
             SharedWithCollection,
             BannersView,
             template) {
        'use strict';

        /**
         * A Modal view for sharing or unsharing an analysis. It also shows all current shares.
         *
         * @type {*}
         */
        var AnalysisShareModalView = FormView.extend({

            template: template,

            tagName: 'div',

            className: 'modal fade',

            modified: false,

            // FormView
            submitButtonSelector: '#shareAnalysisButton',

            events: {
                'click .deleteAnalysisBtn': '_unshareAnalysis',
                'submit #shareAnalysis': '_shareAnalysis',
                'click .btn-close': '_onClose',
                'keyup input#userEmail' : '_enableDisableShareButton'

            },

            initialize: function (options) {
                options = options || {};
                this.analysis = options.analysis;
                // The new model
                this.model = this._newSharedWithModel({}, {
                    sharedEntity: this.analysis
                });
                this._sharedWith = this._newSharedWithCollection([], {
                    sharedId: this.analysis.id,
                    model: SharedAnalysisModel,
                    url: '/ir/secure/api/v40/analysis/' + this.analysis.id +'/share'
                });
                this._enableDisableShareButton();
            },

            delegateEvents: function() {
                FormView.prototype.delegateEvents.apply(this, arguments);
                this.listenTo(this.model, 'sync', this._onModelSynced);
                this.listenTo(this.model, 'error', this._onModelSaveError);
                this.listenTo(this._sharedWith, 'sync', this._onCollectionSynced);
                this.listenTo(this._sharedWith, 'add', this.render);
                this.listenTo(this._sharedWith, 'remove', this.render);
            },

            _onClose: function() {
                if (this.modified) {
                    if (_.isFunction(this.options.onSharingUpdated)) {
                        this.options.onSharingUpdated();
                        this._enableDisableShareButton();
                    }
                }
            },

            // allows replacing the model with a test double
            _newSharedWithModel: function (attrs, options) {
                return new SharedAnalysisModel(attrs, options);
            },

            // allows replacing the model with a test double
            _newSharedWithCollection: function (models, options) {
                return SharedWithCollection.constructOrRetrieve(options.sharedId, options);
            },

            _onCollectionSynced: function () {
                this._sharedWith.forEach(function (model) {
                    model.setSharedEntity(this.analysis);
                }, this);
                this.render();
            },

            _onModelSaveError: function (model, xhr) {
                if (!xhr.responseText) {
                    return;
                }

                var responseError = JSON.parse(xhr.responseText);

                // defer to global ajax error handling in ir.js
                if (responseError.status > 400) {
                    return;
                }

                var messages = _.pluck(responseError.errors.allErrors, 'defaultMessage');

                this._onValidationFailure(messages);
            },

            _onModelSynced: function () {
                // Replace the model with a new one as it has now been saved
                var oldModel = this.model;
                this.model = this._newSharedWithModel({}, {
                    sharedEntity: this.analysis
                });

                // re-initialize listeners now that a new model has been created.
                this.undelegateEvents();
                this.delegateEvents();

                this._sharedWith.add(oldModel);
                this.modified = true;
            },

            showModal: function () {
                this.$el.modal({
                    width: 700,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show: true
                });
                this.$el.on('hidden', _.bind(this.remove, this));
                return this;
            },

            _makeColumns: function() {
                var cols = [
                    { field: "email",
                        title: "E-mail",
                        width: 100,
                        template: function (dataItem) {
                            var link = $(document.createElement("a"))
                                .attr("href", "mailto:" + dataItem.email)
                                .text(dataItem.email);
                            return $(document.createElement("div")).append(link).html();
                        }
                    },
                    { field: "sharedBy",
                        title: "Shared By",
                        width: 100
                    },
                    { field: "sharedOn",
                        title: "Date",
                        width: 100
                    },
                ];
                if (this.analysis.canShare()) {
                    cols.push({
                        field: "Unshare",
                        title: "Unshare",
                        width: 10,
                        template: '<button type=\"button\" class=\"btn deleteAnalysisBtn\">' +
                            '<i class=\"icon-trash\"></i></button>'
                    });
                }
                return cols;
            },

            render: function() {
                this.$el.html(template(this._json()));

                this.$el.find('#shareAnalysisGrid').kendoGrid({
                    selectable: "row",
                    sortable: true,
                    resizable: true,
                    scrollable: false,
                    columns: this._makeColumns()
                });

                this.renderGrid();
                this._enableDisableShareButton();
                return this;
            },

            renderGrid: function() {
                var kendoGrid = this.$el.find("#shareAnalysisGrid").data("kendoGrid");

                this._sharedWith.forEach(function (sharedWith) {
                    var sharedByUser = sharedWith.get('sharedBy');
                    kendoGrid.dataSource.insert({
                        email: sharedWith.get('email'),
                        sharedBy: sharedByUser.firstName + ' ' + sharedByUser.lastName,
                        sharedOn: kendo.toString(new Date(Date.parse(sharedWith.get('sharedOn'))),
                            "MMM dd yyyy hh:mm tt")
                    });
                });

                this.clearEmailIdText();
                this._enableDisableShareButton();
            },

            clearEmailIdText: function() {
                this.$el.find("#userEmail").val("");
            },

            _updateModelFromDom: function() {
                this.model.setEmail(this.$el.find('#userEmail').val());
            },

            // FormView
            save: function() {
                this._shareAnalysis();
            },

            _shareAnalysis: function() {
                this._removeAnyAjaxErrors();
                this._removeBanner();
                this._updateModelFromDom();
                this.model.save();
            },

            _enableDisableShareButton: function() {
                var emailField = this.$el.find('input#userEmail').val();
                if (emailField) {
                    this.enableButton('#shareAnalysisButton');
                } else {
                    this.disableButton('#shareAnalysisButton');
                }
            },

            _onValidationFailure: function(messages) {
                this.enableButton(this.submitButtonSelector);
                BannersView.show({
                    container: $('.modal-body'),
                    style: 'error',
                    messages: messages
                });
            },

            _unshareAnalysis: function (clickEvent) {
                clickEvent.preventDefault();
                var currentTarget = $(clickEvent.currentTarget);
                if (!currentTarget.hasClass('confirm')) {
                    currentTarget.addClass('confirm');
                    currentTarget.html($.t('confirm.confirm'));
                    return this;
                }
                var emailTd = currentTarget.closest("tr").find("td").first();
                var model = this._sharedWith.findWhere({
                    email: $.trim(emailTd.text())
                });
                model.destroy();
                this.modified = true;
            },

            _removeAnyAjaxErrors: function() {
                this.$("#ajaxerror").remove();
            },

            _removeBanner: function() {
                this.$(".control-group.error").removeClass("error").find("i.icon-warning-sign").remove();
                this.$(".modal-body").children(".alert.alert-error").remove();
            },

            _json: function() {
                return {
                    headerKey: this.analysis.get("name"),
                    collectionZeroLength: this._sharedWith.length === 0,
                    canShare: this.analysis.canShare()
                };
            }
        });

        AnalysisShareModalView.open = function(options) {
            var modalView = new AnalysisShareModalView(options);
            modalView.render();
            modalView.undelegateEvents();
            modalView.showModal();
            modalView.delegateEvents();
            modalView._sharedWith.fetch();
        };

        return AnalysisShareModalView;
    }
);
