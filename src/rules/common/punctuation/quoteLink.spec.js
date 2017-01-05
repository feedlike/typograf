tests.push(['common/punctuation/quoteLink', [
        [
            '<a href="/">«Название»</a>\n<a\nhref="/">«Название\n2»</a>',
            '«<a href="/">Название</a>»\n«<a\nhref="/">Название\n2</a>»'
        ]
    ],
    {lang: 'ru'}
]);

tests.push(['common/punctuation/quoteLink', [
        [
            '<a href="/">“Name 1”</a>\n<a href="/">“Name 2”</a>',
            '“<a href="/">Name 1</a>”\n“<a href="/">Name 2</a>”'
        ]
    ],
    {lang: 'en'}
]);
