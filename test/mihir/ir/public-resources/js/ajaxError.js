/* global define:false*/
define(['jquery', 'underscore', 'views/common/bannersView' ],

    function($, _, BannerView) {
        'use strict';

        function showGlobalError(jqxhr) {

            var ajaxError;
            var title;
	    var messages;
            try {
                ajaxError = JSON.parse(jqxhr.responseText);

                // handle eula on ajax response
                if (ajaxError.type === "com.lifetech.ionreporter.mgc.services.exceptions.EulaNotAcceptedException") {
                    window.location = "/ir/eula-error.html";
                }

                // redirect csrf exceptions
                if (ajaxError.type === 'com.lifetech.ionreporter.web.exception.CsrfSecurityException') {
                    window.location = '/ir/csrf.html';
                }

                //title="";
                if (ajaxError.localizedError) {
                    title = '<strong>' + ajaxError.localizedError.code.errorCode + '</strong> ' +
                            ajaxError.localizedError.errorMessage + '<br/>' +
                            ajaxError.localizedError.correctiveActionMessage;
                } else {
		    if(ajaxError.message) {
                        title = ajaxError.message ;
		    } else if(ajaxError.errors) {
			var list = [];
			var keys = _.keys(ajaxError.errors);
			if(keys[0] === "rdxObject") {
			    _.each(ajaxError.errors, function(obj) {
			        _.each(obj, function(msgObj) {
				    list.push(msgObj.message);
			        });
			    });
			    messages = {};
                            messages.list = list;
			} else {
			    _.each(keys, function(key) {
				var temp = {};
				temp.title = key;
				var msgList = [];
				_.each(ajaxError.errors[key], function(obj) {
				    msgList.push(obj.message);
				}); 
				temp.list = msgList;
				list.push(temp);
			    });
			    messages = {};
                            messages.list = list;
			    messages.categorize = true;
			}
		    }
                }
            } catch (error) {
                title = '<strong>' + jqxhr.status + '</strong> ' + jqxhr.statusText;
            }

            var container;
            if ($('.modal').hasClass('in')) {
                container = $(".modal.in > .modal-body:last");
            } else {
                container = $(".main .container-fluid:first");
            }

            var bannerView = new BannerView({
                id: 'ajaxerror',
                container: container,
                static: true,
                style: 'error',
                title: title,
				messages: messages
            });

            bannerView.render();
        }

        return {
            showGlobalError: showGlobalError
        };
    });
