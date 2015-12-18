define(['igv',
        'views/common/baseModalView',
        'hb!templates/data/view-annotation-sources.html',
        'hb!templates/common/view-details-footer.html'],
function(
  igv,
	BaseModalView,
	bodyTemplate,
	footerTemplate) {
	'use strict';

	var AnnotationSourcesDetailsView = BaseModalView.extend({

		_options: function(){
			return {
				bodyTemplate: bodyTemplate,
				headerKey: 'annotation.sources.view.header',
				modalOptions : {
          backdrop: 'static',
          attentionAnimation: null,
          keyboard: false,
          show : true
        }
			}
		},

		initialize: function(options) {
			this.mode = options.mode;
			this.type = options.type;
			BaseModalView.prototype.initialize.call(this, options);
		},

		events: {
			'click a.view-igv': '_viewIGV'
		},

		delegateEvents: function() {
			BaseModalView.prototype.delegateEvents.apply(this, arguments);
      this.$el.on('hidden', _.bind(this.onHide, this));
    },

    render: function() {
    	BaseModalView.prototype.render.call(this);
        this.$('#modalFooter').html(footerTemplate({
        	closeKey: 'dialog.close',
        	cancelId: 'btnCloseDetails'
        }));
        return this;
    },

    _viewIGV: function(model){
      var data = this.model.toJSON();
      var resultId = this.options.resultId;
      this._getIgvApiToken(data,resultId);
    },

    _getIgvApiToken: function(data,resultId){
      var that = this;
      var port;
      var locus = data.locus;
      
      if(this.type === 'RNA'){
    	  locus = data.displayName;
    	  port = 60152;
      }

      $.ajax({
        type:"GET",
        url: "/ir/secure/api/v40/igvlaunchinfo?resultid="+resultId,
        success: function(res) {
          var token = res.token;
          var analysisDirectory = res.path;
          var url = res.uri;
          var sample = res.sample;
          igv.callIGV(locus, analysisDirectory, url, token, port, sample);
        }
      });
    }
	});
	return AnnotationSourcesDetailsView;
});
