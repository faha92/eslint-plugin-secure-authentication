// Require the Sanatize library

const sanitizeHtml = require('sanitize-html');

// Create an ESLint rule that checks for the use of dangerouslySetInnerHTML
module.exports = {
  meta: {
    messages: {
      sanitize: 'The HTML provided to dangerouslySetInnerHTML should be sanitized to prevent security vulnerabilities. To use this autmatic fix (please install the sanitized library with command "npm install sanitize-html") '
    },
    fixable: "code",
    schema: []
  },
  create: function(context) {


    // get the sourcecode of the context
    let sourceCode = context.getSourceCode();
    return {
      JSXAttribute: function(node) {
        if (node.name.name === 'dangerouslySetInnerHTML') {
          // If dangerouslySetInnerHTML is used, provide a fix that sanitizes the HTML using Sanatized HTML library
          context.report({
            node: node,
            messageId: 'sanitize',
            fix: function(fixer) {
              // Get the value of the dangerouslySetInnerHTML attribute
             let insecureHTML = sourceCode.getText(node.value)
        
             // Use Sanitize library to sanitize the HTML
             let sanitizedHTML = sanitizeHtml(insecureHTML);

              // Use the fixer to replace the original value with the sanitized HTML
              return[
              fixer.replaceText(node.value, sanitizedHTML),
              // When the automatic fix has run. Disable the error/warning for this rule.
              fixer.insertTextAfter(node.parent.name, " // eslint-disable-next-line react/no-danger")
                
              ];
            }
          });
        }
      }
    };
  }
};
