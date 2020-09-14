import * as vscode from 'vscode';
import axios from 'axios';

const url='http://tinyurl.com/api-create.php?url=';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('shortenurl.helloWorld', () => {
		const editor = vscode.window.activeTextEditor;

		if (editor) {
			const document = editor.document;
			// TODO add support for multiple selections
			// editor.selections
			const selection = editor.selection;
			const word = document.getText(selection);		

			axios.get(url + word)
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
				else {
					vscode.window.showErrorMessage('Unexpected Error', error.message);
				}
			});
		}

	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
