# Deltoid.js
A Delta parser to HTML and plain text.

## Installation

### Browser
Just include `deltoid.js` in your web page:
```html
<script src="./scripts/deltoid.js"></script>
```
And then you can use the class `Deltoid` where you want

### Node.js
Install Deltoid in your project with this command:
```shell
npm install deltoid --save
```
And then you can require them later:
```js
var Deltoid = require('deltoid');
```

### Require.js
Deltoid can be accessed as an asynchronous module with require.js:
```js
require(['path/to/deltoid.js'], function (Deltoid) {
    // Do your stuff...
});
```

## How to use ?
Once Deltoid is installed, to use it you just have to create a new instance of Deltoid and give it required parameters:
```js
var deltaParser = new Deltoid(delta, options);
```

* The `delta` parameter is the Delta to parse. It can be an `object` or a `string` which can be parsed to object.
* The `options` parameter is optional. It define the `tokens` to use when Deltoid will parse the Delta to HTML.

Supported tokens and their format:
```js
{
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
}
```

## Examples
```js
var delta = {
    ops: [
        {
            insert: "Hello ",
            attributes: {
                bold: true,
                underline: true
            }
        },
        {
            insert: "world!",
            attributes: {
                italic: true
            }
        }
    ]
};

var d1 = new Deltoid(delta);
var d2 = new Deltoid(delta, {
    tokens: {
        bold: "<strong>{content}</strong>",
        italic: "<em>{content}</em>",
    }
})

var parsed1 = d1.parse();
var parsed2 = d2.parse();

parsed1.toHTML(); // => <div id="line-1"><u><b>Hello </b></u><i>world!</i></div>
parsed1.toPlainText(); // => Hello world!

parsed2.toHTML(); // => <div id="line-1"><u><strong>Hello </strong></u><em>world!</em></div>
parsed2.toPlainText(); // => Hello world!
```