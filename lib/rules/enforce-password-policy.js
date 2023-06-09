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
    const registrationKeywords = ["register", "signup", "sign_up", "create_account","create-account", "registerUser", "join","new-user","user/new"];

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
          registrationKeywords.some(keyword => node.arguments[0].value.includes(keyword))
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
    const importText = "const passwordValidator = require('password-validator');\n\n";
    const commonPasswordsText = "const commonPasswords = ['123456', 'password', '12345678', 'qwerty', '12345', '1234567', '123456789', '1234567890', 'abc123', '111111', 'password1', '000000', '123123', 'Admin', 'monkey', '1234', '1qaz2wsx', 'dragon', 'sunshine', '112233', 'princess', 'admin', 'welcome', 'football', 'master', 'michael', 'login', 'superman', '11111', 'trustno1', 'passw0rd', 'batman', 'zaq1zaq1', 'qazwsx', '123qwe', '654321', 'solo', 'loveme', '666666', 'angel', 'sunshine', 'abcd1234', 'admin123', 'letmein', 'photoshop', '1234', 'monkey', 'shadow', 'sunshine', '123123', '654321', 'superman', 'qazwsx', 'michael', 'Football', 'password1', 'freedom', '777777', 'passw0rd', 'baseball', '1234567', 'iloveyou', 'princess', 'welcome', 'admin', 'qwerty', 'abc123', 'pussy', '1234567890', '696969', 'ashley', 'fuckme', 'football', 'admin123', 'hunter', 'harley', 'fuckyou', '1234', 'killer', 'jordan', 'jennifer', 'gawker', 'qwerty', 'solo', 'integra', 'master', 'matrix', 'access', 'qwertzuiop', 'pass', '654321', 'superman', 'soledad', 'metallica', 'jessica', 'pepper', '111111', 'iloveyou', 'starwars', 'welcome', 'zaq1zaq1', 'sunshine', '121212', 'dragon', 'hello', 'monkey', 'princess', 'jordan', 'freedom', 'michael', 'master', 'ninja', 'abc123'];\n\n";
    const schemaText = "\n\nconst schema = new passwordValidator();\n\nschema\n  .is().min(8)\n  .has().uppercase()\n  .has().lowercase()\n  .has().symbols()\n  .has().digits()\n  .not().spaces()\n  .is().not().oneOf(commonPasswords);\n";

              const insertImportFix = fixer.insertTextBefore(
                context.getSourceCode().ast.body[0],
                importText + schemaText
              );

              // Insert password validation code after the password length check
              const insertValidationFix = fixer.insertTextAfter(
                passwordLengthCheckNode,
                `
    if (!schema.validate(password)) {
      errors.push({ msg: "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a symbol, a digit and must not contain any spaces." });
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
