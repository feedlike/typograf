tests.push(['common/punctuation/quoteLink', [
    [
        '<a href="/">«Название»</a>',
        '«<a href="/">Название</a>»',
        'ru'
    ],
    [
        '<a href="/">«Name 1»</a>\n<a href="/">«Name 2»</a>',
        '«<a href="/">Name 1</a>»\n«<a href="/">Name 2</a>»',
        'en'
    ]
]]);
