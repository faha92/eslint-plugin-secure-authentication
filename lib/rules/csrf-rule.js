module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Warn if CSRF protection is not used in HTTP requests.",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let csrfImported = false;
    let httpRequestNodes = [];

    return {

      VariableDeclaration(node) {
        node.declarations.forEach((declaration) => {
          if (
            declaration.init &&
            declaration.init.type === "CallExpression" &&
            declaration.init.callee.name === "require" &&
            declaration.init.arguments.length > 0 &&
            declaration.init.arguments[0].value === "csrf"
          ) {
            csrfImported = true;
          }
        });
      },
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "app" &&
          ["get", "post", "put", "delete"].includes(node.callee.property.name)
        ) {
          httpRequestNodes.push(node);
        }
      },
      "Program:exit": function (node) {
        if (!csrfImported) {
          httpRequestNodes.forEach((httpRequestNode) => {
            context.report({
              node: httpRequestNode,
              message: "CSRF protection (csrf) is not imported but HTTP requests are being made",
              fix(fixer) {
                const csrfLines = `const express = require('express');
                const session = require('express-session');
                const csrf = require('csrf');
                const bodyParser = require('body-parser');
                const crypto = require('crypto');
                
                const app = express();
                
                const secret = crypto.randomBytes(16).toString('hex');
                const tokens = new csrf({ secret });
                
                app.use(session({
                  secret: 'session secret',
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true } // 
                }));
                
                app.use(bodyParser.urlencoded({ extended: false }));
                
                app.use((req, res, next) => {
                  if (!req.session.csrfToken) {
                    req.session.csrfToken = tokens.create(secret);
                  }
                  res.locals.csrfToken = req.session.csrfToken;
                  next();
                });
`;
                const firstNode = context.getSourceCode().ast.body[0];

                return fixer.insertTextBefore(firstNode, csrfLines);
              },
            });
          });
        }

        if (csrfImported) {
          httpRequestNodes.forEach((httpRequestNode) => {
            context.report({
              node: httpRequestNode,
              message: "Warning: CSRF tokens are being generated but you still need to use "
              + " tokens.verify() in order to validate the token for each HTTP request.",
            });
          });
        }
      },
    };
  },
};
