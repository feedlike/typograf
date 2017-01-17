Typograf.rule({
    name: 'common/punctuation/quote',
    handler: function(text, commonSettings) {
        var locale = this._locale,
            localeSettings = commonSettings[locale];

        if (!localeSettings) { return text; }

        var lquote = localeSettings.left[0],
            rquote = localeSettings.right[0],
            lquote2 = localeSettings.left[1] || lquote;

        text = this._setQuotes(text, localeSettings);
        if (localeSettings.removeDuplicateQuotes && lquote === lquote2) {
            text = text
                // ««Энергия» Синергия» -> «Энергия» Синергия»
                .replace(new RegExp(lquote + lquote, 'g'), lquote)
                // «Энергия «Синергия»» -> «Энергия «Синергия»
                .replace(new RegExp(rquote + rquote, 'g'), rquote);
        }

        return text;
    },
    settings: function() {
        var settings = {};

        Typograf.getLocales().forEach(function(locale) {
            settings[locale] = Typograf.deepCopy(Typograf.data(locale + '/quote'));
        });

        return settings;
    }
});

Typograf.prototype._setQuotes = function(text, settings) {
    var ch = this.data('char'),
        CH = ch.toUpperCase(),
        letters = ch + '\u0301\\d',
        privateLabel = Typograf._privateLabel,
        lquote = settings.left[0],
        rquote = settings.right[0],
        lquote2 = settings.left[1] || lquote,
        quotes = '[' + Typograf.data('common/quote') + ']',
        phrase = '[' + letters + ')!?.:;#*,…]*?',
        reL = new RegExp('"([' + letters + '])', 'gi'),
        reR = new RegExp('(' + phrase + ')"(' + phrase + ')', 'gi'),
        reQuotes = new RegExp(quotes, 'g'),
        reFirstQuote = new RegExp('^(\\s)?(' + quotes + ')', 'g'),
        reOpeningTag = new RegExp('(^|\\s)' + quotes + privateLabel, 'g'),
        reClosingTag = new RegExp(privateLabel + quotes + '([\\s!?.:;#*,]|$)', 'g'),
        count = 0,
        symbols = ch + CH + '\\d';

    text = text
        // Hide incorrect quotes.
        .replace(new RegExp('([' + symbols + '])"(?=[' + symbols + '])', 'g'), '$1' + Typograf._privateQuote)
        .replace(reQuotes, function() {
            count++;
            return '"';
        })
        .replace(reL, lquote + '$1') // Opening quote
        .replace(reR, '$1' + rquote + '$2') // Closing quote
        .replace(reOpeningTag, '$1' + lquote + privateLabel) // Opening quote and tag
        .replace(reClosingTag, privateLabel + rquote + '$1') // Tag and closing quote
        .replace(reFirstQuote, '$1' + lquote);

    if (lquote !== lquote2 && count % 2 === 0) {
        text = this._setInnerQuotes(text, settings);
    }

    // Restore incorrect quotes.
    return text.replace(new RegExp(Typograf._privateQuote, 'g'), '"');
};

Typograf.prototype._setInnerQuotes = function(text, settings) {
    var leftQuotes = [],
        rightQuotes = [];

    for (var k = 0; k < settings.left.length; k++) {
        leftQuotes.push(settings.left[k]);
        rightQuotes.push(settings.right[k]);
    }

    var lquote = settings.left[0],
        rquote = settings.right[0],
        bufText = new Array(text.length),
        privateQuote = Typograf._privateQuote,
        minLevel = -1,
        maxLevel = leftQuotes.length - 1,
        level = minLevel;

    for (var i = 0, len = text.length; i < len; i++) {
        var letter = text[i];

        if (letter === lquote) {
            level++;
            if (level > maxLevel) {
                level = maxLevel;
            }
            bufText.push(leftQuotes[level]);
        } else if (letter === rquote) {
            if (level <= minLevel) {
                level = 0;
                bufText.push(leftQuotes[level]);
            } else {
                bufText.push(rightQuotes[level]);
                level--;
                if (level < minLevel) {
                    level = minLevel;
                }
            }
        } else {
            if (letter === privateQuote) {
                level = minLevel;
            }

            bufText.push(letter);
        }
    }

    return bufText.join('');
};
