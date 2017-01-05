Typograf.rule({
    name: 'common/punctuation/quoteLink',
    queue: 'show-safe-tags-html',
    handler: function(text) {
        var quotes = this.setting('common/punctuation/quote', this._lang),
            re = new RegExp('(<a\\s[^>]*?>)(' + quotes.lquote1 + ')([^]*?)(' + quotes.rquote1 + ')(</a>)', 'gi');

        return text.replace(re, '$2$1$3$5$4');
    }
});
