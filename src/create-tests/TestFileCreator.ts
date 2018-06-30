import * as vscode from 'vscode';
import {SourceFile} from './SourceFile';
import {CreationHelper} from './CreationHelper';
import {ConfigurationManager} from './config/ConfigurationManager';

export class TestFileCreator {

    /**
     * This is the entry point when the "createTests.create" command gets executed.
     * @param args {@link Uri} of the source file
     */
    public static createFor(args: vscode.Uri) {
        if (!args) {
            return;
        }

        try {
            const sourceFile = new SourceFile(args);
            const helper = new CreationHelper(sourceFile, ConfigurationManager.getConfiguration(sourceFile));
            helper.createTestFile();

        } catch (error) {
            vscode.window.showErrorMessage(error.message);
        }
    }
}
