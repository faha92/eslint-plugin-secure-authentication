// module.exports = {
//   meta: {
//     type: 'problem',
//     docs: {
//       description: 'Warn if response_type=token is used in the code',
//       category: 'Possible Errors',
//       recommended: true,
//     },
//     fixable: 'code',
//     schema: [],
//   },

//   create: function (context) {
//     function checkLiteral(node) {
//       if (typeof node.value === 'string') {
//         const tokenIndex = node.value.indexOf('response_type=token');
//         if (tokenIndex !== -1) {
//           context.report({
//             node,
//             message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
//             fix(fixer) {
//               const fixed = node.value.slice(0, tokenIndex) + 'response_type=code' + node.value.slice(tokenIndex + 'response_type=token'.length);
//               return fixer.replaceText(node, `'${fixed}'`);
//             },
//           });
//         }
//       }
//     }

//     function checkTemplateLiteral(node) {
//       node.quasis.forEach((quasi) => {
//         if (quasi.value.raw && typeof quasi.value.raw === 'string') {
//           const tokenIndex = quasi.value.raw.indexOf('response_type=token');
//           if (tokenIndex !== -1) {
//             context.report({
//               node,
//               message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
//               fix(fixer) {
//                 const fixed = quasi.value.raw.slice(0, tokenIndex) + 'response_type=code' + quasi.value.raw.slice(tokenIndex + 'response_type=token'.length);
//                 return fixer.replaceTextRange([node.start, node.end], `\`${fixed}\``);
//               },
//             });
//           }
//         }
//       });
//     }

//     return {
//       Literal: checkLiteral,
//       TemplateLiteral: checkTemplateLiteral,
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
    fixable: 'code',
    schema: [],
  },

  create: function (context) {
    function checkLiteral(node) {
      if (typeof node.value === 'string') {
        const tokenIndex = node.value.indexOf('response_type=token');
        if (tokenIndex !== -1) {
          context.report({
            node,
            message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
            fix(fixer) {
              const fixed = node.value.slice(0, tokenIndex) + 'response_type=code' + node.value.slice(tokenIndex + 'response_type=token'.length);
              return fixer.replaceText(node, `'${fixed}'`);
            },
          });
        }
      }
    }

    function checkTemplateLiteral(node) {
      node.quasis.forEach((quasi) => {
        if (quasi.value.raw && typeof quasi.value.raw === 'string') {
          const tokenIndex = quasi.value.raw.indexOf('response_type=token');
          if (tokenIndex !== -1) {
            context.report({
              node,
              message: 'response_type=token detected in the code, which indicates the use of the Implicit OAuth 2.0 flow.',
            });
          }
        }
      });
    }

    return {
      Literal: checkLiteral,
      TemplateLiteral: checkTemplateLiteral,
    };
  },
};
