const RuleTester = require("eslint").RuleTester;
const rule = require("../../../lib/rules/secure-cookie-rule");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
});
describe('Cookie Security Rule Tests', function() {
  it('should pass or fail the tests', function() {
    ruleTester.run("cookie-security", rule, {
      valid: [

        // TRUE NEGATIVE 

        {

        code: `res.cookie('name', 'value', { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: "Strict" });`,

        }, 

        // FALSE POSITIVE because our rule falsely identifies this as an issue

        {
        code: `res.cookie('name', 'value', {  maxAge: 15 * 60 * 1000, httponly: true, sameSite: "Strict" });`,
        },
        {code: ` res.cookie('name', {  httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "Strict", })`
      }

      ],
      invalid: [

        // FALSE NEGATIVE - should have found an error and it did not
        {
          code: `app.use(session({
            secret: 'session secret',
            resave: false,
            saveUninitialized: true,
            cookie: {  httpOnly: true, sameSite: "Strict" } // 
          })); `,
          errors: [
            { message: "Missing secure attributes in the session cookie" },
          ]
          
          
        },

        {code: `res.writeHead(200, {
          'Set-Cookie': 'myCookie=myValue; Max-Age=900; HttpOnly; SameSite=Strict',
          'Content-Type': 'text/plain'
        }); `,
        
        errors: [
          { message: "Missing secure attributes in the header options" },
        ]
        
        
        },

        // TRUE POSITIVE - correctly assumes there is an error and fixes it


        {
          code: `res.cookie('name', 'value');`,
          output: `res.cookie('name', 'value', { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: "Strict" });`,
          errors: [{ message: "Missing secure attributes in res.cookie options" }]
        },
        {
          code: `res.cookie('name', 'value', {  httpOnly: true, sameSite: "Strict" });`,
          output: `res.cookie('name', 'value', {  httpOnly: true, sameSite: "Strict", maxAge: 15 * 60 * 1000 });`,
          errors: [{ message: "Missing secure attributes in res.cookie options" }]
        },
        {
          code: `res.cookie('name', 'value', {  httpOnly: true, });`,
          output: `res.cookie('name', 'value', {  httpOnly: true, maxAge: 15 * 60 * 1000, sameSite: "Strict", });`,
          errors: [{ message: "Missing secure attributes in res.cookie options" }]
        },
        {
          code: `res.cookie('name', 'value', {  });`,
          output: `res.cookie('name', 'value', { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: "Strict" });`,
          errors: [{ message: "Missing secure attributes in res.cookie options" }]
        },


      ],
    });
  });
});
