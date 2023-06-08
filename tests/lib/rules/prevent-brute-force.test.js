const rule = require('../../../lib/rules/prevent-brute-force');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({ 
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' } 
});

ruleTester.run('prevent-brute-force', rule, {
  valid: [
    {
      code: `
        const ExpressBrute = require('express-brute');
        const store = new ExpressBrute.MemoryStore();
        const bruteforce = new ExpressBrute(store);
        const router = require('express').Router();
        router.post('/login', bruteforce.prevent, (req, res) => { /* handle request */ });
      `,
    },
  ],

  invalid: [
    {
      code: `
        const router = require('express').Router();
        router.post('/login', (req, res) => { /* handle request */ });
      `,
      errors: [{
        message: 'Use express-brute middleware for login brute-force protection',
      }],
      output: `
        const ExpressBrute = require('express-brute');
        const store = new ExpressBrute.MemoryStore();
        const bruteforce = new ExpressBrute(store, {
          freeRetries: 5,
          minWait: 600 * 1000,
          failCallback: function (req, res, next, nextValidRequestDate) {
            console.log('Too many failed login attempts. Rate limiting request.');
            req.flash(
              'error',
              'Too many failed login attempts. Please try again later.'
            );
            res.redirect('/users/login');
          },
        });

        const router = require('express').Router();
        router.post('/login', bruteforce.prevent, (req, res) => { /* handle request */ });
      `,
    },
  ],
});
