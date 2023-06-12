// Exporting an ESLint rule module
module.exports = {
  // Metadata of the rule
  meta: {
    type: "problem",  // Type of the rule
    docs: {
      description: "Ensure passwords are hashed before saving to the database",  // Description of the rule
      category: "Best Practices",  // Category of the rule
      recommended: true,  // Recommends the rule
    },
    fixable: "code",  // The rule can fix the code automatically
    schema: [],  // The options schema of the rule
  },

  // Creates the rule
  create(context) {
    // Flags if bcrypt is imported
    let bcryptImported = false;

    // Function to check if properties include sensitive information and if so, report it
    function checkPasswordUsage(node, properties, objectNode) {
      for (const property of properties) {
        // Array of keywords that could represent sensitive information
        const keywords = ["password", "pw", "pwd", "pass", "secret"];

        // Function to check for req.body in nested member expressions
        const checkNestedMemberExpressions = (currentNode) => {
          // If the currentNode is a MemberExpression and it's of the form req.body, it's sensitive information
          if (currentNode.type === "MemberExpression") {
            if (currentNode.object.name === "req" && currentNode.property.name === "body") {
              return true;
            }
            // Recursively check for nested member expressions
            return checkNestedMemberExpressions(currentNode.object) || (currentNode.property && checkNestedMemberExpressions(currentNode.property));
          }
          return false;
        }

        // Check if property value is a MemberExpression and it includes a password keyword
        const isReqBodyPassword = 
          property.value.type === "MemberExpression" &&
          checkNestedMemberExpressions(property.value) &&
          keywords.some(keyword => property.key.name.toLowerCase().includes(keyword));
        
        // Checks if the property key name includes a password keyword, isn't hashed, and its value is an Identifier, a string literal or request body password
        if (
          /(password|pw|pwd|psw|pass|login|key|secret)/i.test(property.key.name)  &&
          !(property.value.type === "Identifier" && property.value.name === "hashedPassword") &&
          (property.value.type === "Identifier" ||
            (property.value.type === "Literal" && typeof property.value.value === "string") || isReqBodyPassword)
        ) {
          // Reports a problem
          context.report({
            node: property,
            message: "Do not use plain text passwords. Use hashed passwords instead.",

            // Provides a function to fix the code
            fix(fixer) {
              const fixes = [];

              // If bcrypt is not imported yet
              if (!bcryptImported) {
                // Get all import declarations
                const importNodes = context
                  .getSourceCode()
                  .ast.body.filter(
                    (n) =>
                      n.type === "ImportDeclaration" ||
                      n.type === "VariableDeclaration"
                  );

                // If bcrypt is not declared
                if (
                  !importNodes.some(
                    (n) =>
                      n.type === "VariableDeclaration" &&
                      n.declarations.some((d) => d.id.name === "bcrypt")
                  )
                ) {
                  // Get the last import node
                  const lastImportNode = importNodes[importNodes.length - 1];
                  const lastImportEnd = lastImportNode.range[1];

                  // Insert the import declaration of bcrypt after the last import declaration
                  fixes.push(
                    fixer.insertTextAfterRange(
                      [lastImportEnd, lastImportEnd],
                      `\n // importing bcrypt \nconst bcrypt = require("bcryptjs");`
                    )
                  );
                }
                // Set bcrypt as imported
                bcryptImported = true;
              }

              // Get the password value
              const passwordValue = property.value.type === "Literal" ? `"${property.value.value}"` : property.value.name;

              // Declare the hashed password
              const hashedPasswordDeclaration = `//  Hashing the password using bcrypt with a salt \nconst hashedPassword = bcrypt.hashSync(${passwordValue}, 10);`;

              // Insert the hashed password declaration before the object node and replace the password value with the hashed password
              fixes.push(
                fixer.insertTextBefore(
                  objectNode,
                  `${hashedPasswordDeclaration}\n`
                ),
                fixer.replaceText(property, `${property.key.name}: hashedPassword`)
              );

              // Return the fixes
              return fixes;
            },
          });
        }
      }
    }

    // Returns an object of selectors and corresponding listener functions
    return {
      // Listener for the "exit" event of VariableDeclaration
      "VariableDeclaration:exit"(node) {
        // Check each variable declaration
        node.declarations.forEach(declaration => {
          // If the variable is a new User object
          if (
            declaration.init &&
            declaration.init.type === "NewExpression" &&
            declaration.init.callee.name === "User"
          ) {
            // Get the properties of the object
            const properties = declaration.init.arguments[0].properties;
            // Check the usage of passwords
            checkPasswordUsage(node, properties, declaration);
          }
        });
      },

      // Listener for the "exit" event of CallExpression
      "CallExpression:exit"(node) {
        // If the callee is a method of saving
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.name === "save"
        ) {
          // Get the object name
          const objectName = node.callee.object.name;

          // Find the variable declaration of the object
          const variable = context
            .getScope()
            .variables.find((v) => v.name === objectName);

          // If the variable is a new User object
          if (variable && variable.defs[0].node.init.type === "NewExpression") {
            // Get the properties of the object
            const properties =
              variable.defs[0].node.init.arguments[0].properties;

            // Check the usage of passwords
            checkPasswordUsage(node, properties, variable.defs[0].node.parent);
          }
        }
      },
    };
  },
};
