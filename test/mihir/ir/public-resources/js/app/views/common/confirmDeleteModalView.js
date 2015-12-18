/*global define:false */
define(['jquery', 'underscore', 'views/common/confirmModalView', 'hb!templates/common/confirm-delete.html'],
    function($, _, ConfirmModalView, template) {
        'use strict';

        /**
         * A delete confirmation dialog
         *
         * @type {*}
         */
        var ConfirmDeleteModalView = ConfirmModalView.extend({

            /**
             * The default options used in a delete confirmation dialog. The Default bodyTemplate just produces a 
             * container and displays the message (either looked up via confirmMessageKey or displayed in confirmMessage)
             * Alternatively, a different template can be provided either by extension or providing it within the options.
             */
            _options: {
                /**
                 * The Template to display inside the dialog.
                 */
                bodyTemplate: template,
                /**
                 * The message to display in the title bar
                 */
                headerKey: 'confirm.delete.title',
                /**
                 * You must override this or the confirmMessage when using the default template.
                 */
                confirmMessageKey: 'override.me',
                confirmMessage: '',
                cancelClass: 'btn-primary',
                confirmId: 'btn-confirm',
                modalOptions : {
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
            },
            
            initialize: function(options){
            	this.options.needsReason = options.needsReason;
            }
        });

        return ConfirmDeleteModalView;
    }
);
