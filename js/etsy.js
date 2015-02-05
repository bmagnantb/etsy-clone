;
(function() {

    function Etsy() {
        this.recentItems = [];
        this.apiKey = '&callback=?&api_key=6990q3hh09orsy6z1x0ghq2q';
        this.apiUrlStart = 'https://openapi.etsy.com/v2/';
        this.fromSearch = '';
        this.prevQuery = '';
        this.prevDetail = [];
        this.listingArrows = 0;
        this.hashRecent = '';
        this.noresults = '<div class="noresults"><h2>Search does not match any items.</h2></div>';



        var self = this;
        var EtsyRouter = Backbone.Router.extend({
            routes: {
                '': 'index',
                ':listing': 'details',
                'search/:query': 'drawSearch'
            },

            index: function() {
                self.listingAnim();
                self.hashRecent = document.location.hash;
                self.drawListings(self.urls.active, self.templates.listings, '.items');
            },

            drawSearch: function(query) {
                self.listingAnim();
                query = query.replace(/ /g, '%20');
                document.location.hash = 'search/' + query;
                self.hashRecent = document.location.hash;
                self.fromSearch = true;
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
            active: 'listings/active.js?includes=Images',
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
                x.resolve(this.recentItems);
            } else {
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
            template = _.template(template);
            document.querySelector(selector).innerHTML = template({
                data: data
            });
        },

        makeUrl: function(api, key, uri, query) {
            query = (typeof query === 'undefined') ? '' : query;
            return api + uri + query + key;
        },

        drawListings: function(url, templateFile, selector) {
            var self = this;
            if (this.fromSearch) {
                this.recentItems = [];
                document.querySelector('.items').style.opacity = 0;
            }
            $.when(
                this.data(url),
                this.template(templateFile)
            ).then(function(data, template) {
                self.draw(data, template, selector)
            }).then(function(data) {
                self.listingAnim2(selector);
                self.fromSearch = false;
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
                if (data.length > 0) {
                    self.draw(data, template, selector)
                } else {
                    document.querySelector(selector).innerHTML = self.noresults;
                }
            }).then(function(data) {
                self.listingAnim2(selector);
                self.fromSearch = true;
            });
        },

        listingAnim: function() {
            if (document.querySelector('.details > .arrows')) {
                document.querySelector('.details > .arrows').style.display = 'none';
            }
            document.querySelector('.details').style.top = '100%';
            document.querySelector('main').style.overflow = 'hidden';
        },

        listingAnim2: function(selector) {
            document.querySelector(selector).style.opacity = 1;
            this.listingArrows = 'inline-block';
        },

        dataDetails: function(listing, item) {
            var x = $.Deferred();
            if (item.length === 0) {
                $.getJSON(this.makeUrl(this.apiUrlStart, this.apiKey, '/listings/' + listing + '.js?includes=Images')).then(function(a) {
                    x.resolve(a.results[0]);
                });
            } else {
                x.resolve(item[0]);
            }
            return x;
        },

        drawDetails: function(listing, templateFile, selector) {
            var self = this;
            var x = $.Deferred();
            var recent = this.recentItems.filter(function(val) {
                return val.listing_id.toString() === listing;
            });
            var prev = this.prevDetail.filter(function(val) {
                return val.listing_id.toString() === listing;
            });

            var item = (recent.length > 0) ? recent : (prev.length > 0) ? prev : '';

            $.when(
                self.dataDetails(listing, item),
                self.template(templateFile)
            ).then(function(item, templateFile) {
                self.draw(item, templateFile, selector);
                self.prevDetail.unshift(item);
                x.resolve();
            });

            $.when(x).then(function() {
                self.arrowDisplay(listing);
                self.disableLinks();

                document.querySelector('.items').style.opacity = '.3';
                document.querySelector(selector).style.top = '6.5em';
            });
        },

        arrowDisplay: function(listing) {
            var arrowLeft = document.querySelector('.details > .arrows > .left');
            var arrowRight = document.querySelector('.details > .arrows > .right');
            if (this.recentItems.length > 0) {
                if (listing === this.recentItems[0].listing_id.toString()) {
                    arrowRight.style.display = this.listingArrows;
                    arrowLeft.style.pointerEvents = 'none';
                } else if (listing === this.recentItems[this.recentItems.length - 1].listing_id.toString()) {
                    arrowLeft.style.display = this.listingArrows;
                    arrowRight.style.pointerEvents = 'none';
                } else {
                    arrowLeft.style.display = this.listingArrows;
                    arrowRight.style.display = this.listingArrows;
                }
            }
        },

        disableLinks: function() {
            var links = document.querySelectorAll('.items a');
            if (links.length > 0) {
                [].forEach.call(links, function(val) {
                    val.className = 'linkoff';
                    val.onclick = function(e) {
                        e.preventDefault();
                    }
                });
            }
        },

        events: function() {
            $('#search').on('keydown', function(e) {
                if (e.keyCode === 13 && this.value !== '') {
                    window.location.hash = 'search/' + this.value;
                    this.value = '';
                }
            });
            $('body').on('mousedown', this.closeDetails.bind(this));
            $('.details').on('mousedown', ' > .close', this.closeDetails.bind(this));
            $('body').on('keydown', this.closeDetails.bind(this));
            $('.details').on('mousedown', ' > .arrows > .left', this.detailLeft.bind(this));
            $('.details').on('mousedown', ' > .arrows > .right', this.detailRight.bind(this));
            $('body').on('keydown', this.detailLeft.bind(this));
            $('body').on('keydown', this.detailRight.bind(this));
        },

        closeDetails: function(e) {

            var testA = $(e.target).closest('.details').length === 0 && $(e.target).closest('header').length === 0 && e.type === 'mousedown';
            var testB = e.type === 'mousedown' && e.target === document.querySelector('.close');
            if (testA || testB || e.keyCode === 27) {
                document.location.hash = this.hashRecent;
            }
        },

        detailLeft: function(e) {
            var test = document.querySelector('.arrows') && e.keyCode === 37;
            if (e.type === 'mousedown' || test) {
                var currentIndex = this.recentItems.indexOf(this.prevDetail[0]);
                window.location.hash = this.recentItems[currentIndex - 1].listing_id;
                if (currentIndex === 1) {
                    document.querySelector('.details > .arrows > .left').style.opacity = '0';
                }
            }
        },

        detailRight: function(e) {
            var test = document.querySelector('.arrows') && e.keyCode === 39;
            if (e.type === 'mousedown' || test) {
                var currentIndex = this.recentItems.indexOf(this.prevDetail[0]);
                window.location.hash = this.recentItems[currentIndex + 1].listing_id;
                if (currentIndex === this.recentItems.length - 2) {
                    document.querySelector('.details > .arrows > .right').style.opacity = '0';
                }
            }
        }

    }

    window.Etsy = Etsy;

})();
