module.exports = {
  rules: {
    sandbox: require("./lib/rules/sandbox.js"),
    "sanitize-dangerouslysetinnerhtml": require("./lib/rules/sanitize-dangerouslysetinnerhtml.js"),
    "secure-protocols": require("./lib/rules/secure-protocols.js"),
    "check-password-hashing": require("./lib/rules/check-password-hashing.js"),
    "prevent-brute-force": require("./lib/rules/prevent-brute-force.js"),
    "enforce-password-policy": require("./lib/rules/enforce-password-policy.js"),
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
        "secure-access/enforce-password-policy": 2,
      },
    },
  },
};
