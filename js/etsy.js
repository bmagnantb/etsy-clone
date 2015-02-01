;
(function() {

    function Etsy() {
        this.recentItems = [];
        this.apiKey = '&callback=?&api_key=6990q3hh09orsy6z1x0ghq2q';
        this.apiUrlStart = 'https://openapi.etsy.com/v2/';
        this.prevQuery = '';



        var self = this;
        var EtsyRouter = Backbone.Router.extend({
            routes: {
                '': 'index',
                ':listing': 'details',
                'search/:query': 'drawSearch'
            },

            index: function() {
                self.drawListings(self.urls.interesting, self.templates.listings, '.items');
            },

            drawSearch: function(query) {
                console.log(query.indexOf(' '));
                // if (query.indexOf(' ') > -1) {
                //     query = [].map.call(query, function(val) {
                //         if (val === ' ') {
                //             console.log('mapping');
                //             val = '%20';
                //         }
                //         console.log(val);
                //         return val;
                //     });
                query = query.replace(/ /g, '%20');
                document.location.hash = query;
                self.drawSearch(self.urls.search, self.templates.listings, '.items', query);
            },

            details: function(query, page) {

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
            interesting: 'listings/interesting.js?includes=Images',
            search: 'listings/active.js?includes=Images&keywords='

        },

        templates: {
            listings: './templates/items.html'
        },

        data: function(url, query) {
            var self = this;
            var x = $.Deferred();
            if (this.recentItems.length > 0) {
                console.log('no download!');
                x.resolve(this.recentItems);
            } else {
                console.log(url + ' before download');
                console.log('download');
                console.log(url);
                $.getJSON(this.makeUrl(this.apiUrlStart, this.apiKey, url, query)).then(function(a) {
                    var y = a.results;
                    x.resolve(y);
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

        draw: function(data, template, selector) {
            console.log(data);
            console.log(template);
            template = _.template(template);
            document.querySelector('.items').innerHTML = template({
                data: data
            });
        },

        events: function() {
            $('#search').on('keydown', function(e) {
                if (e.keyCode === 13 && this.value !== '') {
                    window.location.hash = 'search/' + this.value;
                    this.value = '';
                }
            });
        },

        makeUrl: function(api, key, uri, query) {
            query = (typeof query === 'undefined') ? '' : query;
            console.log(api + uri + query + key);
            return api + uri + query + key;
        },

        drawListings: function(url, templateFile, selector) {
            var self = this;
            $.when(
                this.data(url),
                this.template(templateFile)
            ).then(function(data, template) {
                self.draw(data, template, selector)
            }).then(function(data) {
                document.querySelector('.items').style.opacity = 1;
            });
        },

        drawSearch: function(url, templateFile, selector, query) {
            document.querySelector('.items').style.opacity = 0;

            var self = this;
            this.recentItems = [];
            $.when(
                this.data(url, query),
                this.template(templateFile)
            ).then(function(data, template) {
                self.draw(data, template, selector)
            }).then(function(data) {
                document.querySelector('.items').style.opacity = 1;
            });
        },

        details: function() {

        },

    }

    window.Etsy = Etsy;

})();
