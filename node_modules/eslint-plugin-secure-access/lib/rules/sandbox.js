/**
 * @fileoverview Adds sandbox attribute to iframes
 * @author Rares
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */



"use strict";

module.exports = {
  meta: {
    docs: {
      recommended:true, 
    },
    fixable: "code",
    messages: {
      dangerousValues: 'Since allow-scripts or allow-same-origin is enabled in the sandbox attribute, this allows a possible attacker to remove the sandbox attribute',
      missingSandbox: 'The iframe is missing the sandbox attribute',

    }
  },

  create(context) {
    return {
      'JSXOpeningElement[name.name="iframe"]'(node) {
        let sandboxExists = false;
        node.attributes.forEach((attribute) => {
          if (
            attribute.name.type === 'JSXIdentifier' 
            && attribute.type === 'JSXAttribute'
            && attribute.name.name === 'sandbox'
          ) {
            sandboxExists = true;
              const value = attribute.value.value.split(' ');
              value.forEach((attributeValue) => {
                const trimmedValue = attributeValue.trim();
                if (trimmedValue === 'allow-scripts' || trimmedValue === 'allow-same-origin') {
                  context.report({
                    node,
                    messageId: 'dangerousValues'
                  })}});
          }
        });
        if (!sandboxExists) {
          context.report({
            node,
            messageId: 'missingSandbox',
            fix: function(fixer) {
                return fixer.insertTextAfter(node.attributes[node.attributes.length - 1], ' sandbox = ""');
            }
          });
        }
      }
    };
  }
};