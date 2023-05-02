module.exports = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Ensure strong password policy is enforced for user registration",
      category: "Security",
      recommended: true,
    },
    schema: [],
    fixable: "code",
  },

  create(context) {
    let hasPasswordValidatorImport = false;
    let registerRouteNode = null;
    let passwordLengthCheckNode = null;

    return {
      ImportDeclaration(node) {
        if (node.source.value === "password-validator") {
          hasPasswordValidatorImport = true;
        }
      },

      VariableDeclarator(node) {
        if (
          node.init &&
          node.init.callee &&
          node.init.callee.name === "require" &&
          node.init.arguments[0].value === "password-validator"
        ) {
          hasPasswordValidatorImport = true;
        }
      },

      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "router" &&
          node.callee.property.name === "post" &&
          node.arguments.length > 0 &&
          node.arguments[0].value === "/register"
        ) {
          registerRouteNode = node;

          if (
            node.arguments.some(
              (arg) =>
                arg.type === "Identifier" && arg.name === "passwordValidator"
            )
          ) {
            hasPasswordValidatorImport = true;
          }
        }
      },

      IfStatement(node) {
        if (
          node.test.left &&
          node.test.left.property &&
          node.test.left.property.name === "length" &&
          node.test.right.value === 8
        ) {
          passwordLengthCheckNode = node;
        }
      },

      "Program:exit": function () {
        if (!hasPasswordValidatorImport && registerRouteNode) {
          context.report({
            node: registerRouteNode,
            message: "Use password-validator to enforce strong password policy",
            fix(fixer) {
              const importText =
                "const passwordValidator = require('password-validator');\n\n";
              const schemaText =
                "const schema = new passwordValidator();\n\nschema\n  .is().min(8)\n  .has().uppercase()\n  .has().lowercase()\n  .has().symbols()\n  .has().digits()\n  .not().spaces();\n\n";

              const insertImportFix = fixer.insertTextBefore(
                context.getSourceCode().ast.body[0],
                importText + schemaText
              );

              // Insert password validation code after the password length check
              const insertValidationFix = fixer.insertTextAfter(
                passwordLengthCheckNode,
                `
    if (!schema.validate(password)) {
      errors.push({ msg: "Password must be at least 8 characters long and include uppercase and lowercase letters, as well as at least one special character" });
    }
                `
              );

              return [insertImportFix, insertValidationFix];
            },
          });
        }
      },
    };
  },
};
