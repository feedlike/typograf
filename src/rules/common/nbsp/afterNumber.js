Typograf.rule({
    name: 'common/nbsp/afterNumber',
    handler: function(text) {
        var re = '(^|\\D)(\\d{1,5}) ([' +
            this.data('char') +
            ']{2,})';

        return text.replace(new RegExp(re, 'gi'), '$1$2\u00A0$3');
    },
    disabled: true
});
