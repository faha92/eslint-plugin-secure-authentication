module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Warn if CSRF protection is not used in app.post calls",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let csrfImported = false;
    let appPostNodes = [];

    return {
      ImportDeclaration(node) {
        if (node.source.value === "csurf") {
          csrfImported = true;
        }
      },
      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (
            declaration.init &&
            declaration.init.type === "CallExpression" &&
            declaration.init.callee.name === "require" &&
            declaration.init.arguments.length > 0 &&
            declaration.init.arguments[0].value === "csurf"
          ) {
            csrfImported = true;
          }
        });
      },
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "app" &&
          node.callee.property.name === "post"
        ) {
          appPostNodes.push(node);
        }
      },
      "Program:exit": function (node) {
        if (!csrfImported) {
          appPostNodes.forEach((appPostNode) => {
            context.report({
              node: appPostNode,
              message: "CSRF protection (csurf) is not imported but app.post calls are used",
              fix(fixer) {
                const csrfLines = `const csrf = require("csurf");\napp.use(csrf({\n  cookie: {\n    httpOnly: true,\n    secure: process.env.NODE_ENV === 'production',\n    sameSite: 'Strict'\n  }\n}));\n`;
                const firstNode = context.getSourceCode().ast.body[0];

                return fixer.insertTextBefore(firstNode, csrfLines);
              },
            });
          });
        }
      },
    };
  },
};