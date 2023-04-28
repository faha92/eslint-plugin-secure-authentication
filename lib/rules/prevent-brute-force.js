module.exports = {
  // thsi version is very naive and doesnt work fully yet.
  meta: {
    type: "problem",
    docs: {
      description:
        "Check if passport methods are used without express-brute middleware",
      category: "Security",
      recommended: true,
    },
    schema: [],
    fixable: "code",
  },

  create(context) {
    let hasExpressBruteMiddleware = false;

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "app" &&
          node.callee.property.name === "post" &&
          node.arguments.some(
            (arg) => arg.type === "Identifier" && arg.name === "bruteforce"
          )
        ) {
          hasExpressBruteMiddleware = true;
        }

        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "passport" &&
          (node.callee.property.name === "initialize" ||
            node.callee.property.name === "session")
        ) {
          if (!hasExpressBruteMiddleware) {
            context.report({
              node: node,
              message:
                "Use express-brute middleware for login brute-force protection",
              fix(fixer) {
                return fixer.insertTextBeforeRange(
                  [node.range[0], node.range[0]],
                  "const ExpressBrute = require('express-brute');\nconst store = new ExpressBrute.MemoryStore();\nconst bruteforce = new ExpressBrute(store, {\n    freeRetries: 5,\n    minWait: 5000\n});\n\napp.post('/login', bruteforce.prevent, "
                );
              },
            });
          }
        }
      },
    };
  },
};
