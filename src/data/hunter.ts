// import * as xml from "xml2js";
// import * as fs from "fs";
import * as vscode from "vscode";

import { REPORT_OUTPUT_DIRECTORY } from "../extension";

/**
 * function called when the file hunter finds a file.
 * Used to register additional actions.
 */
type FileCallback = (file: vscode.Uri) => void;
type FileCheckCallback = (file: vscode.Uri) => Thenable<boolean>;

/**
 * Files of a given type.
 */
export class FileHunter {
  public readonly files = new Array<vscode.Uri>();

  public constructor(
    fileVerifier: FileCheckCallback,
    whenFound: FileCallback,
  ) {
    console.log("Searching for PMD CPD outputs");
    vscode.workspace
      .findFiles(`${REPORT_OUTPUT_DIRECTORY}/*.xml`)
      .then((files: vscode.Uri[]) => {
        files.forEach((file) => {
          fileVerifier(file).then((result) => {
            if (result) {
              console.log("Found cpd file: " + file.toString());
              whenFound(file);
            }
          });
        });
      });
  }
}
