/*global define:false */
define(['underscore', 'backbone', 'hb!templates/common/validated-text.html'],
    function(_, Backbone, template) {
        'use strict';

        /**
         * A validated text box
         *
         * @type {*}
         */
        var ValidatedTextView = Backbone.View.extend({

            _valid: /(^$)|(^[A-Za-z0-9_\-\. ]{1,256}$)/,

            _template: template,

            events: {
                'keyup input[type=text]': '_onKeyUp',
                'blur input[type=text]': '_onBlur'
            },

            /**
             * Constructor
             *
             * @param options
             */
            initialize: function(options) {
                options = options || {};
                this._placeholder = options.placeholder || '';
                this._value = options.value || '';

                _.each(['focus', 'blur'], function(fn) {
                    this[fn] = function() {
                        var textbox = this.$('input[type=text]');
                        textbox[fn].apply(textbox);
                    };
                }, this);
            },

            render: function() {
                this.$el
                    .addClass('control-group')
                    .html(this._template({
                        placeholder: this._placeholder,
                        value: this._value
                    }));
                return this;
            },

            value: function(text) {
                if (text !== undefined) {
                    this.$('input[type=text]').val(text).keyup();
                } else {
                    return this._value;
                }
            },

            isValid: function() {
                return this._valid.test(this._value);
            },

            /**
             * Highlight text box in red for invalid values
             *
             */
            _onKeyUp: function() {
                this._value = this.$('input[type=text]').val().trim();
                if (this.isValid()) {
                    this.$el.removeClass('error');
                } else {
                    this.$el.addClass('error');
                }
                this.trigger('keyup');
            },

            _onBlur: function() {
                this.trigger('blur');
            }

        });

        return ValidatedTextView;
    }
);
