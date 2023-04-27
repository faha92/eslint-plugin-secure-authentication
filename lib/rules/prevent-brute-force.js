module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Ensure that a middleware to prevent brute force is added to the application",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create(context) {
    let hasMiddleware = false;

    function checkAppUsage(node) {
      const properties = node.properties;

      for (const property of properties) {
        if (property.key.name === "use") {
          const middleware = property.value.arguments[0];

          if (middleware.type === "CallExpression" && middleware.callee.name === "limit") {
            hasMiddleware = true;
            break;
          }
        }
      }
    }

    return {
      "Program:exit"(node) {
        const appDeclarations = node.body.filter((n) => n.type === "VariableDeclaration" && n.declarations[0].id.name === "app");
        const appAssignments = node.body.filter((n) => n.type === "ExpressionStatement" && n.expression.left.name === "app");

        if (appDeclarations.length > 0) {
          checkAppUsage(appDeclarations[0].declarations[0].init);
        } else if (appAssignments.length > 0) {
          checkAppUsage(appAssignments[0].expression.right);
        }

        if (!hasMiddleware) {
          context.report({
            node: node,
            message: "Add a middleware to prevent brute force attacks.",
            fix(fixer) {
              const fixes = [];

              if (appDeclarations.length > 0) {
                const appStart = appDeclarations[0].start;
                fixes.push(
                  fixer.insertTextAfterRange(
                    [appStart, appStart],
                    "\nconst rateLimit = require('express-rate-limit');\napp.use(rateLimit({\n  windowMs: 10 * 60 * 1000,\n  max: 100,\n  message: 'Too many requests from this IP, please try again after 10 minutes.'\n}));\n"
                  )
                );
              } else if (appAssignments.length > 0) {
                const appStart = appAssignments[0].expression.right.start;
                fixes.push(
                  fixer.insertTextAfterRange(
                    [appStart, appStart],
                    "\nconst rateLimit = require('express-rate-limit');\napp.use(rateLimit({\n  windowMs: 10 * 60 * 1000,\n  max: 100,\n  message: 'Too many requests from this IP, please try again after 10 minutes.'\n}));\n"
                  )
                );
              }

              return fixes;
            },
          });
        }
      },
    };
  },
};
