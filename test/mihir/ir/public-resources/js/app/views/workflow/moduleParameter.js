/*global define:false*/
define(['jquery', 'underscore', 'backbone', 'hb!templates/workflow/module-parameter-boolean.html',
    'hb!templates/workflow/module-parameter-float-integer.html',
    'hb!templates/workflow/module-parameter-multistring.html',
    'hb!templates/workflow/module-parameter-singlestring.html', 'hb!templates/coming-soon.html', 'events/eventDispatcher'
].concat(['bootstrap']),
    function($, _, Backbone, boolTemplate, numberTemplate, multiStrTemplate, strTemplate, defaultTemplate, dispatcher) {
        "use strict";
        var ModuleParameterView = Backbone.View.extend({

            initialize: function() {
                var modelRule;
                if (this.options.model) {
                    this.model = this.options.model;
                    this._original = this.model.clone();
                    modelRule = this.model.get('rule');
                } else {
                    this.model = this._original = modelRule = null;
                }
                
                _.extend(this,
                    this._parameterRuleConfigs.DEFAULT,
                    this._parameterRuleConfigs[modelRule && modelRule._type]
                );
            },

            events: {
                'keyup input': '_changed',
                'change input': '_changed'
            },

            _parameterRuleConfigs: {
                SingleStringParameterRule: {
                    template: strTemplate
                },
                MultipleStringParameterRule: {
                    template: multiStrTemplate,
                    getVal: function() {
                        return _.map(this.$(':checked'),function(e) {
                            return $(e).val();
                        }).join(',');
                    }
                },
                FloatParameterRule: {
                    template: numberTemplate                    
                },
                IntegerParameterRule: {
                    template: numberTemplate                    
                },
                BooleanParameterRule: {
                    template: boolTemplate
                },
                DEFAULT: {
                    template: defaultTemplate,
                    getVal: function($elem) {
                        return $.trim($elem.val());
                    }
                }
            },

            _key: function() {
                return this.model && this.model.get('key').replace(/\./g, '-') || null;
            },

            _isDefined: function(v1) {
                return !(_.isUndefined(v1) || _.isNull(v1));
            },

            _changed: function(e) {
                e.preventDefault();
                var $elem = $(e.currentTarget);

                var value = this.getVal($elem);

                this.model.set('value', value);
                dispatcher.trigger("change:modules", this.model);
            },

            render: function () {
                var modelJson = this.model.toJSON();
                var _data = _.extend(modelJson, {
                    _key: this._key(),
                    boolValue: modelJson.value === 'true' || modelJson.value === '1'
                });
                
                var modelRule = this.model.get('rule');
                if(modelRule && modelRule._type === 'BooleanParameterRule') {
                	_data.isNumericValue=$.isNumeric(modelJson.value)
                }
                this.$el.html(this.template(_data));
                return this;
            }
        });

        return ModuleParameterView;
    });