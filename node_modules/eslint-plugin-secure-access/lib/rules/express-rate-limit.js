module.exports = {
  create: function (context) {
    let expressRateLimitImported = false;
    let appUseNodes = [];

    function checkAppUseForLimiter(node) {
      if (node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'app' &&
          node.callee.property.name === 'use' &&
          node.arguments.length >= 2 &&
          node.arguments[node.arguments.length - 1].type === 'CallExpression' &&
          node.arguments[node.arguments.length - 1].callee.name === 'require' &&
          node.arguments[node.arguments.length - 1].arguments[0].value.startsWith('./routes/')) {
        return true;
      }
      return false;
    }

    function isLimiterMissing(node) {
      const args = node.arguments;
      for (const arg of args) {
        if (arg.type === 'Identifier' && arg.name === 'limiter') {
          return false;
        }
      }
      return true;
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === 'express-rate-limit') {
          expressRateLimitImported = true;
        }
      },
      CallExpression(node) {
        if (checkAppUseForLimiter(node) && isLimiterMissing(node)) {
          appUseNodes.push(node);
        }
      },
      'Program:exit': function (node) {
        if (!expressRateLimitImported && appUseNodes.length > 0) {
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

              const importFix = fixer.insertTextBeforeRange([0, 0], importText + limiterText);
              const limiterUsageFixes = appUseNodes.map(appUseNode => fixer.insertTextBefore(appUseNode.arguments[appUseNode.arguments.length - 1], 'limiter, '));

              return [importFix, ...limiterUsageFixes];
            },
          });
        }
      },
    };
  },
};
