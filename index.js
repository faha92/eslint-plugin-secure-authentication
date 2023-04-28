module.exports = {
  rules: {
    sandbox: require("./lib/rules/sandbox.js"),
    "sanitize-dangerouslysetinnerhtml": require("./lib/rules/sanitize-dangerouslysetinnerhtml.js"),
    "secure-protocols": require("./lib/rules/secure-protocols.js"),
    "check-password-hashing": require("./lib/rules/check-password-hashing.js"),
    "prevent-bruteforce": require("./lib/rules/prevent-bruteforce.js"),
  },
  configs: {
    recommended: {
      plugins: ["secure-access"],
      rules: {
        "secure-access/sandbox": 2,
        "secure-access/secure-protocols": 2,
        "secure-access/sanitize-dangerouslysetinnerhtml": 2,
        "secure-access/check-password-hashing": 2,
        "secure-access/prevent-bruteforce": 2,
      },
    },
  },
};
