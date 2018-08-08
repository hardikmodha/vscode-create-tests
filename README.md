

[vscode-create-tests](https://marketplace.visualstudio.com/items?itemName=hardikmodha.create-tests) (v1.0.1)
====
Quickly create test files for your JavaScript/Typescript/React projects with just one click.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/HardikModha/vscode-create-tests/blob/master/LICENSE)

### Motivation

While working on a project in my organization, We followed a pattern to keep tests files outside the main source directory. (Same structure as [this](https://github.com/gitpoint/git-point)). It was working fine until the project got bigger. It was becoming really very difficult to mimic the same directory structure as the source file and create a test file in it manually. So this extension solves the problem. It helps you to quickly generate test files with many possible customizations.

## Features

* Create test file from the file explorer view/editor title view or from the editor.
* Specifying the default location to keep the test files. Currently supports
   1. Location same as the file location.
   2. Project root
* If for some reasons default locations don't work for you. Don't worry,  you can specify the custom location as well.
* Custom name for the test directory.
* Ability to specify the various template(s) to use for test files for the different languages.
* Automatically switching to test cases when you create them.

## How to use this extension?

Install and open [Visual Studio Code](https://code.visualstudio.com/). Press `Ctrl+Shift+X` or `Cmd+Shift+X` to open the Extensions pane. Type `create tests` in the search box and hit enter. You can also install the extension from the [Marketplace](https://marketplace.visualstudio.com/items?itemName=hardikmodha.create-tests). Currently, It supports Typescript and Javascript files. (Supported file extensions: `.ts`, `.tsx`, `.js`, `.jsx`)

![Demo](https://media.giphy.com/media/1iqPhENd8SLd9SggeX/giphy.gif)

## Configuration options

| Property | Type | Default | Allowed Values |Description |
|:---|:---|:---|:---|:---|
| `createTests.defaultLocationForTestFiles` | string | `same location as source file` | 1. `same location as source file`, &nbsp;&nbsp;&nbsp; 2. `project root`|Location where you want to keep the test files. |
| `createTests.sourceDir` | string | `src` | any string value | Name of directory which contains all source files. This directory is not created when generating the directory structure for the test file. |
| `createTests.testDirectoryName` | string | `tests` | any string value | Name of the directory which should contain all the test files.
 | `createTests.customLocationForTestFiles` | string | - | any valid path | Set this property in case you want to specify the custom location for test files.
 | `createTests.testFilesSuffix` | string | 'test' | any string value | Suffix to append for every created test file
  | `createTests.shouldSwitchToTestFile` | boolean | true | true \| false | Whether to switch to the created test file or not
  | `createTests.template.default` | array \| object | `["import {${moduleName}} from '${modulePath}';"]` | any string array or object |Default template to use for all test file
| `createTests.template.*` | array \| object | - | string array or object |Language specific templates that you want to use.

## Template types

Templates are used to initialize test files with default content. It eases the task and removes boilerplate code. Following template types are supported.

### 1. Default template

The default template for any file can be specified by overriding the configuration `createTests.template.default`.
Default value for this template is: `"import ${moduleName} from '${modulePath}';"` Here, `moduleName` and `modulePath` are special placeholders, which gets replaces with the source file name and the relative path to the source file respectively.

### 2. Language-specific templates
When creating the test files, this extension reads the configuration for the template specified by `createTests.template.<file-extension>`. So if your file name is `MyFile.js` then the extension will read the configuration `createTests.template.js` for the template. If it finds one then it will write the content of the template into the created test file.

**Note**: Language-specific templates have higher priority over the default template.

## Supported templates

For this extension, The templates can vary from as simple as

```
"import {${moduleName}} from '${modulePath}';"
```
to
```
[
    "import {${moduleName}} from '${modulePath}'"
    "",
    "describe('${moduleName}', (){",
    "  it('', (){",
    "",
    "  })",
    "})"
]
```
and can be as complex as
```
{
    "Template for basic files": [
        "import {${moduleName}} from '${modulePath}'"
    ],
    "Template for awesome files": [
        "import {${moduleName}} from '${modulePath}'",
        "describe('${moduleName}', () {",
	    "it('', () {",
	    "",
	    "  })",
	    "})"
    ]
}
```

When you specify a template object, The extension will ask you to choose the template when you create a file as shown in the below image.

![Multiple Templates Demo](https://i.imgur.com/FBonrQJ.png)

## TODO

- [ ] Add test cases.
- [ ] Add support for creating the test files via keyboard shortcut.
- [ ] Add support for more placeholders to make templating more usable.
- [ ] Add support for different languages.


## License

[MIT](LICENSE)
