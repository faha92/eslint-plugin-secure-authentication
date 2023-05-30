// Importing necessary libraries
const RuleTester = require("eslint").RuleTester;
const rule = require("../../../lib/rules/check-password-hashing");

// Instantiating the RuleTester
const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});
// Running the tests
// Running the tests
//
ruleTester.run("check-password-hashing", rule, {
  valid: [
    {
      code: `
        const bcrypt = require("bcryptjs");
        const password = "plain-text-password";
        const hashedPassword = bcrypt.hashSync(password, 10);
        const user = new User({ username: "user", password: hashedPassword });
        user.save();
      `,
    },
    {
      code: `
      const bcrypt = require('bcryptjs');
      const password = 'my-password';
      const salt = bcrypt.genSaltSync(10);
      const safePassword = bcrypt.hashSync(password, salt);
      const user = new User({ username: 'user', password: safePassword });
      user.save();
      `,
    },
  ],

  invalid: [
    {
      code: `
        const password = "plain-text-password";
        const user = new User({ username: "user", password });
        user.save();
      `,
      errors: [
        {
          message:
            "Do not use plain text passwords. Use hashed passwords instead.",
        },
      ],
    },
    {
      code: `
        const user = new User({ username, password: "password" });
        user.save();
      `,
      errors: [
        {
          message:
            "Do not use plain text passwords. Use hashed passwords instead.",
        },
      ],
    },
    {
      code: `
        const password = "password";
        const user = new User({ username: "user", password });
        user.save();
      `,
      errors: [
        {
          message:
            "Do not use plain text passwords. Use hashed passwords instead.",
        },
      ],
    },
    {
      code: `
        const bcrypt = require('bcryptjs');
        const password = 'my-password';
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);
        const user = new User({ username: 'user', password: password });
        user.save();
      `,
      errors: [
        {
          message:
            "Do not use plain text passwords. Use hashed passwords instead.",
        },
      ],
    },
  ],
});
