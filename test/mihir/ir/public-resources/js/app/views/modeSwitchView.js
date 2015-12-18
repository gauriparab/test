/*global define:false, window:false */
define(['jquery',
    'underscore',
    'backbone',
    'views/common/confirmModalView', 'hb!templates/mode-switch-view.html'
].concat('bootstrap.modal', 'bootstrap.modalmanager'), function ($, _, Backbone, ConfirmModalView, Template) {

    'use strict';

    var ModeSwitchView = Backbone.View.extend({
        initialize: function (options) {
        	this.done = options.done;
        	this.message = options.message;
        	if(!this.done){
        		this.thisMode = options.thisMode;
            	this.nextMode = options.nextMode;
        	}
            _.bindAll(this, 'showPopup', 'cancel');
        },
        
        events: {
        	'click button': '_buttonClicked'
        },
        
        showPopup: function (accept) {
        	var that=this;
            ConfirmModalView.open(accept, {
                headerKey:  'mode.switch.title',
                confirmKey: 'confirm.ok',
                cancelKey:  'confirm.cancel',
                confirmClass: 'btn-primary',
                confirmId: 'btn-confirm',
                cancelId: 'mode-cancel',
                template : Template,
                thisMode:that.thisMode,
                nextMode:that.nextMode,
                done:!that.done,
                message:that.message,
                modalOptions : {
                    width: 600,
                    maxHeight: 350,
                    backdrop: 'static',
                    attentionAnimation: null,
                    keyboard: false,
                    show : true
                }
            }, ConfirmModalView);
            this.render();
            return this;
        },
        
        render: function(){
        	var that = this;
        	$('#mode-cancel').on('click',function(){
        		that.cancel();
        	});
        },
        
        _buttonClicked: function(){
        	console.log('Button Clicked');
        },
        
        pingServer: function() {
        	window.location='/ir/'
        },

        cancel: function () {
            window.location.href = '/';
        }
    });

    return ModeSwitchView;
});
