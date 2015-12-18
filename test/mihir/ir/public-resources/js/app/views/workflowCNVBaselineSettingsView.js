/*global define:false*/
define(['underscore','kendo','views/ParentView', 'hb!templates/workflow-cnvbaseline-settings.html']
        .concat('bootstrap.select'), 
       function (_,kendo,ParentView, cnvBaselineSettingsTemplate) {
    "use strict";

    var WorkflowCNVBaselineSettingsView = ParentView.extend({

        initialize: function() {
            this._selectedCnvBaseline = null;
        },

        render: function() {
            this.$el.html(cnvBaselineSettingsTemplate({
                selectedCnvBaseline: this._selectedCnvBaseline ? this._selectedCnvBaselineJSON() : undefined
            }));

            return this;
        },
        
        updateSelectedCnvBaseline: function(selectedCnvBaseline) {
            this._selectedCnvBaseline = selectedCnvBaseline;
            this.render();
        },
        _selectedCnvBaselineJSON : function() {
            var json = this._selectedCnvBaseline.toJSON(), specimenNames = _.map(json.specimens, function(sp) {
                return sp.name;
            });
            return _.defaults(_.extend(json, {
                creator : json.createdBy && json.createdBy.lastName + ', ' + json.createdBy.firstName,
                createdOn : json.createdOn && kendo.toString(new Date(Date.parse(json.createdOn)), 'MMM dd yyyy hh:mm tt'),
                specimenCount : json.specimens ? json.specimens.length : 0,
                specimenNames : json.specimens ? specimenNames.join(', ') : ''
            }), {
                specimenNames : '',
                specimenCount : ''
            });
        }
    });

    return WorkflowCNVBaselineSettingsView;
});


