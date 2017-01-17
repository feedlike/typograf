(function() {

var classNames = [
        'typograf-oa-lquote',
        'typograf-oa-n-lquote',
        'typograf-oa-sp-lquote'
    ],
    name = 'ru/optalign/quote';

Typograf.rule({
    name: name,
    handler: function(text) {
        var quote = this.setting('common/punctuation/quote', 'ru'),
            lquotes = '([' + quote.left[0] + (quote.left[1] || '') + '])',
            reNewLine = new RegExp('(^|\n\n|' + Typograf._privateLabel + ')(' + lquotes + ')', 'g'),
            reInside = new RegExp('([^\n' + Typograf._privateLabel + '])([ \u00A0\n])(' + lquotes + ')', 'gi');

        return text
            .replace(reNewLine, '$1<span class="typograf-oa-n-lquote">$2</span>')
            .replace(reInside, '$1<span class="typograf-oa-sp-lquote">$2</span><span class="typograf-oa-lquote">$3</span>');
    },
    disabled: true
}).innerRule({
    name: name,
    queue: 'start',
    handler: function(text) {
        return Typograf._removeOptAlignTags(text, classNames);
    }
}).innerRule({
    name: name,
    queue: 'end',
    handler: function(text) {
        return Typograf._removeOptAlignTagsFromTitle(text, classNames);
    }
});

})();
