;
(function() {
    var Router = Backbone.Router.extend({

        initialize: function() {
        	window.etsy = new Etsy();
            Backbone.history.start();
        }

    });

    window.Router = Router;
})();
