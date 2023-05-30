const RuleTester = require("eslint").RuleTester;
const rule = require("../../../lib/rules/implicit-flow-rule");

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: "module",
  },
});
describe('Implicit Flow Security Rule Tests', function() {
  it('should pass or fail the tests', function() {
    ruleTester.run("implicit-flow-rule", rule, {
      valid: [

        // TRUE NEGATIVE 

        {

        code: `let rt = response_type=code`,

        }, 

        // FALSE POSITIVE because our rule falsely identifies this as an issue

        {
        code: `const harmlessString = 'This is a tutorial on OAuth2.0, response_type=token is considered less secure than response_type=code.';`,
        }
 

      ],
      invalid: [

        // FALSE NEGATIVE - should have found an error and it did not
        {
          code: `let token = "token";
          const responseType = 'response_type=' + token;
          const url = \`https://api.example.com/auth?\${responseType}\`;
          `,
          errors: [
            { 
              message: "response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow." 
            },
          ],
          output: `let token = "token";
          const responseType = 'response_type=code';
          const url = \`https://api.example.com/auth?\${responseType}\`;
          `
        },
        {
          code: `let token = 'token'; const responseType = 'response_type=' + token; const url = 'https://api.example.com/auth?' + responseType;`,
          errors: [
            { 
              message: "response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow." 
            },
          ],
          output: `let token = 'token'; const responseType = 'response_type=code'; const url = 'https://api.example.com/auth?' + responseType;`
        },



        // TRUE POSITIVE - correctly assumes there is an error and fixes it


        {
          code: `const url = 'https://api.example.com/auth?response_type=token';`,
          errors: [
            { 
              message: "response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow." 
            },
          ],
          output: `const url = 'https://api.example.com/auth?response_type=code';`
        },
        
        {
          code: `let responseType = 'response_type=token'; const url = 'https://api.example.com/auth?' + responseType;`,
          errors: [
            { 
              message: "response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow." 
            },
          ],
          output: `let responseType = 'response_type=code'; const url = 'https://api.example.com/auth?' + responseType;`
        },

        {
          code: `app.get('/login', (req, res) => {
            const scope = 'user-read-private user-read-email';
            res.redirect('https://accounts.spotify.com/authorize' +
              '?response_type=token' + 
              '&client_id=' + clientId +
              (scope ? '&scope=' + encodeURIComponent(scope) : '') +
              '&redirect_uri=' + encodeURIComponent(redirectUri));
          });`,
          errors: [
            { 
              message: "response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow." 
            },
          ],
          output: `app.get('/login', (req, res) => {
            const scope = 'user-read-private user-read-email';
            res.redirect('https://accounts.spotify.com/authorize' +
              '?response_type=code' + 
              '&client_id=' + clientId +
              (scope ? '&scope=' + encodeURIComponent(scope) : '') +
              '&redirect_uri=' + encodeURIComponent(redirectUri));
          });`
        },



      ],
    });
  });
});
