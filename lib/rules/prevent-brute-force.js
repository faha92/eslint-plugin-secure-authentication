module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure express-brute middleware is used in the login route",
      category: "Security",
      recommended: true,
    },
    schema: [],
    fixable: "code",
  },

  create(context) {
    let hasExpressBruteImport = false;
    let loginRouteNode = null;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "express-brute") {
          hasExpressBruteImport = true;
        }
      },

      VariableDeclarator(node) {
        if (node.init && node.init.callee && node.init.callee.name === "require" && node.init.arguments[0].value === "express-brute") {
          hasExpressBruteImport = true;
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "router" &&
          node.callee.property.name === "post" &&
          node.arguments.length > 0 &&
          node.arguments[0].value === "/login"
        ) {
          loginRouteNode = node;

          if (
            node.arguments.some(
              (arg) => arg.type === "Identifier" && arg.name === "bruteforce"
            )
          ) {
            hasExpressBruteImport = true;
          }
        }
      },

      "Program:exit": function () {
        if (!hasExpressBruteImport && loginRouteNode) {
          context.report({
            node: loginRouteNode,
            message: "Use express-brute middleware for login brute-force protection",
            fix(fixer) {
              const importText = "const ExpressBrute = require('express-brute');\nconst store = new ExpressBrute.MemoryStore();\nconst bruteforce = new ExpressBrute(store, {\n  freeRetries: 5,\n  minWait: 5000\n});\n\n";

              const insertImportFix = fixer.insertTextBeforeRange([0, 0], importText);
              const insertBruteforceFix = fixer.insertTextBefore(loginRouteNode.arguments[1], "bruteforce.prevent, ");

              return [insertImportFix, insertBruteforceFix];
            },
          });
        }
      },
    };
  },
};
