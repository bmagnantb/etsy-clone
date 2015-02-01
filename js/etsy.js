;
(function() {

    function Etsy() {
        this.recentItems = [];
        this.apiKey = 'callback=?&api_key=6990q3hh09orsy6z1x0ghq2q';
        this.apiUrlStart = 'https://openapi.etsy.com/v2/';



        var self = this;
        var EtsyRouter = Backbone.Router.extend({
            routes: {
                '': 'index',
                ':listing': 'details',
                'search/:query': 'search'
            },

            index: function() {
                self.drawListings(self.urls.interesting, self.templates.listings);
            },

            search: function() {
                self.search();
            },

            details: function(query, page) {
                document.querySelector('.items').innerHTML = '';
            },

            initialize: function() {
                Backbone.history.start();
            }
        })
        var etsyRouter = new EtsyRouter();

        this.events();
    }

    Etsy.prototype = {
        urls: {
            interesting: 'listings/interesting.js?includes=Images&'

        },

        templates: {
            listings: './templates/items.html'
        },

        events: function() {
            $('#search').on('keydown', function(e) {
              if(e.keyCode === 13 && this.value !== '') {
              	window.location.hash = 'search/'+this.value;
              	this.value = '';
              }
            });
        },

        makeUrl: function(api, key, uri) {
            return api + uri + key;
        },

        drawListings: function(url, templateFile) {
            var self = this;
            $.when(
                this.data(url),
                this.template(templateFile)
            ).then(function(data, template) {
                console.log(data, template);
                template = _.template(template);
                document.querySelector('.items').innerHTML = template({
                    data: data
                });
            }).then(function(data) {
                document.querySelector('.items').style.opacity = 1;
            })
        },

        data: function(url) {
            var self = this;
            var x = $.Deferred();
            if (this.recentItems.length > 0) {
                console.log('no download!');
                x.resolve(this.recentItems);
            } else {
                console.log('download');
                $.getJSON(this.makeUrl(this.apiUrlStart, this.apiKey, url)).then(function(a) {
                    var y = a.results;
                    x.resolve(y);
                    console.log(self);
                    self.recentItems = y;
                });
            }
            return x;
        },

        template: function(template) {
            return $.get(template).then(function(a) {
                return a;
            });
        },

        search: function() {

        },

        details: function() {

        }

    }

    window.Etsy = Etsy;

})();
