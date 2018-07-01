import * as vscode from "vscode";
import {ConfigurationManager} from "./config/ConfigurationManager";
import {CreationHelper} from "./CreationHelper";
import {SourceFile} from "./SourceFile";

export class TestFileCreator {

    /**
     * This is the entry point when the "createTests.create" command gets executed.
     * @param args {@link Uri} of the source file
     */
    static createFor(args: vscode.Uri) {
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
