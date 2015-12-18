/*global define:false */
define(['jquery', 'underscore', 'backbone', 'events/eventDispatcher', 'models/analysis/specimenGroupModel',
    'models/analysis/specimenGroupRelationshipModel', 'hb!templates/analysis/analysis-samples-new.html'],
    function($, _, Backbone, dispatcher, SpecimenGroup, SpecimenGroupRelationship, template) {
        'use strict';

        /**
         * A summary view of Analysis details
         *
         * @type {*}
         */
        var AnalysisSamplesRelationshipView = Backbone.View.extend({

            /*
             * The type of the relationship to set on the SpecimenGroups that are created.
             */
            _relationshipType: null,

            /*
             * The maximum # of samples that this relationship supports.
             */
            _maxSamples: null,

            /*
             * Defines the Template that should be used for the Sample relationship.
             */
            _bodyTemplate: null,

            /**
             * Placeholder text in name input.
             */
            _placeholderText: 'Relationship Name (Required)',

            /*
             * a single function name or array of function names that will be run in addition to the defaults in here
             * in order to dictate if the selected samples can be added to this relationship. a return value of
             * True should indicate valid, false should indicate invalid.
             */
            _selectionValidations: null,

            initialize: function(options) {
                this.model = options.model || new SpecimenGroup({
                    groupType: this._relationshipType,
                    members: []
                });
                this.id = _.has(options, 'id') ? options.id : this.model.id;
            },

            events: {
                'click .add-samp.active': '_requestSpecimens',
                'click input.cross': '_removeSpecimen',
                'click .swap': '_swapRoles',
                'keyup input[type=text]': '_updateName',
                'click button': '_addRelationship',
                'click .delete-btn': '_removeRelationship'
            },

            delegateEvents: function() {
                Backbone.View.prototype.delegateEvents.apply(this, arguments);
                this.listenTo(dispatcher, 'specimenGroup:selectionsChanged', this._changeModificationState);
            },

            undelegateEvents: function() {
                this.stopListening(dispatcher, 'specimenGroup:selectionsChanged', this._changeModificationState);
                Backbone.View.prototype.undelegateEvents.apply(this, arguments);
            },

            render: function() {
                this.$el.html(template(_.extend({
                        body: this._bodyTemplate,
                        id: this.id,
                        readyToAdd: this._validateReadyToAdd(),
                        isFull: this.model.get('members').length === this._maxSamples,
                        isComplete: this.model.isValidRelationship(),
                        placeholder: this._placeholderText
                    },
                    this._getSamples(),
                    this.model.toJSON(),
                    this.getAdditionalTemplateParams())
                ));
                return this;
            },

            _getSamples: function() {
                var relationship = {};

                this.model.get('members').each(function(member) {
                    relationship[member.get('role')] = {
                        name: member.get('specimen').get('name'),
                        gender: member.get('specimen').get('attributeValueMap').Gender
                    };
                });
                return relationship;
            },
            /*
            * A Way to provide additional arguments to the template for the view when it renders. This should be a
            * function but can just be an object if necessary.
            */
            getAdditionalTemplateParams: function() {
                return {};
            },

            _validateReadyToAdd: function() {
                return this.model.get('members').length > 0 && this.model.isNameValid();
            },

            _changeModificationState: function(selectedSamples) {

                var validSamples = selectedSamples && selectedSamples.length > 0;
                var validNumSamples = (this.model.get('members').length + selectedSamples.length) <= this._maxSamples;
                var alreadyAdded = this._validateSamplesAlreadyAdded(selectedSamples);
                var validAdditionalValidations = this._checkAdditionalValidations(selectedSamples);

                var isActive = validSamples && validNumSamples && !alreadyAdded && validAdditionalValidations;
                this.$('.add-samp').toggleClass('active', isActive);
            },

            _validateSamplesAlreadyAdded: function(selectedSamples) {
                var members = this.model.get('members').map(function(member) {
                    return member.get('specimen').get('id');
                });
                return _.some(selectedSamples, function(sample) {
                    return _.contains(members, sample.get('id'));
                });
            },

            _checkAdditionalValidations: function(selectedSamples) {
                if (this._selectionValidations) {
                    if (_.isArray(this._selectionValidations)) {
                        return _.every(this._selectionValidations, function(validation) {
                            return this[validation].call(this, selectedSamples);
                        }, this);
                    } else {
                        return this[this._selectionValidations].call(this, selectedSamples);
                    }
                }
                return true;
            },

            _requestSpecimens: function(e) {
                e.preventDefault();
                this.listenToOnce(dispatcher, 'samples:selected', this._addToRelationship);
                dispatcher.trigger('specimenGroup:requestSelections');
            },

            /*
             * Defines how selected samples should be added to the relationship.
             */
            _addToRelationship: null,

            _addRoleIfNecessary: function(sample, relationship, role) {
                var members = relationship.get('members').map(function(member) {
                    return !member || {
                        id: member.get('specimen').id,
                        role: member.get('role')
                    };
                });
                var existingRole = _.findWhere(members, {role: role});
                var existingSample = _.findWhere(members, {id: sample.id});

                if (!existingSample && !existingRole) {
                    relationship.get('members').push(new SpecimenGroupRelationship({
                        specimen: sample,
                        role: role
                    }));
                    return true;
                }
                return false;
            },

            _removeSpecimen: function(e) {
                e.preventDefault();
                var role = $(e.currentTarget).parent().data('value');
                this.model.get('members').remove(this.model.get('members').findWhere({role: role}));
                this.reRenderAndValidate();
            },

            /*
             * Defines the rules that govern how a swap occurs in the relationship.
             */
            _swapRoles: null,

            _updateName: function(e) {
                this.model.set('name', $.trim($(e.currentTarget).val()));
                dispatcher.trigger('specimenGroup:change:name', this.model, this);
            },

            validateName: function() {
                var isNameValid = this.model.isNameValid();
                var isReadyToAdd = this.model.get('members').length > 0;
                var nameHasValue = this.model.get('name') && this.model.get('name').trim() !== '';
                if (nameHasValue) {
                    this.nameValidationError(!isNameValid);
                } else {
                    this.nameValidationError(false);
                }
                this.refreshDisplayedName(isNameValid && isReadyToAdd);
            },

            duplicateNameError: function(isNameDup) {
                this._highlightNameError(isNameDup, 'add.samples.name.duplicate');
            },

            nameValidationError: function(isNameInvalid) {
                this._highlightNameError(isNameInvalid, 'add.samples.name.invalid');
            },

            _highlightNameError: function(showerror, msgkey) {
                var selector = this.$('h2 input').toggleClass('control-group error', showerror);
                if (showerror) {
                    if (this.lastMsgKey !== msgkey) {
                        selector.tooltip('hide').tooltip('destroy');
                        selector.data('title', $.t(msgkey))
                            .tooltip({
                                animation: false,
                                placement: 'bottom',
                                trigger: 'manual'
                            });
                        selector.tooltip('show');
                        this.lastMsgKey = msgkey;
                    }
                } else {
                    selector.tooltip('hide').tooltip('destroy');
                    this.lastMsgKey = '';
                }
                dispatcher.trigger('specimenGroup:validation:name', !showerror);
            },

            refreshDisplayedName: function(isValid) {
                this.$('button.btn-primary').prop('disabled', !isValid);
            },

            _addRelationship: function(e) {
                e.preventDefault();
                dispatcher.trigger('specimenGroup:analyze', this.model);
                this.model = new SpecimenGroup({ groupType: this._relationshipType });
                this.render();
            },

            reRenderAndValidate: function() {
                var preserveAddSamplesState = this.$('.add-samp').hasClass('active');
                this.render();
                dispatcher.trigger('validate');
                dispatcher.trigger('specimenGroup:change:name', this.model, this);
                this.$('.add-samp').toggleClass('active', preserveAddSamplesState);
            },

            _removeRelationship: function(e) {
                e.preventDefault();
                dispatcher.trigger('specimenGroup:remove', this.model);
                this.remove();
            }
        });

        return AnalysisSamplesRelationshipView;
    }
);
