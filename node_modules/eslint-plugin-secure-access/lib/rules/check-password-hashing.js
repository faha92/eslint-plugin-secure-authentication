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
                const importNodes = context.getSourceCode().ast.body.filter(n => n.type === 'ImportDeclaration' || n.type === 'VariableDeclaration');
                if (!importNodes.some(n => n.type === 'VariableDeclaration' && n.declarations.some(d => d.id.name === 'bcrypt'))) {
                  const lastImportNode = importNodes[importNodes.length - 1];
                  const lastImportEnd = lastImportNode.range[1];
                  fixes.push(
@@ -57,10 +45,7 @@ module.exports = {
              const hashedPasswordDeclaration = `//  Hashing the password using bcrypt with a salt \nconst hashedPassword = bcrypt.hashSync(${property.value.name}, 10);`;

              fixes.push(
                fixer.insertTextBefore(
                  objectNode,
                  `${hashedPasswordDeclaration}\n`
                ),
                fixer.insertTextBefore(objectNode, `${hashedPasswordDeclaration}\n`),
                fixer.replaceText(property, `password: hashedPassword`)
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
            checkPasswordUsage(node, properties, variable.defs[0].node.parent);
          }
        }
      },
    };
  },
};
