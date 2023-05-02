module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure the session cookie has secure, httpOnly, and sameSite properties',
      category: 'Best Practices',
      recommended: true,
    },
    fixable: 'code',
    schema: [],
  },

  create: function (context) {
    function isSessionCall(node) {
      return (
        node.type === 'CallExpression' &&
        node.callee.type === 'Identifier' &&
        node.callee.name === 'session'
      );
    }

    function isMissingCookieProperties(optionsNode) {
      if (optionsNode.type !== 'ObjectExpression') {
        return false;
      }

      const missingProps = ['secure', 'httpOnly', 'sameSite'];
      optionsNode.properties.forEach((prop) => {
        if (prop.key.type === 'Identifier') {
          const propName = prop.key.name;
          const index = missingProps.indexOf(propName);
          if (index !== -1) {
            missingProps.splice(index, 1);
          }
        }
      });

      return missingProps.length > 0;
    }

    return {
      CallExpression(node) {
        if (isSessionCall(node)) {
          const optionsNode = node.arguments[0];
          if (optionsNode && isMissingCookieProperties(optionsNode)) {
            context.report({
              node,
              message:
                'The session cookie is missing recommended properties. Please add "secure", "httpOnly", and "sameSite" properties to the cookie object.',
              fix(fixer) {
                const missingProps = [
                  'secure: true',
                  'httpOnly: true',
                  'sameSite: "lax"',
                ];

                optionsNode.properties.forEach((prop) => {
                  if (prop.key.type === 'Identifier') {
                    const propName = prop.key.name;
                    const index = missingProps.indexOf(propName);
                    if (index !== -1) {
                      missingProps.splice(index, 1);
                    }
                  }
                });

                const insertText = ', ' + missingProps.join(', ');
                const lastProperty = optionsNode.properties[optionsNode.properties.length - 1];
                return fixer.insertTextAfter(lastProperty, insertText);
              },
            });
          }
        }
      },
    };
  },
};
