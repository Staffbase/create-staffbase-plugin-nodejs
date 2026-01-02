const path = require("path");
const fs = require("fs-extra");
const hljs = require("highlight.js");

const md = require("markdown-it")({
  highlight: function (str) {
    if (str && hljs.getLanguage(str)) {
      try {
        return hljs.highlight(str, true).value;
      } catch (err) {
        console.log(err);
      }
    }

    return ""; // use external default escaping
  },
});

const input = path.resolve(__dirname, "../scaffoldTpl/README.MD");
const output = path.resolve(__dirname, "../scaffoldTpl/views/index.html");
console.log("Generating HTML Getting started from README.MD");
console.log("Reading from:", input);
fs.readFile(input)
  .then((inputStr) => {
    // TODO Add better css in the generated html
    const outStr = md.render(inputStr.toString());
    return fs.outputFile(output, outStr);
  })
  .then((done) => {
    console.log("File written to:", output);
  })
  .catch((err) => {
    console.log(err);
  });
