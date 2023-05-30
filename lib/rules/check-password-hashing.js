module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Ensure passwords are hashed before saving to the database",
      category: "Best Practices",
      recommended: true,
    },
    schema: [],
  },

  create(context) {
    let bcryptImported = false;
    const hashedPasswordVariables = new Set();

    function checkPasswordUsage(node, properties, objectNode) {
      for (const property of properties) {
        if (property.key.name === "password") {
          if (
            property.value.type !== "Identifier" ||
            !hashedPasswordVariables.has(property.value.name)
          ) {
            context.report({
              node: property,
              message:
                "Do not use plain text passwords. Use hashed passwords instead.",
            });
          }
          break;
        }
      }
    }

    return {
      "CallExpression:exit"(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "bcrypt" &&
          node.callee.property.name === "hashSync"
        ) {
          if (
            node.parent.type === "VariableDeclarator" &&
            node.parent.id.type === "Identifier"
          ) {
            hashedPasswordVariables.add(node.parent.id.name);
          }
        }

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

        if (node.type === "ObjectExpression") {
          const properties = node.properties;
          properties.forEach((property) => {
            if (
              property.key.name === "password" &&
              property.value.type === "Identifier" &&
              !hashedPasswordVariables.has(property.value.name)
            ) {
              context.report({
                node: property,
                message:
                  "Do not use plain text passwords. Use hashed passwords instead.",
              });
            }
          });
        }
      },
    };
  },
};
