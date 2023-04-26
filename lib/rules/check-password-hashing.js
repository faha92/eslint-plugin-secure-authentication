const bcrypt = require("bcryptjs");

module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure passwords are hashed before saving to the database",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let bcryptImported = false;
    let objectStart = null;

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.name === "save"
        ) {
          const objectName = node.callee.object.name;
          const variable = context
            .getScope()
            .variables.find((v) => v.name === objectName);

          if (variable && variable.defs[0].node.init.type === "NewExpression") {
            const properties =
              variable.defs[0].node.init.arguments[0].properties;

            for (const property of properties) {
              if (
                property.key.name === "password" &&
                property.value.type === "Identifier" &&
                property.value.name === "password"
              ) {
                context.report({
                  node: property,
                  message:
                    "Do not use plain text passwords. Use hashed passwords instead.",
                  fix(fixer) {
                    // Check if bcrypt import is already in the source code
                    if (!bcryptImported) {
                      objectStart = variable.defs[0].node.range[0];
                      bcryptImported = true;
                      return [
                        fixer.insertTextBeforeRange(
                          [objectStart, objectStart],
                          `const bcrypt = require("bcryptjs");\n`
                        ),
                        fixer.insertTextBeforeRange(
                          [objectStart, objectStart],
                          `const hashedPassword = bcrypt.hashSync(${property.value.name}, 10);\n`
                        ),
                      ];
                    }

                    // Replace password identifier with hashedPassword identifier
                    const hashedPasswordIdentifier = "hashedPassword";

                    return [
                      fixer.replaceText(
                        property.value,
                        hashedPasswordIdentifier
                      ),
                      fixer.insertTextBefore(property, `password: `),
                    ];
                  },
                });
                break;
              }
            }
          }
        }
      },
      VariableDeclaration(node) {
        if (node.declarations[0].init.type === "NewExpression") {
          const properties = node.declarations[0].init.arguments[0].properties;

          for (const property of properties) {
            if (
              property.key.name === "password" &&
              property.value.type === "Identifier" &&
              property.value.name === "password"
            ) {
              context.report({
                node: property,
                message:
                  "Do not use plain text passwords. Use hashed passwords instead.",
                fix(fixer) {
                  // Check if bcrypt import is already in the source code
                  if (!bcryptImported) {
                    objectStart = node.range[0];
                    bcryptImported = true;
                    return [
                      fixer.insertTextBeforeRange(
                        [objectStart, objectStart],
                        `const bcrypt = require("bcryptjs");\n`
                      ),
                      fixer.insertTextBeforeRange(
                        [objectStart, objectStart],
                        `const hashedPassword = bcrypt.hashSync(${property.value.name}, 10);\n`
                      ),
                    ];
                  }

                  // Replace password identifier with hashedPassword identifier
                  const hashedPasswordIdentifier = "hashedPassword";
                  return [
                    fixer.replaceText(property.value, hashedPasswordIdentifier),
                    fixer.insertTextBefore(property, `password: `),
                  ];
                },
              });
            }
          }
        }
      },
    };
  },
};
