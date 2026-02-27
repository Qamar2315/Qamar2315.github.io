const marked = require('marked');

const text = "Key capabilities include:\n1. **Bold**";
console.log("--- Single Newline ---");
console.log(marked.parse(text));

const text2 = "Key capabilities include:\n\n1. **Bold**";
console.log("--- Double Newline ---");
console.log(marked.parse(text2));
