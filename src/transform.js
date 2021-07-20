const { H2C_SKIPPED, H2C } = require("./constants");
const { 
    parseComponentDetails,
    getImportSpecifierLocalName,
    createUniqueLocalName,
    addImportStatement,
    removeJSXAttribute,
    createJSXElement 
} = require("./utils");

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

const transform = ({ source }, api) => {
    const j = api.jscodeshift;
    const rootCollection = j(source);
    const programPath = rootCollection.find(j.Program).get(0);
    const globalRefs = { j, rootCollection, programPath };
    programPath.scope.scan() // to create bindings in programPath scope
    traverseJsxElements(globalRefs);
    removeJSXAttribute(globalRefs)
    return rootCollection.toSource();
}

module.exports.parser = '@babel/parser';
module.exports = transform;