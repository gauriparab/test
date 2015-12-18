/* global define:false */
define([ 'jquery', 'modules/browserWarning', 'views/requestAccountView', 'domready', 'utils/ajaxSendCsrfHandler', 'hb!templates/common/spinner.html'].concat('bootstrap'),
    function($, browserWarning, RequestAccountView, domReady, ajaxSendCsrfHandler, Spinner) {
    "use strict";

    var initialize = function() {
        domReady(function() {

            browserWarning.initialize();

            $('.dropdown-toggle').dropdown();
            
            $('#request-account').on('click', function(e) {
                e.preventDefault();
                new RequestAccountView().render();                
            });

            $(document).ajaxSend(ajaxSendCsrfHandler.ajaxSendCsrfHandler);
            
            if(window.location.hash === '#passwordReset') {
            	$('#resetSuccess').show();
				window.location.hash="";
            }
            
            if(window.location.hash === '#adminCreated') {
            	$('#adminCreated').show();
				window.location.hash="";
            }
            
            $('input#changePassword').off('click').on('click',function() {
              disableButton();
          	  $('#changePasswordSuccess').empty();
          	  $('#changePasswordError').empty();
          	  $.ajax({
          		  url: '/ir/user/triggerChangePasswd?username='+$('#forgot-password #forgotPasswordUsername').val(),
          		    type: 'GET',
          		    contentType: 'application/json',
          		    success: function(response) {
          		    	if(response === 'success'){
          		    		$('#changePasswordSuccess').html($.t('user.reset.password.message'));
          		    		enableButton();
          		    	} else {
          		    		$('#changePasswordError').html($.t('user.not.found.error.message'));
          		    		enableButton();
          		    	}
          		    },
          		    error: function() {
          		    	enableButton();
          		    }
          			
          	  });
          	  return false;
            });
            
            $('#fpCancel').off('click').on('click',function() {
            	  $('#forgot-password').css('display', 'none');
            	  $('.custom-error').css('display', 'none');
            	  $('.login-control').css('display', 'block');
            	  $('#forgotPassword').css('display', 'block');
            	  $('#changePasswordSuccess').empty();
            	  $('#changePasswordError').empty();
            	  return false;
            });

        });
    };
    
    var enableButton= function(){
		$("input#changePassword")
	        .removeClass('disabled')
	        .prop('disabled', false)
	        .removeAttr('title');
		$('#fpCancel')
	        .removeClass('disabled')
	        .prop('disabled', false)
	        .removeAttr('title');
		$('.icon-loader').remove();
	};
	
	var disableButton= function(){
		var changePasswordBtn = $("input#changePassword");
		var cancelChangePasswordBtn = $('#fpCancel')
		if (changePasswordBtn.hasClass('disabled')) {
			return false;
		}
		changePasswordBtn.addClass('disabled').prop('disabled', true);
		cancelChangePasswordBtn.addClass('disabled').prop('disabled', true);
		cancelChangePasswordBtn.after(Spinner());				
		changePasswordBtn.attr('title', $.t("sending.email.label"));
		cancelChangePasswordBtn.attr('title', $.t("sending.email.label"));
		return true;
	};
	
    return {
        initialize : initialize
    };

});
