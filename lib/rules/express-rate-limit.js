module.exports = {
  create: function (context) {
    let expressRateLimitImported = false;

    return {
      ImportDeclaration(node) {
        if (node.source.value === 'express-rate-limit') {
          expressRateLimitImported = true;
        }
      },
      'Program:exit': function (node) {
        if (!expressRateLimitImported) {
          context.report({
            node: node,
            message: 'The express-rate-limit library is required but not imported. Please add it as a dependency.',
            fix: function (fixer) {
              const importText = "const rateLimit = require('express-rate-limit');\n";
              const limiterText = [
                "\nconst limiter = rateLimit({",
                "  windowMs: 15 * 60 * 1000, // 15 minutes",
                "  max: 100, // limit each IP to 100 requests per windowMs",
                '  message: "Too many requests from this IP, please try again later",',
                "});\n",
              ].join("\n");

              return fixer.insertTextBeforeRange([0, 0], importText + limiterText);
            },
          });
        }
      },
    };
  },
};
