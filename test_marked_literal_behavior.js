const marked = require('marked');

const literal = "Line 1\\nLine 2";
console.log("--- Literal \\n ---");
console.log(marked.parse(literal));

const actual = "Line 1\nLine 2";
console.log("--- Actual Newline ---");
console.log(marked.parse(actual));
