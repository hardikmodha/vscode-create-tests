import * as path from "path";
import {workspace} from "vscode";
import {SourceFile} from "../SourceFile";
import {Template} from "../types";
import {getDirectoryPath} from "../util";

/**
 * Class which defines methods to get file-template/code-snippets for the different type of files.
 */
export class TemplateManager {

    /**
     * This method reads the configuration and returns the template which matches with the extension
     * of the source file. e.g. If the file extension is ".ts" then the method returns the template
     * defined with configuration "createTests.template.ts".
     *
     * @param file SourceFile instance
     */
    static getTemplateForFile(file: SourceFile): Template {
        const templates = workspace.getConfiguration("createTests.template");

        return templates.get(file.getExtension(), []);
    }

    /**
     * This method returns the default template by reading the configuration from the key
     * "createTests.template.default".
     */
    static getDefaultTemplate(): string[] {
        const templates = workspace.getConfiguration("createTests.template");

        return templates.get("default", []);
    }

    /**
     * This method replaces the "moduleName" and "modulePath" like placeholders in the template and
     * replaces them with the actual value of module name and path.
     */
    static replacePlaceHolders(sourceFile: SourceFile, testFilePath: string, template: string[]): string {
        const testFilePathFromProjectRoot: string = path.relative(
            sourceFile.getBaseDirectoryPath(),
            testFilePath,
        );

        const sourceFileDir = getDirectoryPath(sourceFile.getFilePathFromBaseDirectory());
        const moduleName = sourceFile.getNameWithoutExtension();
        const testFileDir = getDirectoryPath(testFilePathFromProjectRoot);

        const importPath = path.join(path.relative(testFileDir, sourceFileDir), moduleName);

        return template.join("\n")
            .replace(/\$\{moduleName\}/g, `{${moduleName}}`)
            .replace(/\$\{modulePath\}/g, `${importPath}`);
    }
}
