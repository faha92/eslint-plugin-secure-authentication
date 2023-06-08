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

    function checkPasswordUsage(node, properties, objectNode) {
      for (const property of properties) {
        if (
          /(password|pw|pwd|psw|pass|login|key|secret)/i.test(property.key.name)  &&
          !(property.value.type === "Identifier" && property.value.name === "hashedPassword") &&
          (property.value.type === "Identifier" ||
            (property.value.type === "Literal" && typeof property.value.value === "string"))
        ) {
          context.report({
            node: property,
            message:
              "Do not use plain text passwords. Use hashed passwords instead.",
            fix(fixer) {
              const fixes = [];

              if (!bcryptImported) {
                const importNodes = context
                  .getSourceCode()
                  .ast.body.filter(
                    (n) =>
                      n.type === "ImportDeclaration" ||
                      n.type === "VariableDeclaration"
                  );
                if (
                  !importNodes.some(
                    (n) =>
                      n.type === "VariableDeclaration" &&
                      n.declarations.some((d) => d.id.name === "bcrypt")
                  )
                ) {
                  const lastImportNode = importNodes[importNodes.length - 1];
                  const lastImportEnd = lastImportNode.range[1];
                  fixes.push(
                    fixer.insertTextAfterRange(
                      [lastImportEnd, lastImportEnd],
                      `\n // importing bcrypt \nconst bcrypt = require("bcryptjs");`
                    )
                  );
                }
                bcryptImported = true;
              }

              const passwordValue = property.value.type === "Literal" ? `"${property.value.value}"` : property.value.name;
              const hashedPasswordDeclaration = `//  Hashing the password using bcrypt with a salt \nconst hashedPassword = bcrypt.hashSync(${passwordValue}, 10);`;

              fixes.push(
                fixer.insertTextBefore(
                  objectNode,
                  `${hashedPasswordDeclaration}\n`
                ),
                fixer.replaceText(property, `${property.key.name}: hashedPassword`)
              );

              return fixes;
            },
          });
        }
      }
    }

    return {
      "VariableDeclaration:exit"(node) {
        node.declarations.forEach(declaration => {
          if (
            declaration.init &&
            declaration.init.type === "NewExpression" &&
            declaration.init.callee.name === "User"
          ) {
            const properties = declaration.init.arguments[0].properties;
            checkPasswordUsage(node, properties, declaration);
          }
        });
      },
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
            checkPasswordUsage(node, properties, variable.defs[0].node.parent);
          }
        }
      },
    };
  },
};
