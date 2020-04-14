import { Uri, window } from "vscode";

export const switchToFile = (file: string) => {
  window.showTextDocument(Uri.file(file)).then((err) => {
    if (err) {
      throw err;
    }
  });
};
