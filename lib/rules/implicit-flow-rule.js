// module.exports = {
//     meta: {
//       type: 'problem',
//       docs: {
//         description: 'Warn if response_type=token is used in URLs',
//         category: 'Possible Errors',
//         recommended: true,
//       },
//       schema: [],
//     },
  
//     create: function (context) {
//       return {
//         Literal(node) {
//           if (typeof node.value === 'string' && node.value.includes('response_type=token')) {
//             context.report({
//               node,
//               message: 'response_type=token detected in URL string, which indicates the use of the Implicit OAuth 2.0 flow.',
//             });
//           }
//         },
  
//         JSXAttribute(node) {
//           if (
//             node.name.name === 'href' &&
//             node.value.type === 'Literal' &&
//             node.value.value.includes('response_type=token')
//           ) {
//             context.report({
//               node,
//               message: 'response_type=token detected in the href attribute of an <a> element, which indicates the use of the Implicit OAuth 2.0 flow.',
//             });
//           }
//         },
//       };
//     },
//   };
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Warn when encountering the string "test-warning"',
      category: 'Possible Errors',
      recommended: true,
    },
    schema: [],
  },

  create: function (context) {
    return {
      Literal(node) {
        if (typeof node.value === 'string' && node.value.includes('test-warning')) {
          context.report({
            node,
            message: 'The string "test-warning" was found.',
          });
        }
      },
    };
  },
};
