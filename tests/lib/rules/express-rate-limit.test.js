const rule = require('../../../lib/rules/express-rate-limit');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parserOptions: { 
    ecmaVersion: 2015, 
    sourceType: 'module'
  }
});

ruleTester.run('express-rate-limit', rule, {
  valid: [
    {
      code: `
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: "Too many requests from this IP, please try again later",
        });
        const app = require('express')();
        const myRouter = require('./routes/myRouter');
        app.use('/my-route', limiter, myRouter);
      `,
      options: [],
    }
  ],

  invalid: [
    {
      code: `
        const app = require('express')();
        const myRouter = require('./routes/myRouter');
        app.use('/my-route', myRouter);
      `,
      options: [],
      errors: [
        {
          message: 'The express-rate-limit library is required but not imported. Please add it as a dependency.',
        }
      ],
      output: `
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: "Too many requests from this IP, please try again later",
        });
        
        const app = require('express')();
        const myRouter = require('./routes/myRouter');
        app.use('/my-route', limiter, myRouter);
      `
    },
    {
      code: `
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: "Too many requests from this IP, please try again later",
        });
        const app = require('express')();
        const myRouter = require('./routes/myRouter');
        app.use('/my-route', myRouter);
      `,
      options: [],
      errors: [
        {
          message: 'The express-rate-limit library is required but not imported. Please add it as a dependency.',
        }
      ],
      output: `
        const rateLimit = require('express-rate-limit');
        const limiter = rateLimit({
          windowMs: 15 * 60 * 1000,
          max: 100,
          message: "Too many requests from this IP, please try again later",
        });
        const app = require('express')();
        const myRouter = require('./routes/myRouter');
        app.use('/my-route', limiter, myRouter);
      `
    }
  ]
});
