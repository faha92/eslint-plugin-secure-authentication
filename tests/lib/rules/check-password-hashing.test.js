const RuleTester = require("eslint").RuleTester;
const rule = require("../../lib/rules/check-password-hashing");


const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2022, sourceType: "module" } // Adjust this according to your needs
});

ruleTester.run("check-password-hashing", rule, {
  valid: [
    {
      code: `
        const bcrypt = require("bcryptjs");
        const password = "plain-text-password";
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = { username: "user", password: hashedPassword };
      `
    },
    {
      code: `
        const user = { username: "user", email: "user@example.com" };
      `
    }
  ],

  invalid: [
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
