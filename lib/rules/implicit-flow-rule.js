// module.exports = {
//   meta: {
//     type: 'problem',
//     docs: {
//       description: 'Warn if response_type=token is used in the code',
//       category: 'Possible Errors',
//       recommended: true,
//     },
//     schema: [],
//   },

//   create: function (context) {
//     return {
//       Program(node) {
//         const sourceCode = context.getSourceCode().getText();
//         if (sourceCode.includes('response_type=token')) {
//           context.report({
//             node,
//             message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
//           });
//         }
//       },
//     };
//   },
// };
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn if response_type=token is used in the code',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    function checkLiteral(node) {
      if (typeof node.value === 'string' && node.value.includes('response_type=token')) {
        context.report({
          node,
          message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
        });
      }
    }

    function checkTemplateLiteral(node) {
      if (node.quasis.some((quasi) => quasi.value.raw.includes('response_type=token'))) {
        context.report({
          node,
          message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
        });
      }
    }

    return {
      Literal: checkLiteral,
      TemplateLiteral: checkTemplateLiteral,
    };
  },
};
