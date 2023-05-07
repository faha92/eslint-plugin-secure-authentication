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
      ImportDeclaration(node) {
        if (node.source.value === "csrf") {
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
                const csrfLines = `const express = require("express");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const csrf = require("csrf");
const crypto = require("crypto");

const app = express();

const secret = crypto.randomBytes(16).toString("hex");
const tokens = new csrf({ secret });

function csrfMiddleware(req, res, next) {
  const token = tokens.create(secret);
  res.cookie("_csrf", token);
  req.csrfToken = () => token;
  next();
}

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(csrfMiddleware);
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
              message: "Warning: CSRF tokens are being generated but you still need to use tokens.verify() in order to validate the token for each HTTP request.",
            });
          });
        }
      },
    };
  },
};
