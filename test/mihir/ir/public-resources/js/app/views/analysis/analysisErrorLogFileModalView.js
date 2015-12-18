/*global define:false */
define(['jquery', 'underscore', 'backbone', 'views/common/baseModalView', 'models/analysis/analysisErrorLogFile',
    'hb!templates/analysis/analysis-error-log-contents.html', 'hb!templates/common/modal-done-footer.html',
    'hb!templates/common/modal-fade.html'],
    function($, _, Backbone, BaseModalView, AnalysisErrorLogFile, template, footerTemplate, fadeTemplate) {
        'use strict';

        var AnalysisErrorLogFileModalView = BaseModalView.extend({

            _options: function() {
                return {
                    bodyTemplate: template,
                    headerKey: 'analysis.errorLog.header',
                    template: fadeTemplate, 
                    modalOptions : {
                        backdrop: 'static',
                        attentionAnimation: null,
                        keyboard: false,
                        show : true,
                        maxHeight : function() {
                            return $(window).height() - 200;
                        }
                    }
                };
            },

            initialize: function(options) {
                BaseModalView.prototype.initialize.call(this, options);
                this.model = new AnalysisErrorLogFile(this.options);
            },

            render: function() {
                this.model.fetch({
                    contentType: "application/json;charset=UTF-8",
                    success: _.bind(this._finalizeRender, this)
                });
                return this;
            },

            _finalizeRender: function() {
                this.$el.html(this.template(this._json()));
                this.$('#modalFooter').html(footerTemplate(this.model));
                this.$('#logModal').modal(this.options.modalOptions);
            }
        });

        return AnalysisErrorLogFileModalView;

    }
);