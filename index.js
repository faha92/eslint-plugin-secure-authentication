module.exports = {
  rules: {
    "sandbox": require("./lib/rules/sandbox.js"),
    "sanitize-dangerouslysetinnerhtml": require("./lib/rules/sanitize-dangerouslysetinnerhtml.js"),
    "secure-protocols": require("./lib/rules/secure-protocols.js"),
  },
  configs: {
    recommended: {
      plugins: ["react-weblint"],
      rules: {
        "react-weblint/sandbox": 2,
        "react-weblint/https": 2,
        "react-weblint/dangerously": 2,
      },
    },
  },
};
