const RuleTester = require("eslint").RuleTester;
const rule = require("../rules/your-rule");

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" } // Make sure to adjust this according to your needs
});

ruleTester.run("your-rule", rule, {
  valid: [
    // Example of correct usage: password is hashed before being saved to the object
    {
      code: `
        const bcrypt = require("bcryptjs");
        const password = "plain-text-password";
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = { username: "user", password: hashedPassword };
      `
    },
    // Example of correct usage: no password is used
    {
      code: `
        const user = { username: "user", email: "user@example.com" };
      `
    }
  ],

  invalid: [
    // Example of incorrect usage: password is saved in plain text
    {
      code: `
        const password = "plain-text-password";
        const user = { username: "user", password: password };
      `,
      errors: [
        {
          message: "Do not use plain text passwords. Use hashed passwords instead."
        }
      ],
      // Expected output after the fix
      output: `
        // importing bcrypt 
        const bcrypt = require("bcryptjs");
        const password = "plain-text-password";
        //  Hashing the password using bcrypt with a salt 
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = { username: "user", password: hashedPassword };
      `
    }
  ]
});
