(function() {

Typograf.rule({
    name: 'common/punctuation/quote',
    handler: function(text, commonSettings) {
        var locale = this._locale,
            localeSettings = commonSettings[locale];

        if (!localeSettings) { return text; }

        var lquote = localeSettings.lquote,
            rquote = localeSettings.rquote;

        text = this._setQuotes(text, localeSettings);
        if (locale === 'ru' && lquote === localeSettings.lquote2 && rquote === localeSettings.rquote2) {
            text = text
                // ««Энергия» Синергия» -> «Энергия» Синергия»
                .replace(new RegExp(lquote + lquote, 'g'), lquote)
                // «Энергия «Синергия»» -> «Энергия «Синергия»
                .replace(new RegExp(rquote + rquote, 'g'), rquote);
        }

        return text;
    },
    settings: {
        ru: {
            lquote: '«',
            rquote: '»',
            lquote2: '„',
            rquote2: '“',
            lquote3: '‚',
            rquote3: '‘'
        },
        en: {
            lquote: '“',
            rquote: '”',
            lquote2: '‘',
            rquote2: '’'
        }
    }
});

Typograf.prototype._setQuotes = function(text, settings) {
    var letters = this.data('l') + '\u0301\\d',
        privateLabel = Typograf._privateLabel,
        lquote = settings.lquote,
        rquote = settings.rquote,
        lquote2 = settings.lquote2,
        rquote2 = settings.rquote2,
        quotes = '[' + Typograf.data('common/quote') + ']',
        phrase = '[' + letters + ')!?.:;#*,…]*?',
        reL = new RegExp('"([' + letters + '])', 'gi'),
        reR = new RegExp('(' + phrase + ')"(' + phrase + ')', 'gi'),
        reQuotes = new RegExp(quotes, 'g'),
        reFirstQuote = new RegExp('^(\\s)?(' + quotes + ')', 'g'),
        reOpeningTag = new RegExp('(^|\\s)' + quotes + privateLabel, 'g'),
        reClosingTag = new RegExp(privateLabel + quotes + '([\\s!?.:;#*,]|$)', 'g'),
        count = 0,
        symbols = this.data('lLd');

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

    if (lquote2 && rquote2 && count % 2 === 0) {
        text = this._setInnerQuotes(text, settings);
    }

    // Restore incorrect quotes.
    return text.replace(new RegExp(Typograf._privateQuote, 'g'), '"');
};

Typograf.prototype._setInnerQuotes = function(text, settings) {
    var openingQuotes = [settings.lquote],
        closingQuotes = [settings.rquote];

    if (settings.lquote2 && settings.rquote2) {
        openingQuotes.push(settings.lquote2);
        closingQuotes.push(settings.rquote2);

        if (settings.lquote3 && settings.rquote3) {
            openingQuotes.push(settings.lquote3);
            closingQuotes.push(settings.rquote3);
        }
    }

    var lquote = settings.lquote,
        rquote = settings.rquote,
        bufText = new Array(text.length),
        privateQuote = Typograf._privateQuote,
        minLevel = -1,
        maxLevel = openingQuotes.length - 1,
        level = minLevel;

    for (var i = 0, len = text.length; i < len; i++) {
        var letter = text[i];

        if (letter === lquote) {
            level++;
            if (level > maxLevel) {
                level = maxLevel;
            }
            bufText.push(openingQuotes[level]);
        } else if (letter === rquote) {
            if (level <= minLevel) {
                level = 0;
                bufText.push(openingQuotes[level]);
            } else {
                bufText.push(closingQuotes[level]);
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

})();
