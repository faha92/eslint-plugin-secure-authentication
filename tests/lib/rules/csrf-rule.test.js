const RuleTester = require('eslint').RuleTester;
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
});
const csrfProtectionRule = require('../../../lib/rules/csrf-rule');


describe('Csrf test', function() {
  it('should pass or fail the tests', function() {
ruleTester.run("csrf-protection", csrfProtectionRule, {
  
  valid: [
      // TRUE NEGATIVE 

    {
      code: `require('csrf');`
    },

    { 
      code: ` 
      const csrf = require('csrf');
      const express = require('express');
      const app = express();
      const tokens = new csrf();
  
      app.get('/', (req, res) => {
        if (!req.session.csrfToken) {
          req.session.csrfToken = tokens.create();
        }
        res.locals.csrfToken = req.session.csrfToken;
        res.send('Success');
      }); `
    
    },
    // FALSE POSITIVE because our rule falsely identifies this as an issue
     {
      code: ` 
      const csrf1 = require('my-custom-csrf-protection');
      const express1 = require('express');
      const app1 = express();
      const tokens1 = new csrf();

      app.get('/', (req, res) => {
        if (!req.session.csrfToken) {
          req.session.csrfToken = tokens1.create();
        }
        res.locals.csrfToken = req.session.csrfToken;
        res.send('Success');
      }); `
    },
     {
      code: ` 
      import csrf2 from 'csrf';
      const express2 = require('express');
      const app2 = express();
      const tokens2 = new csrf();

      app.get('/', (req, res) => {
        if (!req.session.csrfToken) {
          req.session.csrfToken = tokens2.create();
        }
        res.locals.csrfToken = req.session.csrfToken;
        res.send('Success');
      }); `
    },

  ],


  // FALSE NEGATIVE - should have found an error and it did not


  invalid:  [
    {
      code: `
        const express = require('express');
        const csrf = require('csrf');
        const app = express();
  
        app.post('/', (req, res) => {
          res.send('Success');
        });
      `,
      errors: [
        { message: "CSRF protection (csrf) is imported but not properly implemented." },
      ]
    },

    // TRUE POSITIVE - correctly assumes there is an error and fixes it

    {
      code: `app.get();`,
      output: `const express = require('express');
                const session = require('express-session');
                const csrf = require('csrf');
                const bodyParser = require('body-parser');
                const crypto = require('crypto');
                
                const app = express();
                
                const secret = crypto.randomBytes(16).toString('hex');
                const tokens = new csrf({ secret });
                
                app.use(session({
                  secret: 'session secret',
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true } // 
                }));
                
                app.use(bodyParser.urlencoded({ extended: false }));
                
                app.use((req, res, next) => {
                  if (!req.session.csrfToken) {
                    req.session.csrfToken = tokens.create(secret);
                  }
                  res.locals.csrfToken = req.session.csrfToken;
                  next();
                });
app.get();`,
      errors: [{ message: "CSRF protection (csrf) is not imported but HTTP requests are being made" }]
    },
    {
      code: `app.put();`,
      output: `const express = require('express');
                const session = require('express-session');
                const csrf = require('csrf');
                const bodyParser = require('body-parser');
                const crypto = require('crypto');
                
                const app = express();
                
                const secret = crypto.randomBytes(16).toString('hex');
                const tokens = new csrf({ secret });
                
                app.use(session({
                  secret: 'session secret',
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true } // 
                }));
                
                app.use(bodyParser.urlencoded({ extended: false }));
                
                app.use((req, res, next) => {
                  if (!req.session.csrfToken) {
                    req.session.csrfToken = tokens.create(secret);
                  }
                  res.locals.csrfToken = req.session.csrfToken;
                  next();
                });
app.put();`,
      errors: [{ message: "CSRF protection (csrf) is not imported but HTTP requests are being made" }]
    },
    {
      code: `app.post();`,
      output: `const express = require('express');
                const session = require('express-session');
                const csrf = require('csrf');
                const bodyParser = require('body-parser');
                const crypto = require('crypto');
                
                const app = express();
                
                const secret = crypto.randomBytes(16).toString('hex');
                const tokens = new csrf({ secret });
                
                app.use(session({
                  secret: 'session secret',
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true } // 
                }));
                
                app.use(bodyParser.urlencoded({ extended: false }));
                
                app.use((req, res, next) => {
                  if (!req.session.csrfToken) {
                    req.session.csrfToken = tokens.create(secret);
                  }
                  res.locals.csrfToken = req.session.csrfToken;
                  next();
                });
app.post();`,
      errors: [{ message: "CSRF protection (csrf) is not imported but HTTP requests are being made" }]
    },
    {
      code: `app.delete();`,
      output: `const express = require('express');
                const session = require('express-session');
                const csrf = require('csrf');
                const bodyParser = require('body-parser');
                const crypto = require('crypto');
                
                const app = express();
                
                const secret = crypto.randomBytes(16).toString('hex');
                const tokens = new csrf({ secret });
                
                app.use(session({
                  secret: 'session secret',
                  resave: false,
                  saveUninitialized: true,
                  cookie: { secure: true } // 
                }));
                
                app.use(bodyParser.urlencoded({ extended: false }));
                
                app.use((req, res, next) => {
                  if (!req.session.csrfToken) {
                    req.session.csrfToken = tokens.create(secret);
                  }
                  res.locals.csrfToken = req.session.csrfToken;
                  next();
                });
app.delete();`,
      errors: [{ message: "CSRF protection (csrf) is not imported but HTTP requests are being made" }]
    },


  ]





//  if (csrfImported) {
//   httpRequestNodes.forEach((httpRequestNode) => {
//     context.report({
//       node: httpRequestNode,
//       message: "Warning: CSRF tokens are being generated but you still need to use "
//       + " tokens.verify() in order to validate the token for each HTTP request.",
//     });
//   });
// }
});
});
});

