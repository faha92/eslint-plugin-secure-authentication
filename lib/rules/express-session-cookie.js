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

      const cookieProp = optionsNode.properties.find(
        (prop) => prop.key.type === 'Identifier' && prop.key.name === 'cookie'
      );

      if (!cookieProp || cookieProp.value.type !== 'ObjectExpression') {
        return true;
      }

      const requiredProps = ['secure', 'httpOnly', 'sameSite'];
      const existingProps = new Set();

      cookieProp.value.properties.forEach((prop) => {
        if (prop.key.type === 'Identifier') {
          const propName = prop.key.name;
          if (requiredProps.includes(propName)) {
            existingProps.add(propName);
          }
        }
      });

      return existingProps.size !== requiredProps.length;
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

                const cookieProp = optionsNode.properties.find(
                  (prop) => prop.key.type === 'Identifier' && prop.key.name === 'cookie'
                );

                if (cookieProp && cookieProp.value.type === 'ObjectExpression') {
                  const insertText = missingProps.join(', ');

                  const lastProperty = cookieProp.value.properties[cookieProp.value.properties.length - 1];
                  return fixer.insertTextAfter(lastProperty, ', ' + insertText);
                } else {
                  const insertText = ', \n cookie: { ' + missingProps.join(', ') + ' }';

                  const lastProperty = optionsNode.properties[optionsNode.properties.length - 1];
                  return fixer.insertTextAfter(lastProperty, insertText);
                }
              },
            });
          }
        }
      },
    };
  },
};
