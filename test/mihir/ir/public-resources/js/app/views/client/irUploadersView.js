/*global define:false*/
define([ 'jquery',
         'underscore',
         'backbone',
         'views/common/dialog',
         'views/common/spinner',
         'collections/client/irUploaders',
         'hb!templates/client/ir-uploaders.html'],
    function($,
             _,
             Backbone,
             Dialog,
             Spinner,
             IRUploaders,
             template) {
        'use strict';

        var IRUploadersView = Backbone.View.extend({

            _template: template,

            initialize: function() {
                this.collection = new IRUploaders();
                this._promise = this.collection.fetch();
            },

            render: function() {
                var self = this;
                this._promise.done(function() {
                    self.$el.html(self._template({
                        uploaders: self.collection.toJSON()
                    }));
                    self.trigger('view:rendered');
                });
                Spinner.show(this.$el);
                return this;
            }
        });

        IRUploadersView.openDialog = function() {
            Dialog.open({
                headerKey: 'dialog.iruploader.title',
                bodyView: IRUploadersView
            });
        };

        return IRUploadersView;
    }
);

