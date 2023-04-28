module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce use of express-brute middleware for login rate limiting",
      category: "Best Practices",
      recommended: true,
    },
    fixable: "code",
    schema: [],
  },

  create(context) {
    let expressBruteImported = false;

    function addExpressBrute(node) {
      context.report({
        node: node,
        message: "Use express-brute middleware for login rate limiting",
        fix(fixer) {
          const fixes = [];

          if (!expressBruteImported) {
            const sourceCode = context.getSourceCode();

            // Get the last import statement in the file
            const lastImport = sourceCode.ast.body.filter(
              (node) => node.type === "ImportDeclaration"
            ).slice(-1)[0];

            // If there are no import statements, add a new one
            if (!lastImport) {
              fixes.push(fixer.insertTextBefore(node, "const expressBrute = require('express-brute');\n"));
            }
            // Otherwise, insert the import after the last one
            else {
              fixes.push(fixer.insertTextAfter(lastImport, "\nconst expressBrute = require('express-brute');"));
            }

            expressBruteImported = true;
          }

          // Insert the middleware after the session middleware
          const appNode = node.parent.parent;
          const sessionMiddlewareNode = appNode.body.body.find((n) => n.type === "ExpressionStatement" && n.expression.callee.object.name === "app" && n.expression.callee.property.name === "use" && n.expression.arguments[0].name === "session");
          if (sessionMiddlewareNode) {
            fixes.push(fixer.insertTextAfter(sessionMiddlewareNode, "\napp.use(new expressBrute(expressBruteStore));"));
          } else {
            context.report({
              node: node,
              message: "Cannot find session middleware",
            });
          }

          return fixes;
        },
      });
    }

    return {
      ImportDeclaration(node) {
        if (node.source.value === "express-brute") {
          expressBruteImported = true;
        }
      },

      MemberExpression(node) {
        if (node.object.name === "passport" && node.property.name === "authenticate") {
          const loginRoute = node.parent.parent.arguments[1].value;
          const appNode = node.parent.parent.parent.parent;

          // Find the login route in the routes defined for the app
          const loginRouteNode = appNode.body.body.find(
            (n) =>
              n.type === "ExpressionStatement" &&
              n.expression.callee.object.name === "app" &&
              n.expression.callee.property.name === "use" &&
              n.expression.arguments[0].value === loginRoute
          );

          if (loginRouteNode) {
            const loginFunctionNode = loginRouteNode.expression.arguments[1];

            // Check if the login function calls res.redirect or res.render
            if (
              loginFunctionNode.type === "ArrowFunctionExpression" ||
              loginFunctionNode.type === "FunctionExpression"
            ) {
              const functionBody = loginFunctionNode.body;
              const callsResRedirectOrRender =
                functionBody.type === "BlockStatement" &&
                functionBody.body.some(
                  (n) =>
                    n.type === "ReturnStatement" &&
                    n.argument &&
