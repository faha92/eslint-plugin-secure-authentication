// Exporting an ESLint rule module
module.exports = {
  // Method to create the rule
  create: function (context) {
    // Flag to track if express-rate-limit is imported
    let expressRateLimitImported = false;

    // An array to hold nodes where 'app.use' is called
    let appUseNodes = [];

    // Function to check if 'app.use' is called with a limiter
    function checkAppUseForLimiter(node) {
      if (
        node.callee.type === 'MemberExpression' &&
        node.callee.object.name === 'app' &&
        node.callee.property.name === 'use' &&
        node.arguments.length >= 2 &&
        node.arguments[node.arguments.length - 1].type === 'CallExpression' &&
        node.arguments[node.arguments.length - 1].callee.name === 'require' &&
        node.arguments[node.arguments.length - 1].arguments[0].value.startsWith('./routes/')
      ) {
        return true;
      }
      return false;
    }

    // Function to check if a limiter is missing in 'app.use' call
    function isLimiterMissing(node) {
      const args = node.arguments;
      for (const arg of args) {
        if (arg.type === 'Identifier' && arg.name === 'limiter') {
          return false;
        }
      }
      return true;
    }

    // Return an object of selectors and corresponding listener functions
    return {
      // Listener for ImportDeclaration
      ImportDeclaration(node) {
        // If express-rate-limit is imported
        if (node.source.value === 'express-rate-limit') {
          expressRateLimitImported = true;
        }
      },

      // Listener for CallExpression
      CallExpression(node) {
        // If 'app.use' is called with a limiter and the limiter is missing
        if (checkAppUseForLimiter(node) && isLimiterMissing(node)) {
          // Add the node to appUseNodes
          appUseNodes.push(node);
        }
      },

      // Listener for the "exit" event of Program
      'Program:exit': function (node) {
        // If express-rate-limit is not imported and there is an 'app.use' call without a limiter
        if (!expressRateLimitImported && appUseNodes.length > 0) {
          // Reports a problem
          context.report({
            node: node,
            message: 'The express-rate-limit library is required but not imported. Please add it as a dependency.',
            // Provides a function to fix the code
            fix: function (fixer) {
              const importText = "const rateLimit = require('express-rate-limit');\n";

              // Text to add the limiter
              const limiterText = [
                "\nconst limiter = rateLimit({",
                "  windowMs: 15 * 60 * 1000, // 15 minutes",
                "  max: 100, // limit each IP to 100 requests per windowMs",
                '  message: "Too many requests from this IP, please try again later",',
                "});\n",
              ].join("\n");

              // Inserts the import statement at the top of the code
              const importFix = fixer.insertTextBeforeRange([0, 0], importText + limiterText);

              // Inserts the limiter usage in each 'app.use' call without a limiter
              const limiterUsageFixes = appUseNodes.map(appUseNode => fixer.insertTextBefore(appUseNode.arguments[appUseNode.arguments.length - 1], 'limiter, '));

              // Returns the fixes
              return [importFix, ...limiterUsageFixes];
            },
          });
        }
      },
    };
  },
};
