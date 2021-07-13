const H2C = 'data-h2c';
const H2C_SKIPPED = 'data-h2c-skipped';

//data-h2c={Button}::@myCompany/form-elements::name=Click Me,colour=green,size=small
//data-h2c=Button::@myCompany/form-button::name=Click Me,colour=gray,size=small
//data-h2c add this attribute to skip the children that are in the data-h2c component, by default the parent containing data-h2c will be skipped

const parseComponentDetails = (h2cValue) => {
    let [name, source, attributes] = h2cValue.split("::");
    const isNamedImport = name.startsWith("{") && name.endsWith("}");
    if (isNamedImport) {
        name = name.substring(1, name.length - 1);
    }
    if (attributes) {
        attributes = attributes.split(",").reduce((attrs, keyValue) => {
            if (keyValue) {
                const [key, value] = keyValue.split("=");
                attrs[key] = value;
            }
            return attrs;
        }, {});
    } else {
        attributes = [];
    }
    return { name, localName: name, source, attributes, isNamedImport };
};

// return localName if import already exist otherwise empty string
const getImportSpecifierLocalName = (componentDetails, globalRefs) => {
    const { rootCollection, j } = globalRefs;
    if (componentDetails.isNamedImport) {
        const importDeclaration = rootCollection.find(j.ImportDeclaration, {
            source: { value: componentDetails.source },
            specifiers: [{
                type: 'ImportSpecifier',
                imported: { name: componentDetails.name }
            }]
        });
        if (importDeclaration.length) {
            const importDeclarationPath = importDeclaration.get(0);
            const namedSpecifier = importDeclarationPath.node.specifiers.find(specifier =>
                specifier.type === 'ImportSpecifier' &&
                specifier.imported.name === componentDetails.name
            );
            return namedSpecifier.local.name;
        }
        return ""
    }
    const defaultImportDeclaration = rootCollection.find(j.ImportDeclaration,
        {
            source: { value: componentDetails.source },
            specifiers: [{
                type: 'ImportDefaultSpecifier',
            }]
        }
    );
    if (defaultImportDeclaration.length) {
        const importDeclarationPath = defaultImportDeclaration.get(0);
        const defaultSpecifier = importDeclarationPath.node.specifiers.find(
            specifier => specifier.type === 'ImportDefaultSpecifier');
        return defaultSpecifier.local.name;
    }
    return "";
};


const createUniqueLocalName = (localName, globalRefs) => {
    const bindings = globalRefs.programPath.scope.bindings
    if (!(localName in bindings)) {
        return localName
    }
    let i = 2; // assuming component exist with the same name as 1; 
    while ((`${localName}${i}` in bindings)) {
        i += 1;
    }
    return `${localName}${i}`;
};

const createImportSpecifier = (componentDetails, globalRefs) => {
    const { j } = globalRefs;
    const { name, localName, isNamedImport, } = componentDetails;
    return isNamedImport ?
        j.importSpecifier(j.identifier(name), j.identifier(localName))
        : j.importDefaultSpecifier(j.identifier(localName))
}

const createImportDeclaration = (componentDetails, globalRefs) => {
    const { j } = globalRefs;
    const { source, isNamedImport, } = componentDetails;
    const specifier = createImportSpecifier(componentDetails, globalRefs)
    return isNamedImport ?
        j.importDeclaration(
            [specifier],
            j.stringLiteral(source),
            "value"
        ) :
        j.importDeclaration(
            [specifier],
            j.literal(source)
        );
}

const addImportStatement = (componentDetails, globalRefs) => {
    const { rootCollection, j, programPath } = globalRefs;
    const specificImportCollection = rootCollection.find(j.ImportDeclaration, {
        source: { value: componentDetails.source }
    });
    if (specificImportCollection.length > 0) {
        const specificImportPath = specificImportCollection.get(0);
        specificImportPath.node.specifiers.push(createImportSpecifier(componentDetails, globalRefs))
    } else {
        const newImportDeclaration = createImportDeclaration(componentDetails, globalRefs);
        const anyImports = rootCollection.find(j.ImportDeclaration);
        if (anyImports.length > 0) {
            const lastImport = anyImports.at(anyImports.length - 1);
            lastImport.insertAfter(newImportDeclaration);
        } else {
            programPath.node.body.unshift(newImportDeclaration);
        }
    }
    programPath.scope.scan();
};

const createJSXElement = (componentDetails, jsxElementCollection, globalRefs) => {
    const { j } = globalRefs;
    const { localName, attributes, } = componentDetails;
    const attributesArray = Object.entries(attributes).reduce((attributesArray, [name, value]) => {
        attributesArray.push(
            j.jsxAttribute(j.jsxIdentifier(name), j.literal(value))
        )
        return attributesArray;
    }, [])
    const paddedChildren = [];
    const childNodes = jsxElementCollection.childNodes();
    childNodes.forEach(childPath => {
        const hasH2c = j(childPath).find(j.JSXAttribute, { name: { name: H2C } }).length > 0;
        if (hasH2c) {
            paddedChildren.push(childPath.node, j.jsxText('\n'));
        }
    });

    const jsxIdentifier = j.jsxIdentifier(localName);
    const jsxOpeningElement = j.jsxOpeningElement(jsxIdentifier, attributesArray);
    if (paddedChildren.length > 0) {
        const endIdentifier = Object.assign({}, jsxIdentifier, { comments: [] });
        return j.jsxElement(
            jsxOpeningElement,
            j.jsxClosingElement(endIdentifier),
            paddedChildren
        );
    } else {
        jsxOpeningElement.selfClosing = true;
        return j.jsxElement(jsxOpeningElement);
    }

};

const createJsxComponent = (jsxElementCollection, globalRefs) => {
    const { j } = globalRefs;
    const h2cAttributeCollection = jsxElementCollection.find(j.JSXAttribute, { name: { name: H2C } });
    const h2cAttributePath = h2cAttributeCollection.get(0);
    const h2cValue = h2cAttributePath.node.value;
    if (!h2cValue || !h2cValue.value) {
        h2cAttributePath.node.name.name = H2C_SKIPPED;
        return;
    }
    const componentDetails = parseComponentDetails(h2cValue.value);
    componentDetails.localName = getImportSpecifierLocalName(componentDetails, globalRefs);
    if (componentDetails.localName === "") {
        componentDetails.localName = createUniqueLocalName(componentDetails.name, globalRefs);
        addImportStatement(componentDetails, globalRefs);
    }
    return createJSXElement(componentDetails, jsxElementCollection, globalRefs);
};

const traverseJsxElements = (globalRefs) => {
    const { j, rootCollection } = globalRefs;
    const jsxElementCollection = rootCollection.find(
        j.JSXElement,
        { openingElement: { attributes: [{ name: { name: H2C } }] } }
    );
    if (jsxElementCollection.length > 0) {
        const jsxFirstElementCollection = jsxElementCollection.at(0);
        const jsxComponent = createJsxComponent(jsxFirstElementCollection, globalRefs);
        if (jsxComponent) {
            jsxFirstElementCollection.replaceWith(jsxComponent);
        }
        return traverseJsxElements(globalRefs);
    }
    return;
}

const removeH2cSkipped = (globalRefs) => {
    const { j, rootCollection } = globalRefs;
    rootCollection.find(
        j.JSXAttribute, { name: { name: H2C_SKIPPED } }
    ).remove();
}

const transform = ({ source }, api) => {
    const j = api.jscodeshift;
    const rootCollection = j(source);
    const programPath = rootCollection.find(j.Program).get(0);
    const globalRefs = { j, rootCollection, programPath };
    programPath.scope.scan() // to create bindings in programPath scope
    traverseJsxElements(globalRefs);
    removeH2cSkipped(globalRefs)
    return rootCollection.toSource();
}

module.exports.parser = '@babel/parser';
module.exports = transform;