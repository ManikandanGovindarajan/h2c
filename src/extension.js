const vscode = require('vscode');
const jscodeshift = require('jscodeshift');
const transform = require('./transform');

function activate(context) {


	let disposable = vscode.commands
		.registerTextEditorCommand('h2c.convertHtmlToJSXComponent', function (editor) {

			const fileName = editor.document.fileName;
			if (!fileName.endsWith('.js') && !fileName.endsWith('.jsx')) {
				vscode.window.showInformationMessage('Please open js or jsx file to do the conversion');
				return;
			}
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

	context.subscriptions.push(disposable);
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
