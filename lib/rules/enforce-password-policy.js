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
  const importText =
    "const axios = require('axios');\nconst passwordValidator = require('password-validator');\n\n";
  
const fetchAndSchemaText =
    "async function createSchema() {\n" +
    "  try {\n" +
    "    const response = await axios.get('https://lucidar.me/en/security/files/100000-most-common-passwords.json');\n" +
    "    const commonPasswords = response.data;\n" +
    "\n" +
    "    const schema = new passwordValidator();\n" +
    "    schema\n" +
    "      .is().min(8)\n" +
    "      .has().uppercase()\n" +
    "      .has().lowercase()\n" +
    "      .has().symbols()\n" +
    "      .has().digits()\n" +
    "      .not().spaces()\n" +
    "      .is().not().oneOf(commonPasswords);\n" +
    "    return schema;\n" +
    "  } catch (error) {\n" +
    "    console.error('Error fetching common passwords:', error);\n" +
    "  }\n" +
    "}\n" +
    "\n" +
    "let schema;\n" +
    "\n" +
    "(async function() {\n" +
    "  schema = await createSchema();\n" +
    "})();\n";
              const insertImportFix = fixer.insertTextBefore(
                context.getSourceCode().ast.body[0],
                  importText + fetchAndSchemaText
              );

              // Insert password validation code after the password length check
              const insertValidationFix = fixer.insertTextAfter(
                passwordLengthCheckNode,
                `
    if (!schema.validate(password)) {
      errors.push({ msg: "Password can be a commonly used password and must be at least 8 characters long and include an uppercase letter, a lowercase letter, a symbol, a digit and must not contain any spaces." });
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
