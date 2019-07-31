'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';

import { Replacer } from './replacer';
import { Prior, Config } from './delcarations';
import { Completor } from './completor';

const CONFIG_NAME: string = 'colorReplace';
const COMMAND: string = 'extension.colorReplace';
export function activate(context: vscode.ExtensionContext): void {
    const rootPath: string | undefined = vscode.workspace.rootPath;
    const workspaceConfig: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration(CONFIG_NAME);
    const config: Config = {
        variableFiles: workspaceConfig.variableFiles.map((p: string) => path.join(rootPath, p)),
        prior: workspaceConfig.prior,
        unReplaceWarn: workspaceConfig.unReplaceWarn,
        inertType: workspaceConfig.inertType,
        onSave: workspaceConfig.onSave
    };
    const variableFiles: string[] = workspaceConfig.get('variableFiles', []).map((p: string) => path.join(rootPath, p));
    const prior: Prior = workspaceConfig.get('prior', []);

    if (workspaceConfig.onSave) {
        vscode.workspace.onWillSaveTextDocument((document: vscode.TextDocumentWillSaveEvent) => {
            return document.waitUntil(vscode.commands.executeCommand(COMMAND));
        });
    }

    const command: vscode.Disposable = vscode.commands.registerCommand(COMMAND, () => {
        if (!rootPath) {
            return;
        }
        const repleacer: Replacer = new Replacer(config);

        return repleacer.replaceFile();
    });

    const completor: Completor = new Completor(config);
    const trigger: string[] = [
                    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
                    'a', 'b', 'c', 'd', 'e', 'f',
                    'A', 'B', 'C', 'D', 'E', 'F'
                    ];
    const completion: vscode.Disposable = vscode.languages.registerCompletionItemProvider('*', completor, ...trigger);
    // console.log(completor);
    context.subscriptions.push(command);
    context.subscriptions.push(completion);
}
