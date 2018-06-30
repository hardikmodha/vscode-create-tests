'use strict';
import * as vscode from 'vscode';
import {TestFileCreator} from './create-tests/TestFileCreator';

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand('createTests.create', (sourceFile: vscode.Uri) => {
        TestFileCreator.createFor(sourceFile);
    });

    context.subscriptions.push(disposable);
}


// this method is called when your extension is deactivated
export function deactivate() {
}