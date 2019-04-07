# Usage

    const { parse } = require('graphql');
    const merge = require('@major-mann/graphql-tool-merge-ast');
    const result = merge({
        parseOptions: {},
        typeDefs: [
            `
            type SdlCan {
                be: Used
            }
            `,
            parse(`
                type AsCan {
                    existing: Ast
                }
            `)
        ],
        onTypeConflict(definition1, definition2) {
            // return falsy to exclude the type
            // return true to merge the 2, preferring definition2 and merging named type arrays by name (preferring definition 2)
            // Manually merge and return the merged node to be put into definitions
        }
    });
