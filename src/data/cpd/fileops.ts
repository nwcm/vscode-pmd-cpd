import * as vscode from "vscode";

/**
 * Maintains information necessary to provide
 * appropriate link to duplicate code in other files.
 */
export class OtherFile {
  public readonly file: vscode.Uri;
  public readonly line: number;
  public readonly endLine: number;
  public readonly column: number;
  public readonly endColumn: number;

  public constructor(
    file: vscode.Uri,
    line: number,
    endLine: number,
    column: number,
    endColumn: number,
  ) {
    this.file = file;
    this.line = line;
    this.endLine = endLine;
    this.column = column;
    this.endColumn = endColumn;
  }

  get range() {
    return new vscode.Range(
      this.line - 1,
      this.column - 1,
      this.endLine - 1,
      this.endColumn - 1,
    );
  }

  /**
   * Same file link format that would be seen in the terminal.
   * @returns text for the [] portions of the Markdown link.
   */
  public linkText(): string {
    return (
      vscode.workspace.asRelativePath(this.file) + ":" + this.line.toFixed(0)
    );
  }

  /**
   * File link in a format that vscode will open and move to the
   * correct line.
   * @returns proper link with anchor.
   */
  public link(): string {
    return this.file + "#" + this.line.toFixed(0);
  }
}

// export class DuplicationFile {
//     public readonly path: vscode.Uri;
//     public readonly line: number;
//     public readonly endLine: number;
//     public readonly beginToken: number;
//     public readonly endToken: number;
//     public readonly column: number;
//     public readonly endColumn: number;

//     public constructor(path: String, ) {
//         this.path = vscode.Uri.file(path);
//     }
// }

/**
 * Contains the duplication data and function to retrieve the ranges
 */
export class DuplicationData {
  public readonly thisFile: vscode.Uri;
  public readonly otherFiles: OtherFile[];
  public readonly startLine: number;
  public readonly endLine: number;
  public readonly numTokens: number;
  public readonly column: number;
  public readonly endColumn: number;

  public constructor(
    thisFile: vscode.Uri,
    otherFiles: OtherFile[],
    startLine: number,
    endLine: number,
    numTokens: number,
    column: number,
    endColumn: number,
  ) {
    this.thisFile = thisFile;
    this.otherFiles = otherFiles;
    this.startLine = startLine;
    this.endLine = endLine;
    this.numTokens = numTokens;
    this.column = column;
    this.endColumn = endColumn;
  }

  get range() {
    return new vscode.Range(
      this.startLine - 1,
      this.column - 1,
      this.endLine - 1,
      this.endColumn - 1,
    );
  }

  /**
   * Sets up the hover text and file links.
   * @returns DecorationOptions containing the ranges and links to the other files
   */
  public getDecorationInformation() {
    const msg = new vscode.MarkdownString("## This is duplicated:\r\n");
    this.otherFiles.forEach((file) => {
      if (file.file.toString() === this.thisFile.toString()) {
        msg.appendMarkdown(
          `- [This file at line ${file.line.toFixed(0)}](${file.link()})\r\n`,
        );
      } else {
        msg.appendMarkdown(`- [${file.linkText()}](${file.link()})\r\n`);
      }
    });
    //msg.isTrusted = true;
    return {
      hoverMessage: msg,
      range: this.range,
    };
  }
}

/**
 * Make sure we have a full path to the file
 * @param file full or relative path to file
 * @returns Uri to the file with workspace dir added if needed.
 */
export function expandedUri(file: string): vscode.Uri {
  if (file.match("[a-zA-Z]*://.*")) {
    return vscode.Uri.parse(file);
  }
  let uri = vscode.Uri.file(file);
  /** If the file is a relative assume it's from the workspace root
   * and tweak as required
   */
  if (
    !file.startsWith("/") &&
    !file.startsWith("file://") &&
    vscode.workspace.workspaceFolders !== undefined
  ) {
    const workspaceDir = vscode.workspace.workspaceFolders[0].uri;
    uri = vscode.Uri.file(workspaceDir.path + "/" + file);
  }
  return uri;
}
