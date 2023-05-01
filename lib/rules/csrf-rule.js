module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn if CSRF protection is not used in app.post calls',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    let csurfImported = false;
    let hasAppPostCalls = false;

    return {
      ImportDeclaration(node) {
        if (node.source.value === 'csurf') {
          csurfImported = true;
        }
      },
      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (
            declaration.init &&
            declaration.init.type === 'CallExpression' &&
            declaration.init.callee.name === 'require' &&
            declaration.init.arguments.length > 0 &&
            declaration.init.arguments[0].value === 'csurf'
          ) {
            csurfImported = true;
          }
        });
      },
      CallExpression(node) {
        if (
          node.callee.type === 'MemberExpression' &&
          node.callee.object.name === 'app' &&
          node.callee.property.name === 'post'
        ) {
          hasAppPostCalls = true;
        }
      },
      'Program:exit': function (node) {
        if (hasAppPostCalls && !csurfImported) {
          context.report({
            node,
            message: 'CSRF protection (csurf) is not imported but app.post calls are used',
          });
        }
      },
    };
  },
};
