Typograf.rule({
    name: 'common/space/beforeBracket',
    handler: function(text) {
        var re = new RegExp('([' + this.data('char') + '.!?,;…)])\\(', 'gi');
        return text.replace(re, '$1 (');
    }
});
