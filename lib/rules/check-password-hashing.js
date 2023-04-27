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

    function checkPasswordUsage(node, properties) {
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
              const fixes = [];

              if (!bcryptImported) {
                objectStart = node.range[0];
                bcryptImported = true;
                fixes.push(
                  fixer.insertTextBeforeRange(
                    [objectStart, objectStart],
                    `const bcrypt = require("bcryptjs");\n`
                  ),
                  fixer.insertTextBeforeRange(
                    [objectStart, objectStart],
                    `const hashedPassword = bcrypt.hashSync(${property.value.name}, 10);\n`
                  )
                );
              }

              const hashedPasswordIdentifier = "hashedPassword";
              fixes.push(
                fixer.replaceText(property.value, hashedPasswordIdentifier),
                fixer.insertTextBefore(property, `password: `)
              );

              return fixes;
            },
          });
          break;
        }
      }
    }

    return {
      "CallExpression:exit"(node) {
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
            checkPasswordUsage(node, properties);
          }
        }
      },
    };
  },
};
