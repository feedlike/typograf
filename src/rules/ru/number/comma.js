Typograf.rule({
    name: 'ru/number/comma',
    handler: function(text) {
        // \u00A0 - NO-BREAK SPACE
        // \u2009 - THIN SPACE
        // \u202F - NARROW NO-BREAK SPACE
        return text.replace(/(^|\s)(\d+)\.(\d+[\u00A0\u2009\u202F ]*?[%‰°×x])/gim, '$1$2,$3');
    }
});
