module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure express-brute middleware is added to the app for login brute-force protection",
      category: "Security",
      recommended: true,
    },
    schema: [],
  },

  create(context) {
    let hasPassport = false;
    let hasListener = false;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "passport") {
          hasPassport = true;
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.name === "listen"
        ) {
          hasListener = true;
          const [portArg] = node.arguments;
          const port = parseInt(portArg.value);
          if (hasPassport) {
            context.report({
              node: node,
              message:
                "Use express-brute middleware for login brute-force protection",
              fix(fixer) {
                return [
                  fixer.insertTextBeforeRange(
                    [node.range[0], node.range[0]],
                    "const ExpressBrute = require('express-brute');\nconst store = new ExpressBrute.MemoryStore();\nconst bruteforce = new ExpressBrute(store, {\n    freeRetries: 5,\n    minWait: 5000\n});\n\n"
                  ),
                  fixer.replaceText(
                    node.arguments[0],
                    `${portArg.getSource().replace(port, 0)}`
                  ),
                  fixer.insertTextAfter(
                    node,
                    ".on('listening', () => {\n  console.log(`Server running on ${port}`);\n});"
                  ),
                  fixer.insertTextBefore(
                    node,
                    "app.post('/login', bruteforce.prevent, "
                  ),
                ];
              },
            });
          }
        }
      },
    };
  },
};
