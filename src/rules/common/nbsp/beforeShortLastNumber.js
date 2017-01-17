Typograf.rule({
    name: 'common/nbsp/beforeShortLastNumber',
    handler: function(text, settings) {
        var ch = this.data('char'),
            CH = ch.toUpperCase(),
            re = new RegExp('([' + ch + CH +
            ']) (?=\\d{1,' + settings.lengthLastNumber +
            '}[-+−%\'"' + this.data('quote').right + ']?([.!?…]( [' +
            CH + ']|$)|$))', 'gm');

        return text.replace(re, '$1\u00A0');
    },
    live: false,
    settings: {
        lengthLastNumber: 2
    }
});
