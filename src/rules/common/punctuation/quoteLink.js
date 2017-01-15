Typograf.rule({
    name: 'common/punctuation/quoteLink',
    queue: 'show-safe-tags-html',
    handler: function(text) {
        var quotes = this.setting('common/punctuation/quote', this._locale);

        if (!quotes) { return text; }
        var entities = Typograf.HtmlEntities,
            lquote = entities.getByUtf(quotes.lquote),
            rquote = entities.getByUtf(quotes.rquote),
            lquote2 = entities.getByUtf(quotes.lquote2),
            rquote2 = entities.getByUtf(quotes.rquote2);

        lquote2 = lquote2 ? ('|' + lquote2) : '';
        rquote2 = rquote2 ? ('|' + rquote2) : '';

        var re = new RegExp('(<[aA]\\s[^>]*?>)(' + lquote + lquote2 + ')([^]*?)(' + rquote + rquote2 + ')(</[aA]>)', 'g');

        return text.replace(re, '$2$1$3$5$4');
    }
});
