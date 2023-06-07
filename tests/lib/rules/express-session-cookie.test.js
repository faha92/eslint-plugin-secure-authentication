const rule = require('../../../lib/rules/express-session-cookie');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({ 
  parserOptions: { ecmaVersion: 2015, sourceType: 'module' } 
});

ruleTester.run('express-session-cookie', rule, {
  valid: [
    {
      code: `
        const session = require('express-session');
        app.use(session({
          secret: 'mysecret',
          cookie: { secure: true, httpOnly: true, sameSite: 'lax' }
        }));
      `,
    },
  ],

  invalid: [
    {
      code: `
        const session = require('express-session');
        app.use(session({ secret: 'mysecret' }));
      `,
      errors: [{
        message: 'The session cookie is missing recommended properties. Please add "secure", "httpOnly", and "sameSite" properties to the cookie object.',
      }],
      output: `
        const session = require('express-session');
        app.use(session({ 
          secret: 'mysecret',
          cookie: { secure: true, httpOnly: true, sameSite: "lax" } 
        }));
      `,
    },
    {
      code: `
        const session = require('express-session');
        app.use(session({ 
          secret: 'mysecret',
          cookie: { httpOnly: true } 
        }));
      `,
      errors: [{
        message: 'The session cookie is missing recommended properties. Please add "secure", "httpOnly", and "sameSite" properties to the cookie object.',
      }],
      output: `
        const session = require('express-session');
        app.use(session({ 
          secret: 'mysecret',
          cookie: { httpOnly: true, secure: true, sameSite: "lax" } 
        }));
      `,
    },
  ],
});
