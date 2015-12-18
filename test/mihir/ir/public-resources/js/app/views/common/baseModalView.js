/*global define:false */
define(['jquery',
        'underscore',
        'backbone',
        'hb!templates/common/modal.html',
        'hb!templates/common/audit-modal-reason.html',
        'hb!templates/common/spinner.html'].concat('bootstrap'),
    function(
    		$,
    		_,
    		Backbone,
    		template,
    		reasonTemplate,
    		Spinner) {
        'use strict';

        /**
         * A Bootstrap widget for generic modals
         *
         * @type {*}
         */
        var BaseModalView = Backbone.View.extend({

            template: template,

            tagName: 'div',

            className: 'modal fade',

            options: function() {
                return _.extend(_.result(Object.getPrototypeOf(this), 'options') || {}, _.result(this, '_options'));
            },

            events: function() {
                return _.extend(_.result(Object.getPrototypeOf(this), 'events') || {}, _.result(this, '_uiEvents'));
            },

            _validProperties: ['headerKey', 'bodyTemplate', 'needsReason', 'bodyCtx', 'bodyKey', 'template'],

            validProperties: function() {
                return _.union(this._validProperties || [], _.result(Object.getPrototypeOf(this), '_validProperties'));
            },

            initialize: function(options) {
                _.extend(this.options, options || {});
                _.extend(this, _.pick(this.options, _.result(this, 'validProperties')));
            },

            render: function() {
            	this.$el.modal(this.options.modalOptions);
                this.$el.html(this.template(this._json()));
                if(this.options.needsReason){
                	this.$el.find('.modal-body').append(reasonTemplate());
                	this.$el.find("#reason-for-change").each(function(){
                		$(this).val('');
                	});
                }
                return this;
            },

            renderSubView: function(view, selector) {
                var $element = ( selector instanceof $ ) ? selector : this.$el.find(selector);
                view.setElement($element).render();
            },

            onHide: function() {
                if (_.isFunction(this.options.onHide)) {
                    this.options.onHide();
                } else {
                    this.remove();
                }
            },

            _json: function() {
                var model = this.model ? this.model.toJSON() : null;
                return _.extend({}, _.clone(this.options), {
                    model: model
                });
            },

            _onConfirm: function() {
                this.trigger('confirm');
                this._hide();
            },

            _hide: function() {
                this.unbind();
                this.undelegateEvents();
                this.$el.modal('hide');
            },

            undelegateEvents: function() {
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },
            
            enableButton: function(){
    			this.$("button.btn-primary")
                .removeClass('disabled')
                .prop('disabled', false)
                .removeAttr('title');
    			this.$('#modalFooter .icon-loader').remove();
    		},
    		
    		disableButton: function(title){
    			var element = this.$("button.btn-primary");
    			if (element.hasClass('disabled')) {
    				return false;
    			}
    			element.addClass('disabled').prop('disabled', true);				
    			element.after(Spinner());	
    			if(title) {
    				element.attr('title', title);
    			}
    			return true;
    		}

        });

        var _dialogCache = {};

        BaseModalView.open = function(success, options, clz) {
            options = options || {};
            clz = clz || this;

            var name = options.dialogName;
            if (name) {
                if (_dialogCache[name]) {
                    _dialogCache[name].remove();
                    delete _dialogCache[name];
                }
            }

            var dialog = new clz(options || {});
            dialog.on('confirm', function() {
                success(dialog);
            });
            dialog.render();
            if (name) {
                _dialogCache[name] = dialog;
            }
            return dialog;
        };

        return BaseModalView;
    }
);
