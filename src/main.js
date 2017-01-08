/**
 * @constructor
 * @param {Object} [prefs]
 * @param {string} [prefs.lang] Language rules
 * @param {string} [prefs.lineEnding] Line ending. 'LF' (Unix), 'CR' (Mac) or 'CRLF' (Windows). Default: 'LF'.
 * @param {HtmlEntity} [prefs.htmlEntity]
 * @param {boolean} [prefs.live] Live mode
 * @param {string|string[]} [prefs.enable] Enable rules
 * @param {string|string[]} [prefs.disable] Disable rules
 */
function Typograf(prefs) {
    this._prefs = typeof prefs === 'object' ? prefs : {};
    this._prefs.live = this._prefs.live || false;

    this._safeTags = new SafeTags();

    this._settings = {};
    this._enabledRules = {};

    this._innerRulesByQueues = {};
    this._innerRules = [].concat(this._innerRules);
    this._innerRules.forEach(function(rule) {
        var q = rule.queue || 'default';
        this._innerRulesByQueues[q] = this._innerRulesByQueues[q] || [];
        this._innerRulesByQueues[q].push(rule);
    }, this);

    this._rulesByQueues = {};
    this._rules = [].concat(this._rules);
    this._rules.forEach(function(rule) {
        var q = rule.queue || 'default';
        this._prepareRule(rule);
        this._rulesByQueues[q] = this._rulesByQueues[q] || [];
        this._rulesByQueues[q].push(rule);
    }, this);

    this._prefs.disable && this.disable(this._prefs.disable);
    this._prefs.enable && this.enable(this._prefs.enable);
}

/**
 * Add a rule.
 *
 * @static
 * @param {Object} rule
 * @param {string} rule.name Name of rule
 * @param {Function} rule.handler Processing function
 * @param {number} [rule.index] Sorting index for rule
 * @param {boolean} [rule.disabled] Rule is disabled by default
 * @param {boolean} [rule.live] Live mode
 * @param {Object} [rule.settings] Settings for rule
 * @return {Typograf} this
 */
Typograf.rule = function(rule) {
    var parts = rule.name.split('/');

    rule._enabled = rule.disabled === true ? false : true;
    rule._lang = parts[0];
    rule._group = parts[1];
    rule._name = parts[2];

    Typograf._setIndex(rule);

    Typograf.prototype._rules.push(rule);

    if (Typograf._needSortRules) {
        this._sortRules();
    }

    return this;
};

Typograf._reUrl = new RegExp('(https?|file|ftp)://([a-zA-Z0-9\/+-=%&:_.~?]+[a-zA-Z0-9#+]*)', 'g');

Typograf._langs = ['en', 'ru'];

Typograf._setIndex = function(rule) {
    var index = rule.index,
        t = typeof index,
        groupIndex = Typograf.groupIndexes[rule._group];

    if (t === 'undefined') {
        index = groupIndex;
    } else if (t === 'string') {
        index = groupIndex + parseInt(rule.index, 10);
    }

    rule._index = index;
};

/**
 * Add internal rule.
 * Internal rules are executed before main.
 *
 * @static
 * @param {Object} rule
 * @param {string} rule.name Name of rule
 * @param {Function} rule.handler Processing function
 * @return {Typograf} this
 */
Typograf.innerRule = function(rule) {
    Typograf.prototype._innerRules.push(rule);

    rule._lang = rule.name.split('/')[0];

    return this;
};

/**
 * Get/set data for use in rules.
 *
 * @static
 * @param {string|Object} key
 * @param {*} [value]
 * @return {*}
 */
Typograf.data = function(key, value) {
    if (typeof key === 'string') {
        if (arguments.length === 1) {
            return Typograf._data[key];
        } else {
            Typograf._data[key] = value;
        }
    } else if (typeof key === 'object') {
        Object.keys(key).forEach(function(k) {
            Typograf._data[k] = key[k];
        });
    }
};

Typograf._data = {};

Typograf._sortRules = function() {
    Typograf.prototype._rules.sort(function(a, b) {
        return a._index > b._index ? 1 : -1;
    });
};

Typograf._replace = function(text, re) {
    for (var i = 0; i < re.length; i++) {
        text = text.replace(re[i][0], re[i][1]);
    }

    return text;
};

Typograf._replaceNbsp = function(text) {
    return text.replace(/\u00A0/g, ' ');
};

Typograf._privateLabel = '\uDBFF';
Typograf._privateQuote = '\uDBFE';

Typograf.prototype = {
    constructor: Typograf,
    /**
     * Execute typographical rules for text.
     *
     * @param {string} text
     * @param {Object} [prefs]
     * @param {string} [prefs.lang] Language rules
     * @param {HtmlEntity} [prefs.htmlEntity] Type of HTML entities
     * @param {string} [prefs.lineEnding] Line ending. 'LF' (Unix), 'CR' (Mac) or 'CRLF' (Windows). Default: 'LF'.
     * @return {string}
     */
    execute: function(text, prefs) {
        text = '' + text;

        if (!text) { return ''; }

        prefs = prefs || {};

        var that = this;

        this._lang = prefs.lang || this._prefs.lang || 'common';

        text = this._removeCR(text);

        this._isHTML = text.search(/(<\/?[a-z]|<!|&[lg]t;)/i) !== -1;

        text = this._executeRules(text, 'start');

        text = this._safeTags.hide(text, this._isHTML, function(t, group) {
            return that._executeRules(t, 'hide-safe-tags-' + group);
        });

        text = this._executeRules(text, 'hide-safe-tags');

        text = HtmlEntities.toUtf(text);

        if (this._prefs.live) { text = Typograf._replaceNbsp(text); }

        text = this._executeRules(text, 'utf');

        text = this._executeRules(text);

        text = HtmlEntities.restore(text, prefs.htmlEntity || this._prefs.htmlEntity || {});

        text = this._executeRules(text, 'html-entities');

        text = this._safeTags.show(text, function(t, group) {
            return that._executeRules(t, 'show-safe-tags-' + group);
        });

        text = this._executeRules(text, 'end');

        this._lang = null;
        this._isHTML = null;

        return this._fixLineEnding(text, prefs.lineEnding || this._prefs.lineEnding);
    },
    /**
     * Get/set a setting.
     *
     * @param {string} ruleName
     * @param {string} setting
     * @param {*} [value]
     * @return {*}
     */
    setting: function(ruleName, setting, value) {
        if (arguments.length <= 2) {
            return this._settings[ruleName] && this._settings[ruleName][setting];
        } else {
            this._settings[ruleName] = this._settings[ruleName] || {};
            this._settings[ruleName][setting] = value;

            return this;
        }
    },
    /**
     * Is enabled a rule.
     *
     * @param {string} ruleName
     * @return {boolean}
     */
    enabled: function(ruleName) {
        return this._enabledRules[ruleName];
    },
    /**
     * Is disabled a rule.
     *
     * @param {string} ruleName
     * @return {boolean}
     */
    disabled: function(ruleName) {
        return !this._enabledRules[ruleName];
    },
    /**
     * Enable a rule.
     *
     * @param {string|string[]} ruleName
     * @return {Typograf} this
     */
    enable: function(ruleName) {
        return this._enable(ruleName, true);
    },
    /**
     * Disable a rule.
     *
     * @param {string|string[]} ruleName
     * @return {Typograf} this
     */
    disable: function(ruleName) {
        return this._enable(ruleName, false);
    },
    /**
     * Add safe tag.
     *
     * @example
     * // var t = new Typograf({lang: 'ru'});
     * // t.addSafeTag('<mytag>', '</mytag>');
     * // t.addSafeTag('<mytag>', '</mytag>', '.*?');
     * // t.addSafeTag(/<mytag>.*?</mytag>/gi);
     *
     * @param {string|RegExp} startTag
     * @param {string} [endTag]
     * @param {string} [middle]
     * @return {Typograf} this
    */
    addSafeTag: function(startTag, endTag, middle) {
        var tag = startTag instanceof RegExp ? startTag : [startTag, endTag, middle];

        this._safeTags.add(tag);

        return this;
    },
    /**
     * Get data for use in rules.
     *
     * @param {string} key
     * @return {*}
     */
    data: function(key) {
        var lang = '';
        if (key.search('/') === -1) {
            lang = (this._lang || this._prefs.lang) + '/';
        }

        return Typograf.data(lang + key);
    },
    _executeRules: function(text, queue) {
        queue = queue || 'default';

        var rules = this._rulesByQueues[queue],
            innerRules = this._innerRulesByQueues[queue];

        innerRules && innerRules.forEach(function(rule) {
            text = this._ruleIterator(text, rule);
        }, this);

        rules && rules.forEach(function(rule) {
            text = this._ruleIterator(text, rule);
        }, this);

        return text;
    },
    _ruleIterator: function(text, rule) {
        var rlang = rule._lang,
            live = this._prefs.live;

        if ((live === true && rule.live === false) || (live === false && rule.live === true)) {
            return text;
        }

        if ((rlang === 'common' || rlang === this._lang) && this.enabled(rule.name)) {
            this._onBeforeRule && this._onBeforeRule(rule.name, text);
            text = rule.handler.call(this, text, this._settings[rule.name]);
            this._onAfterRule && this._onAfterRule(rule.name, text);
        }

        return text;
    },
    _removeCR: function(text) {
        return text.replace(/\r\n?/g, '\n');
    },
    _fixLineEnding: function(text, type) {
        if (type === 'CRLF') { // Windows
            return text.replace(/\n/g, '\r\n');
        } else if (type === 'CR') { // Mac
            return text.replace(/\n/g, '\r');
        }

        return text;
    },
    _prepareRule: function(rule) {
        var name = rule.name,
            settings = {};

        if (typeof rule.settings === 'object') {
            Object.keys(rule.settings).forEach(function(key) {
                settings[key] = rule.settings[key];
            });
        }

        this._settings[name] = settings;
        this._enabledRules[name] = rule._enabled;
    },
    _enable: function(rule, enabled) {
        if (Array.isArray(rule)) {
            rule.forEach(function(el) {
                this._enableByMask(el, enabled);
            }, this);
        } else {
            this._enableByMask(rule, enabled);
        }

        return this;
    },
    _enableByMask: function(rule, enabled) {
        var re;
        if (rule.search(/\*/) !== -1) {
            re = new RegExp(rule
                .replace(/\//g, '\\\/')
                .replace(/\*/g, '.*'));

            this._rules.forEach(function(el) {
                var name = el.name;
                if (re.test(name)) {
                    this._enabledRules[name] = enabled;
                }
            }, this);
        } else {
            this._enabledRules[rule] = enabled;
        }
    },
    _rules: [],
    _innerRules: [],
    _getRule: function(name) {
        var rule = null;
        this._rules.some(function(item) {
            if (item.name === name) {
                rule = item;
                return true;
            }

            return false;
        });

        return rule;
    }
};
