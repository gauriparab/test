/*global define:false*/
define(['underscore', 'collections/workflowCNVBaselines', 'views/ParentView', 'views/workflowCNVBaselineSettingsView',
        'hb!templates/workflow-cnvbaseline.html', 'hb!templates/workflow-cnvbaseline-selection.html']
        .concat('bootstrap.select'),
       function (_, WorkflowCNVBaselines, ParentView, WorkflowCNVBaselineSettingsView, cnvBaselineTemplate, cnvBaselineTemplateSelection) {
    "use strict";

    var WorkflowCNVBaselineView = ParentView.extend({

        initialize: function() {
            this.model = this.options.model || null;
            this._allowedCnvBaselines = new WorkflowCNVBaselines();
            this._selectedCnvBaseline = null;
            if (this.model) {
                this._selectedCnvBaseline = this.model.getBaseline();
            }
            this._cnvBaselineSettingsView = new WorkflowCNVBaselineSettingsView();
        },

        render: function() {
            this.$el.html(cnvBaselineTemplate());

            if (this._allowedCnvBaselines.length === 0) {
                this._allowedCnvBaselines.getAllowed(this.model,
                    _.bind(function(model, response) {
                        this._allowedCnvBaselines.set(response);
                        this._renderAllowedCnvBaselineSelection();
                    }, this));
            } else {
                this._renderAllowedCnvBaselineSelection();
            }

            return this;
        },

        _renderAllowedCnvBaselineSelection: function() {
            var $cnvBaselineSelectEl,
                cnvBaselineId = this._selectedCnvBaseline ? this._selectedCnvBaseline.get('id') : '';
            this.$('#baseline-select').html(cnvBaselineTemplateSelection({
                cnvBaselines: this._allowedCnvBaselines.toJSON()
            }));
            this._cnvBaselineSettingsView.setElement(this.$('#baseline-settings'));
            $cnvBaselineSelectEl = this.$('#selected-cnv-baseline');
            $cnvBaselineSelectEl
                .val(cnvBaselineId)
                .selectpicker({ size: 5 })
                .on('change', _.bind(this._setSelectedCnvBaseline, this));
            this._setSelectedCnvBaseline();
        },

        _setSelectedCnvBaseline: function() {
            var selectedCnvBaselineId = this.$('#selected-cnv-baseline').val();
            this._selectedCnvBaseline = this._allowedCnvBaselines.get(selectedCnvBaselineId)||null;
            var existing = this.model.getBaseline();
            // only update if we are changing the to a new baseline
            if (!existing || !this._selectedCnvBaseline || existing.id !== this._selectedCnvBaseline.id) {
                this.model.setBaseline(this._selectedCnvBaseline);
            }
            this._renderCnvSettings();
        },

        _renderCnvSettings: function() {
            this._cnvBaselineSettingsView.updateSelectedCnvBaseline(this._selectedCnvBaseline);
        }

    });

    return WorkflowCNVBaselineView;
});


