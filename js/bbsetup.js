;
(function() {
    var Router = Backbone.Router.extend({

        routes: {
            '': 'index',
            ':listing': 'details'
        },

        index: function() {
        },

        details: function(query, page) {
            etsy.drawDetails();
        },

        initialize: function() {
            Backbone.history.start();
            window.etsy = new Etsy();
        }

    });

    window.Router = Router;
})();
