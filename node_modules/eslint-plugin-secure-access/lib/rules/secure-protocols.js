

module.exports = {

    meta: {

        // different messages depending on which protocol was detected.
        messages: {
          http: 'Use a secure protocol (https) instead of an insecure protocol (http).',
          ftp: 'Use a secure protocol (ftps) instead of an insecure protocol (ftp).',
        },
        fixable: "code",
        schema: []
      },
    create: function (context) {
      return {
        Literal: function (node) {
            // check if a string that starts with http is found. 
          if (typeof node.value === 'string') {
            if (node.value.startsWith('http:')) {
              context.report({
                node: node,
                messageId: 'http',
                
                // replace the protocol with a secure one
                fix: function (fixer) {
                  return fixer.replaceText(node, '"'+ node.value.replace('http:', 'https:')+'"');
                },
              });
                // check if a string that starts with ftp is found. 
            } else if (node.value.startsWith('ftp:')) {
              context.report({
                node: node,
                messageId: 'ftp',

                // replace the protocol with a secure one
                fix: function (fixer) {
                  return fixer.replaceText(node,'"'+ node.value.replace('ftp:', 'ftps:')+'"');
                },
              });
            }
          }
        },
      };
    },
  };
  
