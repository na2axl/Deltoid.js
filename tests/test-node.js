var Deltoid = require('./../src/deltoid');

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

console.log(parsed1.toHTML()); // => <strong><u>Hello </u></strong><em>world!</em>
console.log(parsed1.toPlainText()); // => Hello world!
console.log(parsed2.toHTML()); // => <strong><u>Hello </u></strong><em>world!</em>
console.log(parsed2.toPlainText()); // => Hello world!