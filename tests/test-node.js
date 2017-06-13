var Deltoid = require('../src/deltoid');

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
});

var parsed1 = d1.parse();
var parsed2 = d2.parse();

console.log(parsed1.toHTML()); // => <div id="line-1"><u><b>Hello </b></u><i>world!</i></div>
console.log(parsed1.toPlainText()); // => Hello world!
console.log(parsed2.toHTML()); // => <div id="line-1"><u><strong>Hello </strong></u><em>world!</em></div>
console.log(parsed2.toPlainText()); // => Hello world!