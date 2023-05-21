module.exports = {
  rules: {
    "sandbox": require("./lib/rules/sandbox.js"),
    "https": require("./lib/rules/sandbox.js"),
    "dangerously": require("./lib/rules/sandbox.js"),
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
