Typograf.rule({
    title: 'Неразрывный пробел после короткого слова',
    name: 'nbsp/afterShortWord',
    sortIndex: 590,
    func: function(text, settings) {
        var len = settings.lengthShortWord,
        re = new RegExp('( [а-яёА-ЯЁ\\w]{1,' + len + '}) ', 'g');

        return text.replace(re, '$1\u00A0');
    },
    settings: {
        lengthShortWord: 2
    }
});
