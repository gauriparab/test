/*global define:false*/
define(['jquery', 'underscore', 'views/templateView', 'hb!templates/analysis/batch-analysis-error-details.html'],
        function($, _, TemplateView, template) {
        'use strict';

        var BatchAnalysisErrorDetailsView = TemplateView.extend({
            
            render: function() {
                this.$el.html(template({
                    errors:  this._errors ? this._errors.get('lineErrors') : null
                }));

                return this;
            },

            setErrors: function(errors) {
                this._errors = errors;
            }

        });

        return BatchAnalysisErrorDetailsView;

    }
);
