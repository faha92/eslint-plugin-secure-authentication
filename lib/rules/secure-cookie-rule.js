module.exports = {
  meta: {
    type: "problem",
    docs: {
      description: "Check for missing cookie security attributes",
      category: "Possible Errors",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },
  create: function (context) {
    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "cookie"
        ) {
          const optionsIndex = node.arguments.length >= 3 ? 2 : -1;
          const options =
            optionsIndex !== -1 && node.arguments[optionsIndex].type === "ObjectExpression"
              ? node.arguments[optionsIndex]
              : null;

          let hasExpiresOrMaxAge = false;
          let hasHttpOnly = false;
          let hasSameSite = false;

          if (options) {
            options.properties.forEach((property) => {
              if (
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                (property.key.name === "Expires" || property.key.name === "maxAge")
              ) {
                hasExpiresOrMaxAge = true;
              }

              if (
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                property.key.name === "httpOnly"
              ) {
                hasHttpOnly = true;
              }

              if (
                property.type === "Property" &&
                property.key.type === "Identifier" &&
                property.key.name === "sameSite"
              ) {
                hasSameSite = true;
              }
            });
          }

          if (!hasExpiresOrMaxAge || !hasHttpOnly || !hasSameSite) {
            context.report({
              node,
              message: "Missing secure attributes in res.cookie options",
              fix(fixer) {
                const fixes = [];

                if (!options) {
                  fixes.push(
                    fixer.insertTextAfter(
                      node.arguments[1],
                      ', { maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: "Strict" }'
                    )
                  );
                } else if (options.properties.length === 0) {
                  fixes.push(
                    fixer.replaceText(
                      options,
                      '{ maxAge: 15 * 60 * 1000, httpOnly: true, sameSite: "Strict" }'
                    )
                  );
                } else {
                  const lastOption = options.properties[options.properties.length - 1];
                  if (!hasExpiresOrMaxAge) {
                    fixes.push(
                      fixer.insertTextAfter(
                        lastOption,
                        ', maxAge: 15 * 60 * 1000'
                      )
                    );
                  }

                  if (!hasHttpOnly) {
                    fixes.push(
                      fixer.insertTextAfter(
                        lastOption,
                        ', httpOnly: true'
                      )
                    );
                  }

                  if (!hasSameSite) {
                    fixes.push(
                      fixer.insertTextAfter(
                        lastOption,
                        ', sameSite: "Strict"'
                      )
                    );
                  }
                }

                return fixes;
              },
            });
          }
        }
      },
    };
  },
};
