/*global define:false */
define(['require',
    'jquery',
    'underscore',
    'backbone',
    'views/wizard/chevronsView',
    'collections/chevrons',
    'views/errorsView',
    'views/common/bannersView',
    'events/eventDispatcher',
    'hb!templates/wizard.html'],
    function(require,
             $,
             _,
             Backbone,
             ChevronsView,
             ChevronsCollection,
             ErrorsView,
             BannerView,
             dispatcher,
             template) {

        'use strict';

        /**
         * A Backbone View for a Wizard model.
         *
         * @type {*}
         */
        var WizardView = Backbone.View.extend({

            _cache: {},

            events: {
                'click #nextStep' : '_next',
                'click #topNextStep' : '_next',
                'click #previousStep' : '_previous',
                'click #topPreviousStep' : '_previous',
                'click #chevrons a' : '_moveToTab',
                'click #cancel' : '_onCancel',
                'click #sidebarClose' : '_sidebarClose',
                'click #sidebarOpen' : '_sidebarOpen',
                'click #save-assay' : '_saveAssay'
            },

            initialize: function(options) {
                options = options || {};
                this._wizard = options.wizard;
                this._template = options.template || template;

                this._model = this._wizard.get('model');
                this.originalModel = this._model.clone(); //ensure previousAttributes is set on model.

                this.chevronView = new ChevronsView({
                    collection: new ChevronsCollection(this._wizard.get('pages')),
                    currentStep: this._steps().current().getName(),
                    parentView: this,
                    updateExistingEntity: options.updateExistingEntity
                });

                this.errorsView = new ErrorsView({
                    model: this._model
                });
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);

                this.on('change:wizardStep', this._onWizardStepChanged, this);

                this._wizard.on('change:pages', this._setupChevrons, this);

                this._model.on('invalid', this._onValidationError, this);
                this._model.on('change', _.bind(this._onValidationUpdate, this, {errors: false}));
                dispatcher.on('validate:custom', _.bind(this._onCustomValidationUpdate, this));
                
                _.each(_.keys(this._model.validations), function(field) {
                    this._model.on('change:'+field, _.bind(this._onFieldChange, this, field));
                }, this);

                dispatcher.on('validate', this._onValidationUpdate, this);
            },

            undelegateEvents: function() {
                dispatcher.off('validate');
                _.each(_.keys(this._model.validations), function(field) {
                    this._model.off('change:'+field);
                }, this);
                this._model.off('change');
                this._model.off('invalid', this._onValidationError, this);
                dispatcher.off('validate:custom');
                this._wizard.off('change:pages', this._setupChevrons, this);
                this.off('change:wizardStep', this._onWizardStepChanged, this);
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            render: function() {
                this.$el.html(this._template(this._wizard.toJSON()));
                this._renderSubView(this.chevronView, '#chevrons');
                this._renderSubView(this.errorsView, '#errors');
                this._moveToStep(this._steps().current().getName());
                return this;
            },

            _renderDetailView: function() {
                var currentStep = this._steps().current().getName();

                this._renderSubView(this.detailView, '#detail');

                if (_.isFunction(this.detailView.setState) && this._cache[currentStep]) {
                    this.detailView.setState(this._cache[currentStep]);
                }

                this._onValidationUpdate({
                    errors: false
                });

                this.$('#nextStep').toggle(this._steps().hasNext());
                this.$('#topNextStep').toggle(this._steps().hasNext());
                this.$('#previousStep').toggle(this._steps().hasPrevious());
                this.$('#topPreviousStep').toggle(this._steps().hasPrevious());
				if(!this._steps().hasNext()){
					this.$('#save-assay').show();
				}else{
					this.$('#save-assay').hide();
				}
				
            },

            _renderSidebarView: function() {
                this._renderSubView(this.sidebarView, '#sidebar');
            },

            _renderSubView: function(view, selector) {
                if (view) {
                    view.setElement(this.$(selector)).render();
                }
            },

            _setupChevrons: function() {
                this.chevronView.collection = new ChevronsCollection(this._wizard.get('pages'));
                this.chevronView.currentStep = this._steps().current().getName();
                this._renderSubView(this.chevronView, '#chevrons');
            },

            _next: function(e) {
                e.preventDefault();
                var self = this;
                if(this.detailView.modelFragement) {
	                this.detailView.modelFragement.save(null, {
	                	success: function(data) {
	                		if(data.toJSON().assayId){
	                			self._model.set("assayId", data.toJSON().assayId);
	                		}
	                		if(data.toJSON().applicationType){
	                			self._model.setApplicationType(data.toJSON().applicationType);
	                		}
	                		if (!self.$('#nextStep').hasClass('disabled') && !self.$('#topNextStep').hasClass('disabled') && self._steps().hasNext()) {
	                			self._moveToStep(self._steps().current().getNext().getName());
	                        }
	                	}
	                });    
                } else{
                	if (!self.$('#nextStep').hasClass('disabled') && !self.$('#topNextStep').hasClass('disabled') && self._steps().hasNext()) {
            			self._moveToStep(self._steps().current().getNext().getName());
                    }
                }
            },

            _previous: function(e) {
                e.preventDefault();
                if (!this.$('#previousStep').hasClass('disabled') && !this.$('#topPreviousStep').hasClass('disabled') && this._steps().hasPrevious()) {
                    this._moveToStep(this._steps().current().getPrevious().getName());
                }
            },

            _moveToTab: function(e) {
                e.preventDefault();
                if ($(e.currentTarget).parent('li').hasClass('disabled')) {
                    return;
                }
                this._moveToStep($(e.currentTarget).data('id'));
            },

            _moveToStep: function(name) {
                var self = this,
                    currentStep = this._steps().current().getName();

                BannerView.clear();

                if (this.detailView && _.isFunction(this.detailView.getState)) {
                    this._cache[currentStep] = this.detailView.getState();
                }

                this.$('#errors').empty();

                this._steps().setCurrentByName(name);

                this._stopEvents(self.detailView);
                this._stopEvents(self.sidebarView);

                this.$('#nextStep, #previousStep').addClass('disabled');
                this.$('#topNextStep, #topPreviousStep').addClass('disabled');

                require([this._steps().current().getDetailsPage(), this._steps().current().getSidebarPage()],
                    function(DetailsView, SidebarView) {
                        var options = self._steps().current().getOptions();

                        if (SidebarView) {
                            self.sidebarView = new SidebarView({
                                model: self._model
                            });
                        }

                        self.detailView = new DetailsView({
                            model: self._model,
                            parent: self,
                            sidebar: self.sidebarView,
                            options: options,
                            originalModel: self._steps().current().getName() === 'APPLICATION' ? self.originalModel : undefined
                        });

                        self.trigger('change:wizardStep', self._steps().current().getName());
                        self.$('#previousStep').removeClass('disabled');
                        self.$('#topPreviousStep').removeClass('disabled');
                    }
                );
            },

            _stopEvents: function(view) {
                if (view) {
                    view.stopListening();
                    view.undelegateEvents();
                    dispatcher.off(null, null, view);
                }
            },


            _steps: function() {
                return this._wizard.get('steps');
            },

            _onWizardStepChanged: function() {
                this._renderDetailView();
                this._renderSidebarView();
            },

            _onFieldChange: function(field) {
                this.errorsView.clear();
                if (!this._model.isValid({
                    include: [field],
                    errors: true
                })) {
                    this.detailView.trigger('invalid:'+field);
                }
            },

            _onValidationUpdate: function(options) {
                options = options || {};
                var hasErrors = options.errors !== false;
                
                if (this._model.isValid({
                    include: options.include || this._steps().current().getValidations(),
                    errors: hasErrors
                })) {
                    this.$('#nextStep').removeClass('disabled');
                    this.$('#topNextStep').removeClass('disabled');
                    this.errorsView.clear();
                } else {
                    this.$('#nextStep').addClass('disabled');
                    this.$('#topNextStep').addClass('disabled');
                }
            },
            
            _onCustomValidationUpdate: function(hasErrors) {
                this.$('#nextStep').toggleClass('disabled', hasErrors);
                this.$('#topNextStep').toggleClass('disabled', hasErrors);
            },

            _onValidationError: function(model, errors, options) {
                if (options.errors) {
                    _.each(errors, function(error) {
                        this.errorsView.showError(model, {
                            responseText: JSON.stringify({
                                message: $.t(error)
                            })
                        });
                    }, this);
                }
            },
            
            _onCancel: function(e) {
                this.trigger("cancel", e);
            },
            
            _sidebarClose: function() {
           		$("#sidebar").removeClass('span4');
           		$("#summary").hide();     
           		$("#sidebar").parent().find('div.span8:first').addClass('span11').removeClass('span8').css("width", "95%");
           		$("#sidebarOpen").parent().parent().show();
            },
            
            _sidebarOpen: function() {
            	$("#sidebarOpen").parent().parent().hide();
            	$("#sidebar").parent().find('div.span11').css("width", "").addClass('span8').removeClass('span11');
           		$("#sidebar").addClass('span4');           		
            	$("#summary").show();
            },
            
            _saveAssay: function(e) {
            	dispatcher.trigger("saveAssay",e);
            },

        });

        return WizardView;
    }
);



