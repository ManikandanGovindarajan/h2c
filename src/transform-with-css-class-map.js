const { H2C } = require("./constants");
const {
    parseComponentDetails,
    getImportSpecifierLocalName,
    createUniqueLocalName,
    addImportStatement,
    removeJSXAttribute,
    createJsxAttributes,
    createJSXElement
} = require("./utils")

const getComponentDetails = (cssClass = "", cssClassMap = {}, fullClassList = "") => {
    let componentDetails = cssClassMap[cssClass];
    if (componentDetails && typeof componentDetails === 'string') {
        return parseComponentDetails(componentDetails)
    }
    if (componentDetails && typeof componentDetails === 'object') {
        return componentDetails;
    }
    if (componentDetails && typeof componentDetails === 'function') {
        let returnedComponentDetails = componentDetails(fullClassList || cssClass);
        if (returnedComponentDetails && typeof returnedComponentDetails === 'string') {
            return parseComponentDetails(returnedComponentDetails)
        }
        return returnedComponentDetails;
    }
    const cssClasses = cssClass.trim().split(' ');
    if (cssClasses.length > 1) {
        for (let i = 0; i < cssClasses.length; i++) {
            componentDetails = getComponentDetails(cssClasses[i], cssClassMap, fullClassList || cssClass);
            if (componentDetails) {
                return componentDetails;
            }
        }
    }
    return;
}

const transform = ({ source, classMap }, api) => {
    const j = api.jscodeshift;
    const rootCollection = j(source);
    const programPath = rootCollection.find(j.Program).get(0);
    const globalRefs = { j, rootCollection, programPath };

    const jsxElements = rootCollection.find(j.JSXElement);
    const childPaths = jsxElements.paths();

    for (let i = childPaths.length - 1; i > 0; i--) {
        const elementPath = childPaths[i];

        const classCollection = j(elementPath.node.openingElement).find(j.JSXAttribute, { name: { name: "class" } })

        if (classCollection.length > 0) {
            const cssClass = classCollection.get(0).node.value.value;
            const componentDetails = getComponentDetails(cssClass, classMap);

            if (componentDetails) {
                componentDetails.localName = getImportSpecifierLocalName(componentDetails, globalRefs, i);
                if (componentDetails.localName === "") {
                    componentDetails.localName = createUniqueLocalName(componentDetails.name, globalRefs);
                    addImportStatement(componentDetails, globalRefs);
                }
                const jsxElementCollection = j(elementPath);
                const jsxElement = createJSXElement(componentDetails, jsxElementCollection, globalRefs, H2C);
                const attributes = createJsxAttributes({ [H2C]: "test" }, globalRefs);
                jsxElement.openingElement.attributes.push(attributes[0]);
                jsxElementCollection.replaceWith(jsxElement)
            }
        }

    }
    removeJSXAttribute(globalRefs, H2C)
    return rootCollection.toSource();
}
module.exports.parser = '@babel/parser';
module.exports = transform;