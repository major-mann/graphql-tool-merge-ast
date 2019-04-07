module.exports = merge;

const { parse } = require('graphql');

function merge({ typeDefs, parseOptions, onTypeConflict }) {
    typeDefs = typeDefs.map(prepareSchema);
    return {
        kind: 'Document',
        definitions: mergeAll(typeDefs)
    };

    function mergeAll(definitions) {
        let result = definitions[0];
        for (var definitionIndex = 1; definitionIndex < definitions.length; definitionIndex++) {
            result = mergeDefinitions(result, definitions[definitionIndex]);
        }
        return result;
    }

    function mergeDefinitions(definitions1, definitions2) {
        const result = definitions1.slice();
        for (var definitionIndex = 0; definitionIndex < definitions2.length; definitionIndex++) {
            const definition = definitions2[definitionIndex];
            const typeIndex = findTypeIndex(result, nameOf(definition));
            if (typeIndex === -1) {
                result.push(definition);
            } else {
                const resolved = onTypeConflict(result[typeIndex], definition);
                if (resolved === true) {
                    result[resultIndex] = {
                        ...definition,
                        ...arrayMerge(result[typeIndex], definition)
                    };
                } else if (resolved) {
                    result[typeIndex] = resolved;
                }
            }
        }
        return result;

        function arrayMerge(definition1, definition2) {
            const result = {};
            Object.keys(definition1).forEach(processField);
            Object.keys(definition2).forEach(processField);
            return result;

            function processField(key) {
                if (!result[key]) {
                    return;
                }
                if (!Array.isArray(definition1[key]) || !Array.isArray(definition1[key]).every(isNamedType)) {
                    return;
                }
                if (!Array.isArray(definition2[key]) || !Array.isArray(definition2[key]).every(isNamedType)) {
                    return;
                }
                result[key] = nameMerge(definition1[key], definition2[key]);

                function isNamedType(node) {
                    return node &&
                        typeof node.name === 'object' &&
                        node.name.kind === 'Name' &&
                        typeof node.name.value === 'string';
                }
            }
        }
    }

    function findTypeIndex(definitions, name) {
        for (var definitionIndex = 0; definitionIndex < definitions.length; definitionIndex++) {
            if (nameOf(definitions[definitionIndex]) === name) {
                return definitionIndex;
            }
        }
        return -1;
    }

    function prepareSchema(typeDefs) {
        if (typeof typeDefs === 'string') {
            typeDefs = parse(typeDefs, parseOptions);
        }
        if (!typeDefs || typeDefs.kind !== 'Document') {
            throw new Error('Supplied typeDefs MUST be or MUST parse to Document');
        }
        return typeDefs.definitions;
    }
}

/** Overwrites items with the same name in 1 with items from 2, and adds all items that don't exist */
function nameMerge(namedNodes1, namedNodes2) {
    if (!namedNodes1 && !namedNodes2) {
        return undefined;
    }
    if (!namedNodes1) {
        return namedNodes2.slice();
    }
    if (!namedNodes2) {
        return namedNodes1.slice();
    }
    const result = namedNodes1.slice();
    namedNodes2.forEach(processNode);
    return result;

    function processNode(node2) {
        const node2Name = nameOf(node2);
        const currentIndex = result.findIndex(node1 => nameOf(node1) === node2Name);
        if (currentIndex === -1) {
            result.push(node2);
        } else {
            result[currentIndex] = node2;
        }
    }
}

function nameOf(node) {
    if (node && node.name && node.name.kind === 'Name') {
        return node.name.value;
    } else {
        throw new Error('Unable to get name for node');
    }
}
