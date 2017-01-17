Typograf.addLocale = function(str) {
    var code = (str || '').split('/')[0];
    if (code && code !== 'common' && !Typograf.hasLocale(code)) {
        Typograf._locales.push(code);
        Typograf._locales.sort();
    }
};

Typograf.getLocales = function() {
    return Typograf._locales;
};

Typograf.hasLocale = function(locale) {
    return Typograf._locales.indexOf(locale) !== -1;
};

Typograf._locales = [];
