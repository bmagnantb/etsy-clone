;
(function() {

    function Etsy() {
        this.recentItems = [];
        this.apiKey = '&callback=?&api_key=6990q3hh09orsy6z1x0ghq2q';
        this.apiUrlStart = 'https://openapi.etsy.com/v2/';
        this.prevQuery = '';
        this.prevDetail = [];



        var self = this;
        var EtsyRouter = Backbone.Router.extend({
            routes: {
                '': 'index',
                ':listing': 'details',
                'search/:query': 'drawSearch'
            },

            index: function() {
                document.querySelector('main').style.overflow = 'hidden';
                document.querySelector('.details').style.top = '100%';
                self.drawListings(self.urls.interesting, self.templates.listings, '.items');
            },

            drawSearch: function(query) {
                document.querySelector('main').style.overflow = 'hidden';
                document.querySelector('.details').style.top = '100%';
                query = query.replace(/ /g, '%20');
                document.location.hash = 'search/' + query;
                self.drawSearch(self.urls.search, self.templates.listings, '.items', query);
            },

            details: function(listing) {
                document.querySelector('.details').style.opacity = '1';
                self.drawDetails(listing, self.templates.details, '.details');
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
            listings: './templates/items.html',
            details: './templates/details.html'
        },

        data: function(url, query) {
            var self = this;
            var x = $.Deferred();
            if (this.recentItems.length > 0) {
                console.log('no download!');
                x.resolve(this.recentItems);
            } else {
                console.log('download');
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
        	console.log(arguments);
            template = _.template(template);
            document.querySelector(selector).innerHTML = template({
                'data': data
            });
        },

        events: function() {
        	var self = this;
            $('#search').on('keydown', function(e) {
                if (e.keyCode === 13 && this.value !== '') {
                    window.location.hash = 'search/' + this.value;
                    this.value = '';
                }
            });
            $('body').on('click', function(e) {
                if ($(e.target).closest('.details').length === 0 && $(e.target).closest('header').length === 0) {
                		document.location.hash = '';
                }
            });
        },

        makeUrl: function(api, key, uri, query) {
            query = (typeof query === 'undefined') ? '' : query;
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
                document.querySelector(selector).style.opacity = 1;
            });
        },

        drawSearch: function(url, templateFile, selector, query) {
            document.querySelector(selector).style.opacity = 0;
            if (query !== this.prevQuery) {
                this.recentItems = [];
            }
            this.prevQuery = query;
            var self = this;
            $.when(
                this.data(url, query),
                this.template(templateFile)
            ).then(function(data, template) {
                self.draw(data, template, selector)
            }).then(function(data) {
                document.querySelector(selector).style.opacity = 1;
            });
        },

        detailsData: function(listing) {
            return $.getJSON(this.makeUrl(this.apiUrlStart, this.apiKey, '/listings/' + listing + '.js?includes=Images')).then(function(a) {
                return a.results
            });
        },

        drawDetails: function(listing, templateFile, selector) {
            var self = this;
            var x = $.Deferred();
            var item = this.recentItems.filter(function(val) {
                return val.listing_id.toString() === listing;
            });
            var prev = this.prevDetail.filter(function(val) {
                return val.listing_id.toString() === listing;
            });
            if (item.length > 0) {
                $.when(this.template(templateFile)).then(function(templateFile) {
                    self.draw(item[0], templateFile, selector);
                    x.resolve();
                });
            } else if (prev.length > 0) {
                $.when(this.template(templateFile)).then(function(templateFile) {
                    self.draw(prev[0], templateFile, selector);
                    x.resolve();
                });
            } else {
                $.when(
                    this.detailsData(listing),
                    this.template(templateFile)
                ).then(function(data, templateFile) {
                    self.draw(data[0], templateFile, selector);
                    self.prevDetail.push(data[0]);
                    console.log(self.prevDetail);
                }).then(function() {
                    x.resolve();
                })
            }
            $.when(x).then(function() {
                document.querySelector('.items').style.opacity = '.3';
                var links = document.querySelectorAll('.items a');
                if (links.length > 0) {
                    [].forEach.call(links, function(val) {
                    	val.className = 'linkoff';
                    	val.onclick = function(e) {
                    		e.preventDefault();
                    	}
                    });
                }
                document.querySelector(selector).style.top = '6.5em';
            });
        },

    }

    window.Etsy = Etsy;

})();
