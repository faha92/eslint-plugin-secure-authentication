module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow insecure password storage",
      category: "Security",
      recommended: true,
    },
    fixable: "code",
  },
  create: function (context) {
    return {
      VariableDeclarator: function (node) {
        if (
          node.id.name === "password" &&
          node.init.type === "Literal" &&
          typeof node.init.value === "string"
        ) {
          context.report({
            node: node,
            message: "Insecure password storage",
            fix: function (fixer) {
              const bcryptImport = "const bcrypt = require('bcryptjs');\n";
              const hashedPassword = bcrypt.hashSync(node.init.value, 10);
              const fixedCode =
                bcryptImport +
                node.sourceCode.substring(0, node.init.start) +
                `'${hashedPassword}'` +
                node.sourceCode.substring(node.init.end);
              return fixer.replaceTextRange([node.start, node.end], fixedCode);
            },
          });
        }
      },
    };
  },
};
