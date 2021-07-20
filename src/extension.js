const vscode = require('vscode');
const jscodeshift = require('jscodeshift');
const transform = require('./transform');
const transformWithClassMap = require('./transform-with-css-class-map');
const { getCssClassMapJsContent } = require("./utils");

let classMap = {};
let classMapParseResult = {};

const populateCssClassMap = () => {
	const h2cConfig = vscode.workspace.getConfiguration('h2c');
	const cssClassMapJsFile = h2cConfig.cssClassMapJsFile;
	if (cssClassMapJsFile) {
		classMapParseResult = getCssClassMapJsContent(cssClassMapJsFile) || {};
		if (classMapParseResult.error) {
			vscode.window.showErrorMessage('Error while processing css_class_map_js_file', classMapParseResult.error);
			return;
		}
		classMap = classMapParseResult.json;
	}
};

async function activate(context) {

	populateCssClassMap();

	vscode.workspace.onDidChangeConfiguration(event => {
		let affected = event.affectsConfiguration("h2c.cssClassMapJsFile");
        if (affected) {
			populateCssClassMap();
        }
    })

	const disposable_convertHtmlToJSXComponent = vscode.commands
		.registerTextEditorCommand('h2c.convertHtmlToJSXComponentBasedOnH2cProp', function (editor) {
			const document = editor.document;
			const text = document.getText();
			const transformedText = transform({ source: text }, { jscodeshift })
			const range = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length - 1)
			);
			editor.edit(editBuilder => {
				editBuilder.replace(range, transformedText);
			});

		});

	const disposable_convertHtmlWithCssClassMap = vscode.commands
		.registerTextEditorCommand('h2c.convertHtmlToJSXComponent', function (editor) {
			const document = editor.document;
			const text = document.getText();
			const transformedText = transformWithClassMap({ source: text, classMap }, { jscodeshift })
			const range = new vscode.Range(
				document.positionAt(0),
				document.positionAt(text.length - 1)
			);
			editor.edit(editBuilder => {
				editBuilder.replace(range, transformedText);
			});

		});

	context.subscriptions.push(disposable_convertHtmlToJSXComponent, disposable_convertHtmlWithCssClassMap);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
