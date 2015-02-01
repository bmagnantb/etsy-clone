;
(function() {

    function Etsy() {
        this.recentItems = [];
        this.timer = 0;
        this.counter = 0;
        this.draw();
    }

    Etsy.prototype = {
        urls: {
            // featuredItems: ,
        },

        throttleRequests: function(timer, counter) {



        },

        draw: function() {
            $.when(
                this.listings(),
                this.template()
            ).then(function(data, template) {
                console.log(data, template);
                template = _.template(template);
                document.querySelector('.items').innerHTML = template({
                    data: data
                });
            }).then(function(data){
            	document.querySelector('.items').style.opacity = 1;
            })
        },

        listings: function() {
            var self = this;
            return $.getJSON('https://openapi.etsy.com/v2/listings/active.js?includes=Images&callback=?&api_key=6990q3hh09orsy6z1x0ghq2q').then(function(a) {
                console.log(a);
                self.recentItems = a.results;
                return a.results;
            });
        },

        template: function() {

            return $.get('./templates/items.html').then(function(a) {
                return a;
            });

        }

    }

    window.Etsy = Etsy;

})();
