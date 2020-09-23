import * as vscode from 'vscode';
import axios from 'axios';

const url='http://tinyurl.com/api-create.php?&url=';

function requestURL(editor: vscode.TextEditor, alias=false, input='') {
	const document = editor.document;
	// TODO add support for multiple selections
	// editor.selections
	const selection = editor.selection;
	const word = document.getText(selection);

	let request = `${url}${word}`;
	
	if (alias) {
		request = `${request}&alias=${input}`
	}

	console.log(request);

	axios.get(request)
	.then(response => {
		let shortened = response.data;
		if (shortened.length >= word.length) {
			console.log('NOTE: shortened URL is not shorter')
		}
		editor.edit(editBuilder => {
			editBuilder.replace(selection, shortened);
		});
	})
	.catch(error => {
		if (error.response.status == 400) {
			vscode.window.showErrorMessage('Not a valid URL', error.message);
		}
		else if (error.response.status == 422) {
			vscode.window.showErrorMessage('Alias not available', error.message);
		}
		else {
			vscode.window.showErrorMessage('Unexpected Error', error.message);
		}
	});
}

export function activate(context: vscode.ExtensionContext) {
	let regular = vscode.commands.registerCommand('shortenurl.regular', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			requestURL(editor)
		}
	});
	context.subscriptions.push(regular);
	let alias = vscode.commands.registerCommand('shortenurl.alias', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			vscode.window.showInputBox({prompt: 'Alias:'}).then(input => {
				if (input != undefined) {
					requestURL(editor, true, input)
				} else {
					vscode.window.showErrorMessage('Missing alias', 'Please type an alias');
				}
			});
		}
	});
	context.subscriptions.push(alias);
}

export function deactivate() {}