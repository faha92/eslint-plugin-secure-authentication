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
      plugins: ["secure-access"],
      rules: {
        "secure-access/sandbox": 2,
        "secure-access/secure-protocols": 2,
        "secure-access/sanitize-dangerouslysetinnerhtml": 2,
        "secure-access/check-password-hashing": 2,
        "secure-access/prevent-brute-force": 2,
        "secure-access/express-rate-limit": 2,
        "secure-access/express-session-cookie": 2,
        "secure-access/enforce-password-policy": 2,
        "secure-access/secure-cookie-rule":2,
        "secure-access/csrf-rule":2,
        "secure-access/implicit-flow-rule": 2,
      
      },
    },
  },
};
