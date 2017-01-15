'use strict';

const assert = require('chai').assert;
const r = require('../build/rules');
const tests = r.tests;
const innerTests = r.innerTests;
const Typograf = require('../build/typograf');
const locale = 'ru';
const t = new Typograf({locale: locale});

let tmpSettings;

function pushSettings(ruleName, settings) {
    tmpSettings = {};

    Object.keys(settings).forEach(function(key) {
        tmpSettings[key] = t.setting(ruleName, key);
        t.setting(ruleName, key, settings[key]);
    });
}

function popSettings(ruleName) {
    Object.keys(tmpSettings).forEach(function(key) {
        t.setting(ruleName, key, tmpSettings[key]);
    });
}

function executeRule(name, text, props) {
    const rules = t._rules;

    t._locale = getLocale(name, props);
    rules.forEach(function(f) {
        if (f.name === name) {
            text = f.handler.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

function executeInnerRule(name, text) {
    const rules = t._innerRules;

    rules.forEach(function(f) {
        if (f.name === name) {
            text = f.handler.call(t, text, t._settings[f.name]);
        }
    });

    return text;
}

function getLocale(name, props) {
    return props ? props.locale : name.split(/\//)[0];
}

describe('inner rules', function() {
    innerTests.forEach(function(elem) {
        const [name, items] = elem;
        it(name, function() {
            items.forEach(function(item) {
                const [before, after] = item;

                t.enable(name);
                assert.equal(executeInnerRule(name, before), after, before + ' → ' + after);
            });
        });
    });
});

describe('rules', function() {
    tests.forEach(function(elem) {
        const [name, items, props] = elem;
        it(name, function() {
            items.forEach(function(item) {
                const [before, after] = item;
                const itTypograf = new Typograf({disable: '*', enable: name});

                const result = itTypograf.execute(before, {locale: getLocale(name, props)});
                assert.equal(result, after, before + ' → ' + after);
            });
        });
    });
});

describe('rules, double execute', function() {
    tests.forEach(function(elem) {
        const [name, items, props] = elem;
        it(name, function() {
            items.forEach(function(item) {
                const itTypograf = new Typograf({disable: '*', enable: name});
                const [before, after] = item;
                const locale = getLocale(name, props);

                let result = itTypograf.execute(before, {locale: locale});
                assert.equal(result, after, before + ' → ' + after);

                if (!itTypograf._getRule(name).disabled) {
                    result = itTypograf.execute(result, {locale: locale});
                    assert.equal(result, after, before + ' → ' + after);
                }
            });
        });
    });
});

describe('common specific tests', function() {
    function check(data) {
        const tp = new Typograf({enable: data.enable});

        data.tests.forEach(function(item) {
            assert.equal(tp.execute(item[0]), item[1]);
        });
    }

    it('enable common/html/stripTags', function() {
        check({
            enable: 'common/html/stripTags',
            tests: [
                [
                    '<p align="center">Hello world!</p> <a href="/">Hello world!</a>\n\n<pre>Hello world!</pre>',
                    'Hello world! Hello world!\n\nHello world!'
                ],
                [
                    '<p align="center" Hello world!</p>',
                    ''
                ]
            ]
        });
    });

    it('should enable common/html/escape', function() {
        check({
            enable: 'common/html/escape',
            tests: [
                [
                    '<p align="center">\nHello world!\n</p>',
                    '&lt;p align=&quot;center&quot;&gt;\nHello world!\n&lt;&#x2F;p&gt;'
                ]
            ]
        });
    });
});

describe('russian specific tests', function() {
    it('quotes lquote = lquote2 and rquote = rquote2', function() {
        const quoteTests = [
            ['"Триллер “Закрытая школа” на СТС"', '«Триллер «Закрытая школа» на СТС»'],
            ['Триллер "Триллер “Закрытая школа” на СТС" Триллер', 'Триллер «Триллер «Закрытая школа» на СТС» Триллер'],
            ['"“Закрытая школа” на СТС"', '«Закрытая школа» на СТС»'],
            ['Триллер "“Закрытая школа” на СТС" Триллер', 'Триллер «Закрытая школа» на СТС» Триллер'],
            ['"Триллер “Закрытая школа"', '«Триллер «Закрытая школа»'],
            ['Триллер "Триллер “Закрытая школа" Триллер', 'Триллер «Триллер «Закрытая школа» Триллер']
        ];

        const name = 'common/punctuation/quote';

        pushSettings(name, {
            ru: {
                lquote: '«',
                rquote: '»',
                lquote2: '«',
                rquote2: '»'
            }
        });

        quoteTests.forEach(function(item) {
            const [before, after] = item;
            assert.equal(executeRule(name, before, {locale: 'ru'}), after);
        });

         popSettings(name);
    });

    it('ru/optalign', function() {
        const tp = new Typograf({locale: 'ru'});
        tp.enable('ru/optalign/*');

        [
            [
                '<p>"что-то, где-то!"</p>',
                '<p><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</p>'
            ],
            [
                '<p><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma"></span><span class="typograf-oa-comma"></span><span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</p>',
                '<p><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</p>'
            ],
            [
                '<title>"что-то, где-то!"</title><p>"что-то, где-то!"</p>',
                '<title>«что-то, где-то!»</title><p><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</p>'
            ],
            [
                '<TITLE>"что-то, где-то!"</TITLE><P>"что-то, где-то!"</P>',
                '<TITLE>«что-то, где-то!»</TITLE><P><span class="typograf-oa-n-lquote">«</span>что-то<span class="typograf-oa-comma">,</span><span class="typograf-oa-comma-sp"> </span>где-то!»</P>'
            ],
            [
                '<html><head><title>Большие бинари в моем Rust?<span class="typograf-oa-sp-lbracket"> </span><span class="typograf-oa-lbracket">(</span>Why is a Rust executable large?) | Ржавый ящик</title></head><body></body></html>',
                '<html><head><title>Большие бинари в\u00A0моем Rust? (Why is\u00A0a\u00A0Rust executable large?) | Ржавый ящик</title></head><body></body></html>'
            ]
        ].forEach(function(item) {
            assert.equal(tp.execute(item[0]), item[1]);
        });
    });

    it('should disable ru/optalign', function() {
        const tp = new Typograf({locale: 'ru', disable: '*'});

        [
            '<span class="typograf-oa-sp-lquot"> </span>',
            '<span class="typograf-oa-lquot">«</span>',
            '<span class="typograf-oa-comma">,</span>',
            '<span class="typograf-oa-sp-lbracket"> </span>'
        ].forEach(function(item) {
            assert.equal(tp.execute(item), item);
        });
    });
});
