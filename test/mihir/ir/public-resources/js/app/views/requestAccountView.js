/*global define:false*/
/*global Recaptcha:false*/
define(['jquery', 'underscore', 'backbone', 'views/templateView', 'models/requestAccount',
        'views/errorsView',
        'views/common/bannersView',
        'models/configuration',
        'hb!templates/request-account.html',
        'hb!templates/options.html']
        .concat('bootstrap.modal', 'bootstrap.modalmanager'),
function($, _, Backbone, TemplateView, RequestAccount, ErrorsView, BannerView, Configuration,
        RequestAccountTemplate, OptionsTemplate) {
    'use strict';
    
    // Create an object from the form data.
    var serializeObject = function(model, form) {
        var formObject = {};
        var formArray = form.serializeArray();
        $.each(formArray, function() {
            if (formObject[this.name] !== undefined) {
                if (!formObject[this.name].push) {
                    formObject[this.name] = [formObject[this.name]];
                }
                formObject[this.name].push(this.value || null);
            } else {
                var val = $.trim(this.value) || null;
                formObject[this.name] = val;
                model.set(this.name, val);
            }
        });
        return formObject;
    };
    
    var RequestAccountView = TemplateView.extend({

        template: RequestAccountTemplate,

        events: {
            'click #request-account-btn-save': 'onSubmit'
        },
        
        initialize: function() {
            this.$el.addClass('modal');
            this.model = new RequestAccount();
        },
    
        onSubmit: function() {
            var self = this,
                data = serializeObject(this.model, this.$('form'));
            this.errorsView.clearFormErrors(self);
            this.errorsView.clear();
            if (!this.model.isValid()) {
                this.errorsView.showErrorsByKeys('Validation errors', _.pluck(this.model.validationError, 'code'));
                this.errorsView.updateFormErrors(this, {
                    allErrors: this.model.validationError
                });
                return;
            }
            this.model.requestAccount(data,
                //success
                function() {
                    new BannerView({
                        id: 'request-account-success',
                        container: $('.banner>.container'),
                        style: 'success',
                        titleKey: 'request.account.success'
                    }).render();
                    self.$el.modal('hide');
                },
                // error
                function(response) {
                    var error = JSON.parse(response.responseText);
                    self.errorsView.showError(self.model, response);
                    self.errorsView.updateFormErrors(self, error.errors);
                    Recaptcha.reload();
                });
        },
        
        render: function() {
            TemplateView.prototype.render.apply(this, arguments);
            this.errorsView = new ErrorsView({
                el: this.$('#errors'),
                model: this.model
            });
            this.renderCountries();
            this.$el.modal({
                width: 540,
                backdrop: 'static',
                attentionAnimation: null,
                keyboard: false,
                show : true
            });
            this.renderRecaptcha();

            // enable tooltips...
            this.$("[data-toggle='popover']").popover();

            return this;
        },
        
        renderRecaptcha: function() {
            var pubKey = Configuration.get('recaptcha.publicKey');
            Recaptcha.create(pubKey, 'recaptcha', {
                theme: 'blackglass'
            });
        },
        
        renderCountries: function() {
            var self = this;
            this.model.getCountries(function(response) {
                self.$('#organizationCountry').html(OptionsTemplate(response.countries));
                self.$('#organizationCountry').val(response.defaultCountry.name);
            });
        }
    });
    return RequestAccountView;
});