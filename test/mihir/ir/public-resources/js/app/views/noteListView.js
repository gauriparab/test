define(['jquery',
        'backbone',
        'collections/notes',
        'hb!templates/note-list-view.html'], 
    function($,
    		Backbone,
    		Notes,
    		template){
	
	var NoteListView = Backbone.View.extend({
		
		initialize: function(options){
			this.collection  = new Notes(options);
		},
		
		render: function(){
			var self = this;
			this.collection.fetch().done(function(){
				self.$el.html(template({
					notes: self.collection.toJSON()
				}));
			});
		}
		
	});
	return NoteListView;
});