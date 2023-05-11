// Export a module which contains metadata and function to check password usage in code
module.exports = {
  // Metadata about the module
  meta: {
    // Type of problem the module is designed to solve
    type: "problem",
    // Documentation about the module
    docs: {
      // Description of what the module does
      description: "Ensure passwords are hashed before saving to the database",
      // Category under which the module falls
      category: "Best Practices",
      // Whether or not this rule is recommended
      recommended: true,
    },
    // Whether this problem is fixable by the module
    fixable: "code",
    // Configuration schema for the rule
    schema: [],
  },

  // Function to check the usage of password in the code
  create(context) {
    // Flag to check if bcrypt is already imported
    let bcryptImported = false;

    // Function to check if password is being used in plain text
    function checkPasswordUsage(node, properties, objectNode) {
      // Loop over properties of the object to check for 'password'
      for (const property of properties) {
        // If the password property is found and it's value is 'password'
        if (
          property.key.name === "password" &&
          property.value.type === "Identifier" &&
          property.value.name === "password"
        ) {
          // Report the issue to the user
          context.report({
            // Node in the AST where the problem was found
            node: property,
            // The message to display to the user
            message:
              "Do not use plain text passwords. Use hashed passwords instead.",
            // Function to fix the problem
            fix(fixer) {
              // Array to hold the fixes
              const fixes = [];

              // If bcrypt has not been imported, add it
              if (!bcryptImported) {
                // Get all import and variable declaration nodes
                const importNodes = context
                  .getSourceCode()
                  .ast.body.filter(
                    (n) =>
                      n.type === "ImportDeclaration" ||
                      n.type === "VariableDeclaration"
                  );
                // Check if bcrypt is already imported
                if (
                  !importNodes.some(
                    (n) =>
                      n.type === "VariableDeclaration" &&
                      n.declarations.some((d) => d.id.name === "bcrypt")
                  )
                ) {
                  // Get the last import node
                  const lastImportNode = importNodes[importNodes.length - 1];
                  // Get the position to insert the bcrypt import
                  const lastImportEnd = lastImportNode.range[1];
                  // Add the bcrypt import to the fixes
                  fixes.push(
                    fixer.insertTextAfterRange(
                      [lastImportEnd, lastImportEnd],
                      `\n // importing bcrypt \nconst bcrypt = require("bcryptjs");`
                    )
                  );
                }
                // Set the flag to true indicating bcrypt has been imported
                bcryptImported = true;
              }

              // String containing the code to hash the password
              const hashedPasswordDeclaration = `//  Hashing the password using bcrypt with a salt \nconst hashedPassword = bcrypt.hashSync(${property.value.name}, 10);`;

              // Add the hashed password declaration and replacement to the fixes
              fixes.push(
                fixer.insertTextBefore(
                  objectNode,
                  `${hashedPasswordDeclaration}\n`
                ),
                fixer.replaceText(property, `password: hashedPassword`)
              );

              // Return the fixes
              return fixes;
            },
          });
          // Exit the loop once password property is found and fixed
          break;
        }
     
