module.exports = {
  rules: {
    "sandbox": require("./lib/rules/sandbox.js"),
    "https": require("./lib/rules/sanitize-dangerouslysetinnerhtml.js"),
    "dangerously": require("./lib/rules/secure-protocols.js"),
  },
  configs: {
    recommended: {
      plugins: ["researchRules"],
      rules: {
        "researchRules/sandbox": 2,
        "researchRules/https": 2,
        "researchRules/dangerously": 2,
      },
    },
  },
};
