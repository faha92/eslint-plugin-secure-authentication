module.exports = {
  rules: {
    sandbox: require("./lib/rules/sandbox.js"),
    "sanitize-dangerouslysetinnerhtml": require("./lib/rules/sanitize-dangerouslysetinnerhtml.js"),
    "secure-protocols": require("./lib/rules/secure-protocols.js"),
    "check-password-hashing": require("./lib/rules/check-password-hashing.js"),
    "prevent-brute-force": require("./lib/rules/prevent-brute-force.js"),
    "express-rate-limit": require("./lib/rules/express-rate-limit.js"),
    "express-session-cookie": require("./lib/rules/express-session-cookie.js"),
    "enforce-password-policy": require("./lib/rules/enforce-password-policy.js"),
    "secure-cookie-rule": require("./lib/rules/secure-cookie-rule.js"),
    "csrf-rule": require("./lib/rules/csrf-rule.js"),
    "implicit-flow-rule": require("./lib/rules/implicit-flow-rule.js"),
   
  },
  configs: {
    recommended: {
      plugins: ["secure-authentication"],
      rules: {
        "secure-authentication/sandbox": 2,
        "secure-authentication/secure-protocols": 2,
        "secure-authentication/sanitize-dangerouslysetinnerhtml": 2,
        "secure-authentication/check-password-hashing": 2,
        "secure-authentication/prevent-brute-force": 2,
        "secure-authentication/express-rate-limit": 2,
        "secure-authentication/express-session-cookie": 2,
        "secure-authentication/enforce-password-policy": 2,
        "secure-authentication/secure-cookie-rule":2,
        "secure-authentication/csrf-rule":2,
        "secure-authentication/implicit-flow-rule": 2,
      
      },
    },
  },
};
