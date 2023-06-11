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

    function findCookieProperty(optionsNode) {
      return optionsNode.properties.find(
        (prop) => prop.key.type === 'Identifier' && prop.key.name === 'cookie'
      );
    }

    function isMissingCookieProperties(optionsNode) {
      if (optionsNode.type !== 'ObjectExpression') {
        return false;
      }

      const cookieProp = findCookieProperty(optionsNode);

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
                // Change the default sameSite value to 'strict'
                const desiredProps = {
                  secure: 'true',
                  httpOnly: 'true',
                  sameSite: '"strict"',
                };

                const cookieProp = findCookieProperty(optionsNode);

                if (!cookieProp) {
                  const newText = ', cookie: { secure: true, httpOnly: true, sameSite: "strict" }';
                  const lastProperty = optionsNode.properties[optionsNode.properties.length - 1];
                  return [fixer.insertTextAfter(lastProperty, newText)];
                }

                if (cookieProp && cookieProp.value.type === 'ObjectExpression') {
                  const fixes = [];

                  if (cookieProp.value.properties.length === 0) {
                    const newText = '{ secure: true, httpOnly: true, sameSite: "strict" }';
                    fixes.push(fixer.replaceText(cookieProp.value, newText));
                  } else {
                    cookieProp.value.properties.forEach((prop) => {
                      if (prop.key.type === 'Identifier' && desiredProps.hasOwnProperty(prop.key.name)) {
                        fixes.push(fixer.replaceText(prop.value, desiredProps[prop.key.name]));
                        delete desiredProps[prop.key.name];
                      }
                    });

                    Object.keys(desiredProps).forEach((missingProp) => {
                      const insertText = ', ' + missingProp + ': ' + desiredProps[missingProp];
                      const lastProperty = cookieProp.value.properties[cookieProp.value.properties.length - 1];
                      fixes.push(fixer.insertTextAfter(lastProperty, insertText));
                    });
                  }

                  return fixes;
                }
              },
            });
          }
        }
      },
    };
  },
};