const { RuleTester } = require('eslint');
const rule = require('../../../lib/rules/enforce-password-policy'); // replace with your actual rule file

const ruleTester = new RuleTester({
  parserOptions: { ecmaVersion: 2015, sourceType: "module" },
});
ruleTester.run('enforce-password-policy', rule, {
  valid: [
    // Valid case: both password-validator and register route are present with correct password length check
    {
      code: `
        const passwordValidator = require('password-validator');
        const router = require('express').Router();
        
        const schema = new passwordValidator();
        schema.is().min(8).has().uppercase().has().lowercase().has().symbols().has().digits().not().spaces();
        
        router.post('/register', (req, res) => {
          const { password } = req.body;
          if (password.length < 8) {
            return res.status(400).send('Password must be at least 8 characters');
          }
          if (!schema.validate(password)) {
            return res.status(400).send('Password is not strong enough');
          }
          // Registration logic here...
        });
      `,
    },
  ],
  invalid: [
    // Invalid case: missing password-validator and incorrect password length check
    {
      code: `
        const router = require('express').Router();

        router.post('/register', (req, res) => {
          const { password } = req.body;
          if (password.length < 6) {
            return res.status(400).send('Password must be at least 6 characters');
          }
          // Registration logic here...
        });
      `,
      errors: [
        {
          message: "Use password-validator to enforce strong password policy",
        },
      ],
    },
  ],
});
