/*global define:false*/
define(['jquery', 'underscore', 'models/baseModel', 'models/cnvBaselineType', 'collections/specimens', 'models/common/nameValidation'],
    function($, _, BaseModel, CnvBaselineType, SpecimenCollection, NameValidation) {
        "use strict";

        var EDIT_ACTION = 'EDIT';

        var CnvBaseline = BaseModel.extend({

            WHOLE_GENOME: 'WHOLEGENOME_LOWCOVERAGE',
            TARGETSEQ_EXOME: 'TARGETSEQ_EXOME',

            urlRoot: '/ir/secure/api/v40/cnvbaseline',

            defaults: function() {
                return {
                    specimens: new SpecimenCollection(),
                    status: "PENDING"
                };
            },

            validations: {
                type: function(attrs) {
                    if (!attrs.type) {
                        return 'cnvbaseline.no.type.selected';
                    }
                },

                targetRegion: function(attrs) {
                    if (attrs.type && attrs.type.get('name') !== this.WHOLE_GENOME && !attrs.targetRegion) {
                        return 'cnvbaseline.target.region.required';
                    }
                },

                specimens: function(attrs) {
                    if (!attrs.specimens || attrs.specimens.length < 5) {
                        return 'cnvbaseline.specimens.not.enough.selected';
                    }
                },
                
                nameShort: function(attrs) {
                    return NameValidation.tooShort(attrs.name);
                },
                
                nameLong: function(attrs) {
                    return NameValidation.tooLong(attrs.name);
                },
                
                nameContent: function(attrs) {
                    return NameValidation.badCharNoSpace(attrs.name);
                }
            },

            parse: function(response) {
                if (response.type) {
                    response.type = new CnvBaselineType(CnvBaselineType.prototype.parse(response.type));
                }
                
                if (response.specimens) {
                    response.specimens = new SpecimenCollection(response.specimens);
                }
                
                return response;
            },

            toSlimJSON: function(options) {
                var json = this.toJSON(options);

                json.targetRegion = json.targetRegion && _.pick(json.targetRegion, 'id') || null;
                
                if (json.specimens) {
                    json.specimens = _.map(json.specimens, function(specimen) {
                        return _.pick(specimen, 'id');
                    });
                }
                
                return json;
            },

            getPrimaryAction: function() {
                var allActions = this.get('actions');
                if (_.contains(allActions, EDIT_ACTION)) {
                    return EDIT_ACTION;
                } else {
                    return null;
                }
            },

            abort: function(options) {
                var self = this;
                return $.ajax({
                    url: this.urlRoot + '/' + this.id + '/abort',
                    type: 'POST',
                    success: function(response) {
                        self.set(self.parse(response));
                        if (_.isFunction(options.success)) {
                            options.success(self);
                        }
                    }
                });
            }
        });

        return CnvBaseline;

    });
