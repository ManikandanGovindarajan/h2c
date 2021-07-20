const fs = require('fs')
const { H2C, H2C_SKIPPED } = require("./constants");

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

const getNamedImportSpecifierLocalName = (componentDetails, globalRefs) => {
    const { rootCollection, j } = globalRefs;
    const importDeclaration = rootCollection.find(j.ImportDeclaration, {
        source: { value: componentDetails.source },
    });
    if (importDeclaration.length) {
        const importDeclarationPath = importDeclaration.get(0);
        const namedSpecifier = importDeclarationPath.node.specifiers.find(specifier =>
            specifier.type === 'ImportSpecifier' &&
            specifier.imported.name === componentDetails.name
        );
        if (namedSpecifier) {
            return namedSpecifier.local.name;
        }
    }
    return "";
}

const getDefaultImportSpecifierLocalName = (componentDetails, globalRefs) => {
    const { rootCollection, j } = globalRefs;
    const defaultImportDeclaration = rootCollection.find(j.ImportDeclaration, {
        source: { value: componentDetails.source },
    });
    if (defaultImportDeclaration.length) {
        const importDeclarationPath = defaultImportDeclaration.get(0);
        const defaultSpecifier = importDeclarationPath.node.specifiers.find(
            specifier => specifier.type === 'ImportDefaultSpecifier');
        if (defaultSpecifier) {
            return defaultSpecifier.local.name;
        }
    }
    return "";
}

const getImportSpecifierLocalName = (componentDetails, globalRefs) => {
    return componentDetails.isNamedImport ?
        getNamedImportSpecifierLocalName(componentDetails, globalRefs) :
        getDefaultImportSpecifierLocalName(componentDetails, globalRefs)
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

const createJsxAttributes = (attributes = {}, globalRefs) => {
    const { j } = globalRefs;
    const attributesArray = Object.entries(attributes).reduce((attributesArray, [name, value]) => {
        attributesArray.push(
            j.jsxAttribute(j.jsxIdentifier(name), j.literal(value))
        )
        return attributesArray;
    }, []);
    return attributesArray;
}

//data-h2c={Button}::@myCompany/form-elements::name=Click Me,colour=green,size=small
//data-h2c=Button::@myCompany/form-button::name=Click Me,colour=gray,size=small
//data-h2c add this attribute to skip the children that are in the data-h2c component, by default the parent containing data-h2c will be skipped
const createJSXElement = (componentDetails, jsxElementCollection, globalRefs, childAttribute = H2C) => {

    const { j } = globalRefs;
    const { localName, attributes, } = componentDetails;
    const attributesArray = createJsxAttributes(attributes, globalRefs);
    const paddedChildren = [];

    const childNodes = jsxElementCollection.childNodes();

    childNodes.forEach(childPath => {
        const hasH2c = j(childPath).find(j.JSXAttribute, { name: { name: childAttribute } }).length > 0;
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

const removeJSXAttribute = (globalRefs, attributeName = H2C_SKIPPED) => {
    const { j, rootCollection } = globalRefs;
    rootCollection.find(
        j.JSXAttribute, { name: { name: attributeName } }
    ).remove();
}

const getCssClassMapJsContent = (url = "") => {
    const result = { json: undefined, error: undefined }
    try {
        const data = fs.readFileSync(url.trim(), { encoding: 'utf8', flag: 'r' });
        result.json = eval(data);
    } catch (error) {
        result.error = error;
    }
    return result;
}

module.exports = {
    parseComponentDetails,
    getImportSpecifierLocalName,
    createUniqueLocalName,
    addImportStatement,
    removeJSXAttribute,
    createJsxAttributes,
    createJSXElement,
    getCssClassMapJsContent
}