/*global define:false, window:false */
define(['jquery',
    'underscore',
    'backbone',
	'models/baseModel',	
    'views/common/confirmModalView', 'hb!templates/fse-popup.html'
].concat('bootstrap.modal', 'bootstrap.modalmanager'), function ($, _, Backbone, BaseModel, ConfirmModalView, FSETemplate) {

    'use strict';

    var FSEModalView = Backbone.View.extend({
        initialize: function () {
            _.bindAll(this, 'showPopup', 'authenticate', 'cancel');
			this.model = new BaseModel();
        },
        
        showPopup: function () {
        	var that = this;
            ConfirmModalView.open(this.authenticate, { 
                headerKey:  'login.fsePopup.authTitle',
                confirmKey: 'login.fsePopup.authButton',
                cancelKey:  'dialog.cancel',
                confirmClass: 'btn-primary',
                confirmId: 'btn-confirm',
                cancelId: 'btn-cancel',
                template : FSETemplate,
                modalOptions : {
                    width: 600,
                    maxHeight: 350,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
            }, ConfirmModalView);
            $('#modalFooter').on('click','#btn-cancel',function(){
            	that.cancel();
            });
            return this;
        },

        authenticate: function () {
			//this.model.url = '/ir/authenticateFseUserCode?userBarcode='+$("#serviceBadge").val()+'&userName="dfads"';
        	this.model.url = '/ir/authenticateFseUserCode';
			this.model.set('userBarcode',$("#serviceBadge").val());
			//this.model.set('userName','ionservice');
			this.model.save(null,{
				success: function(response){
					if(response.toJSON().status)
						window.location='/ir/secure/manage-samples.html';
					else 
						window.location='/ir/fseAuthFailed';
						
				}
			});
        },

        cancel: function () {
            window.location.href = "/ir/logout.html";
        }
    });

    return FSEModalView;
});
