// Exporting an ESLint rule module
module.exports = {
  // Metadata of the rule
  meta: {
    type: "problem",  // Type of the rule
    docs: {
      description: "Ensure express-brute middleware is used in the login route",  // Description of the rule
      category: "Security",  // Category of the rule
      recommended: true,  // Recommends the rule
    },
    schema: [],  // The options schema of the rule
    fixable: "code",  // The rule can fix the code automatically
  },

  // Creates the rule
  create(context) {
    // Flags if express-brute is imported
    let hasExpressBruteImport = false;

    // Node of login route
    let loginRouteNode = null;

    // Array of common login route names
    const loginKeywords = ["login", "signin", "authenticate", "auth"];

    // Create a regular expression dynamically from the array
    const loginRegex = new RegExp(`/(${loginKeywords.join('|')})`, 'i');

    // Returns an object of selectors and corresponding listener functions
    return {
      // Listener for ImportDeclaration
      ImportDeclaration(node) {
        // If express-brute is imported
        if (node.source.value === "express-brute") {
          hasExpressBruteImport = true;
        }
      },

      // Listener for VariableDeclarator
      VariableDeclarator(node) {
        // If express-brute is required
        if (
          node.init &&
          node.init.callee &&
          node.init.callee.name === "require" &&
          node.init.arguments[0].value === "express-brute"
        ) {
          hasExpressBruteImport = true;
        }
      },

      // Listener for CallExpression
      CallExpression(node) {
        // If the callee is a login route
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "router" &&
          node.callee.property.name === "post" &&
          node.arguments.length > 0 &&
          loginRegex.test(node.arguments[0].value) // test all the loginKeywords against the route using the regex.
        ) {
          // Login route detected
          loginRouteNode = node;

          // If the route uses express-brute
          if (
            node.arguments.some(
              (arg) => arg.type === "Identifier" && arg.name === "bruteforce"
            )
          ) {
            hasExpressBruteImport = true;
          }
        }
      },

      // Listener for the "exit" event of Program
      "Program:exit": function () {
        // If express-brute is not imported and there is a login route
        if (!hasExpressBruteImport && loginRouteNode) {
          // Reports a problem
          context.report({
            node: loginRouteNode,
            message:
              "Use express-brute middleware for login brute-force protection",
            // Provides a function to fix the code
            fix(fixer) {
              const importText =
                "const ExpressBrute = require('express-brute');\nconst store = new ExpressBrute.MemoryStore();\n";
              const preventMiddlewareText =
                "const bruteforce = new ExpressBrute(store, {\n  freeRetries: 5,\n  minWait: 600 * 1000, // <-- set to 60 minutes per default \n  failCallback: function (req, res, next, nextValidRequestDate) {\n    console.log('Too many failed login attempts. Rate limiting request.');\n    req.flash(\n      'error',\n      'Too many failed login attempts. Please try again later.'\n    );\n    res.redirect('/users/login');\n  },\n});\n\n";

              // Inserts the import statement at the top of the code
              const insertImportFix = fixer.insertTextBeforeRange(
                context.getSourceCode().ast.range,
                importText + preventMiddlewareText
              );
              // Inserts the express-brute middleware in the login route
              const insertBruteforceFix = fixer.insertTextBefore(
                loginRouteNode.arguments[1],
                "bruteforce.prevent, "
              );

              // Returns the fixes
              return [insertImportFix, insertBruteforceFix];
            },
          });
        }
      },
    };
  },
};
