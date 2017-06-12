/**
 * Deltoid.js v1.0.0
 * Copyright 2017 Axel Nana
 * Licensed under MIT
 */
(function (global) {
    'use strict';

    /**
     * Deltoid
     *
     * Parses a Delta to HTML and plain text.
     *
     * @author Axel Nana <ax.lnana@outlook.com>
     *
     * @param {string|object} delta The Delta to parse.
     * @return {Deltoid}
     */
    var Deltoid = function Deltoid(delta, options) {
        if (typeof delta === "string")
            this._delta = JSON.parse(delta);
        else if (typeof delta === "object")
            this._delta = delta;
        else
            throw new TypeError("The delta has an unsupported type. Only string and object supported.");

        this._tokens = Deltoid.TOKENS;

        if (typeof options !== "undefined") {
            if (typeof options.tokens !== "undefined")
                this._tokens = Deltoid._extend(Deltoid.TOKENS, options.tokens);
        }

        this._lines = [];
        this._Iline = 0;
        this._Itoken = 0;
        this._Ilist = 0;
        this._Tlist = [];
    };

    /**
     * Quick and dirty object merger.
     * @return {object}
     */
    Deltoid._extend = function () {
        var out = {};
        var p = {};

        for (var i = 0; i < arguments.length; i++) {
            for (p in arguments[i]) {
                out[p] = arguments[i][p];
            }
        }

        return out;
    };

    /**
     * The list of default HTML tags to use when tokenizing.
     * @var {object}
     */
    Deltoid.TOKENS = {
        line: "<div id=\"line-{number}\">{content}</div>",
        bold: "<b>{content}</b>",
        italic: "<i>{content}</i>",
        strike: "<s>{content}</s>",
        underline: "<u>{content}</u>",
        script: {
            sub: "<sub>{content}</sub>",
            super: "<super>{content}</super>"
        },
        list: {
            ordered: "<ol>{content}</ol>",
            unordered: "<ul>{content}</ul>",
            item: "<li>{content}</li>"
        },
        header: [
            "",
            "<h1>{content}</h1>",
            "<h2>{content}</h2>",
            "<h3>{content}</h3>",
            "<h4>{content}</h4>",
            "<h5>{content}</h5>",
            "<h6>{content}</h6>"
        ],
        link: "<a href=\"{value}\">{content}</a>",
        image: "<img src=\"{image}\" alt={alt} />",
        formula: "<span class=\"katex-formula\" data-formula=\"{formula}\">{formula}</span>",
        blockquote: "<blockquote>{content}</blockquote>",
        "code-block": "<pre class=\"hljs\">{content}</pre>"
    };

    /**
     * HTML tags to use when tokenizing.
     * @var {object}
     */
    Deltoid.prototype._tokens = Deltoid.TOKENS;

    /**
     * The Delta.
     * @var {object}
     */
    Deltoid.prototype._delta = {};

    /**
     * Stores currently parsed lines.
     * @var {string[]}
     */
    Deltoid.prototype._lines = [];

    /**
     * Save the current token index.
     * @var {number}
     */
    Deltoid.prototype._Itoken = 0;

    /**
     * Save the current line index.
     * @var {number}
     */
    Deltoid.prototype._Iline = 0;

    /**
     * Save the current list indent level.
     * @var {number}
     */
    Deltoid.prototype._Ilist = 0;

    /**
     * Save the current list type.
     * @var {number}
     */
    Deltoid.prototype._Tlist = 0;

    /**
     * Parses the Delta.
     * @return {Deltoid}
     */
    Deltoid.prototype.parse = function () {
        if (typeof this._delta.ops === "undefined")
            throw new Error("Malformed Delta, missing the 'ops' argument.");

        // Explore the Delta and parse all 'op'
        this._delta.ops.forEach(function (op) {
            // New lines...
            if (/^(\n+)$/.test(op.insert))
                this._linify(op);
            else {
                // Add new lines on ending "new line" character
                if (/^.+\\n$/.test(op.insert))
                    this._Iline++;
                // Images...
                if (typeof op.insert.image !== "undefined")
                    this._imagify(op);
                // Formula...
                else if (typeof op.insert.formula !== "undefined")
                    this._formulify(op);
                // All the rest !
                else
                    this._tokenize(op);
            }

            // Count the number of 'op' explored
            this._Itoken++;
        }, this);

        return this;
    };

    /**
     * Returns the HTML value of the Delta.
     * @return {string}
     */
    Deltoid.prototype.toHTML = function () {
        for (var i = 0; i < this._lines.length; i++) {
            // Skip wrapping for some block elements
            if (!/^<(ol|ul|pre)>.+/.test(this._lines[i])) {
                this._lines[i] = this._tokens.line
                    .split("{number}").join(i + 1)
                    .split("{content}").join(this._lines[i]);
            }
        }

        return this._lines.join("");
    };

    /**
     * Returns the plain text value of the Delta.
     * @return {string}
     */
    Deltoid.prototype.toPlainText = function () {
        // If we are in a Node.js environment
        if (typeof module !== "undefined" && module !== null && module.exports) {
            var striptags = require('striptags');
            return striptags(this.toHTML());
        } else {
            var div = document.createElement("div");
            div.innerHTML = this.toHTML();
            return div.innerText;
        }
    };

    /**
     * Tokenize
     * @param {object} op
     * @param {boolean} overwrite
     */
    Deltoid.prototype._tokenize = function (op, overwrite) {
        var html = op.insert;

        if (typeof op.attributes === "object") {
            for (var token in op.attributes) {
                switch (token) {
                    case "bold":
                        if (op.attributes.bold)
                            html = this._tokens.bold
                            .split("{content}").join(html);
                        break;

                    case "italic":
                        if (op.attributes.italic)
                            html = this._tokens.italic
                            .split("{content}").join(html);
                        break;

                    case "strike":
                        if (op.attributes.strike)
                            html = this._tokens.strike
                            .split("{content}").join(html);
                        break;

                    case "underline":
                        if (op.attributes.underline)
                            html = this._tokens.underline
                            .split("{content}").join(html);
                        break;

                    case "link":
                        html = this._tokens.link
                            .split("{content}").join(html)
                            .split("{value}").join(op.attributes.link);
                        break;

                    case "header":
                        html = this._tokens.header[op.attributes.header]
                            .split("{content}").join(html);
                        break;

                    case "blockquote":
                        html = this._tokens.blockquote
                            .split("{content}").join(html);
                        break;

                    case "script":
                        html = this._tokens.script[op.attributes.script]
                            .split("{content}").join(html);
                        break;
                }
            }
        } else {
            var parts = html.split("\n");
            if (parts.length > 1) {
                for (var i = 0; i < parts.length; i++) {
                    this._appendLine(parts[i], overwrite);
                    this._Iline++;
                }
                this._Iline--;
                return;
            }
        }

        this._appendLine(html, overwrite);
    };

    /**
     * Linify
     * @param {object} op
     */
    Deltoid.prototype._linify = function (op) {
        op.lineCount = op.insert.split("\n").length - 1 > 1 ? op.insert.split("\n").length - 1 : 1;
        // If we have to apply a line style...
        if (typeof op.attributes !== "undefined") {
            op.insert = this._lines[this._Iline];
            // Don't break lists when linifying...
            if (typeof op.attributes.list !== "undefined") {
                this._listify(op);
            }
            // Don't break code blocks when linifying...
            else if (!!op.attributes["code-block"]) {
                this._prettify(op);
            }
            // Tokenize the line...
            else {
                this._tokenize(op, true);
            }
        }
        for (var i = 0; i < op.lineCount; i++) {
            this._appendLine("");
            this._Iline++;
        }
    };

    /**
     * Imagify
     * @param {object} op
     */
    Deltoid.prototype._imagify = function (op) {
        var html = this._tokens.image
            .split("{image}").join(op.insert.image)
            .split("{alt}").join(op.insert.alt || "");

        op.insert = html;
        this._tokenize(op);
    };

    /**
     * Formulify
     * @param {object} op
     */
    Deltoid.prototype._formulify = function (op) {
        var html = this._tokens.formula
            .split("{formula}").join(op.insert.formula);

        op.insert = html;
        this._tokenize(op);
    };

    /**
     * Listify
     * @param {object} op
     */
    Deltoid.prototype._listify = function (op) {
        // The current indent level
        var current_indent = op.attributes.indent || 0;

        // Store the type of the list on the current indent level
        var current_type = (op.attributes.list === "ordered") ? "ol" : "ul";

        // Ensuring that the current line has a value
        this._appendLine("");

        var current = "";

        if (this._Tlist[current_indent] && this._Ilist === current_indent && this._Tlist[current_indent] !== current_type) {
            current = this._lines[this._Iline].replace(new RegExp("^(.+)<\/(" + this._Tlist[current_indent] + ")>([^<]+)$"), "$3");
            this._lines[this._Iline] = this._lines[this._Iline].substr(0, this._lines[this._Iline].length - current.length);
            this._Iline++;
            this._appendLine(current, true);
        }

        this._Tlist[current_indent] = current_type;

        // We are adding a new item on the list...
        var html = this._lines[this._Iline].replace(new RegExp("<\/li><\/" + this._Tlist[this._Ilist] + ">([^<]+)$"), "</li><li>$1");

        // If we are currently in a list...
        if (/^<(ol|ul)>.+/.test(html)) {
            // If we are on the current list level
            if (current_indent === this._Ilist) {
                html += "</li><li>";
            }
            // If the current list level is greater than the last one, create a sub list
            else if (current_indent > this._Ilist) {
                current = html.replace(/^(.+)<li>([^<]+)$/g, "$2");
                html = html.substr(0, html.length - current.length - "</li><li>".length) + "<" + this._Tlist[current_indent] + "><li>" + current + "</li><li>";
            }
            // If the current list level is lower than the last one, back to the parent list
            else if (current_indent < this._Ilist) {
                current = html.replace(/^(.+)<li>([^<]+)$/g, "$2");
                html = html.substr(0, html.length - current.length - "<li>".length);
                var closing = "</li>";
                for (var i = this._Ilist; i > current_indent; i--) {
                    closing += "</" + this._Tlist[i] + "></li>";
                }
                closing += "<li>";
                html = html.replace(/<\/li>$/, closing) + current + "</li><li>";
            }
        }
        // Otherwise create a new list
        else {
            html = "<" + this._Tlist[current_indent] + "><li>" + html + "</li><li>";
        }

        // Suppose that we are on the last item and close the list
        // if (current_indent === this._Ilist)
        html = html.replace(/<li>$/, "</" + this._Tlist[current_indent] + ">");

        // Update the HTML
        this._lines[this._Iline] = html;

        // Update the list indent level
        this._Ilist = current_indent;

        // Stay on the current line while we are parsing the list
        this._Iline -= op.lineCount;
    };

    /**
     * Prettify
     * @param {object} op
     */
    Deltoid.prototype._prettify = function (op) {
        // Ensuring that the current line has a value
        this._appendLine("");

        var html = this._lines[this._Iline]
            .split(this._tokens["code-block"].split("{content}")[0]).join("")
            .split(this._tokens["code-block"].split("{content}")[1]).join("");

        // Replace all spaces by non-breakable spaces
        html = html
            .split(" ").join("&nbsp;")
            .split("<").join("&lt;")
            .split(">").join("&gt;");

        // Respect new lines formatting
        for (var i = 0; i < op.lineCount; i++)
            html += "\n";

        this._lines[this._Iline] = this._tokens["code-block"].split("{content}").join(html);

        // Stay on the current line while we are parsing the list
        this._Iline -= op.lineCount;
    };

    /**
     * Append a text on the current line
     * @param {string} text
     * @param {boolean} overwrite
     */
    Deltoid.prototype._appendLine = function (text, overwrite) {
        if (typeof this._lines[this._Iline] === "undefined" || overwrite === true)
            this._lines[this._Iline] = text;
        else
            this._lines[this._Iline] += text;
    };

    if (typeof define === 'function' && define.amd) {
        define([], function factory() { return Deltoid; });
    } else if (typeof module === "object" && module.exports) {
        module.exports = Deltoid;
    } else {
        global.Deltoid = Deltoid;
    }

})(this);