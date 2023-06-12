// Exporting an ESLint rule module
module.exports = {
  // Metadata of the rule
  meta: {
    type: "problem",  // Type of the rule
    docs: {
      description: "Ensure strong password policy is enforced for user registration",  // Description of the rule
      category: "Security",  // Category of the rule
      recommended: true,  // Recommends the rule
    },
    schema: [],  // The options schema of the rule
    fixable: "code",  // The rule can fix the code automatically
  },

  // Creates the rule
  create(context) {
    // Flags if password-validator is imported
    let hasPasswordValidatorImport = false;

    // Node of registration route
    let registerRouteNode = null;

    // Node of password length check
    let passwordLengthCheckNode = null;

    // Array of keywords that could represent registration routes
    const registrationKeywords = ["register", "signup", "sign_up", "create_account","create-account", "registerUser", "join","new-user","user/new"];

    // Returns an object of selectors and corresponding listener functions
    return {
      // Listener for ImportDeclaration
      ImportDeclaration(node) {
        // If password-validator is imported
        if (node.source.value === "password-validator") {
          hasPasswordValidatorImport = true;
        }
      },

      // Listener for VariableDeclarator
      VariableDeclarator(node) {
        // If password-validator is required
        if (
          node.init &&
          node.init.callee &&
          node.init.callee.name === "require" &&
          node.init.arguments[0].value === "password-validator"
        ) {
          hasPasswordValidatorImport = true;
        }
      },

      // Listener for CallExpression
      CallExpression(node) {
        // If the callee is a registration route
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.name === "router" &&
          node.callee.property.name === "post" &&
          node.arguments.length > 0 &&
          registrationKeywords.some(keyword => node.arguments[0].value.includes(keyword))
        ) {
          registerRouteNode = node;

          // If the route has a password-validator
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

      // Listener for IfStatement
      IfStatement(node) {
        // If the statement checks if the password length is 8
        if (
          node.test.left &&
          node.test.left.property &&
          node.test.left.property.name === "length" &&
          node.test.right.value === 8
        ) {
          passwordLengthCheckNode = node;
        }
      },

      // Listener for the "exit" event of Program
      "Program:exit": function () {
        // If password-validator is not imported and there is a registration route
        if (!hasPasswordValidatorImport && registerRouteNode) {
          // Reports a problem
          context.report({
            node: registerRouteNode,
            message: "Use password-validator to enforce strong password policy",
            // Provides a function to fix the code
            fix(fixer) {
              const importText =
    "const axios = require('axios');\nconst passwordValidator = require('password-validator');\n\n";

              // Import axios and password-validator and create the password validator
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

              // Insert the import statements and password validator at the top of the file
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

              // Returns the fixes
              return [insertImportFix, insertValidationFix];
            },
          });
        }
      },
    };
  },
};
