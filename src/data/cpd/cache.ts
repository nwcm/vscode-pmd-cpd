import * as xml from "xml2js";
import * as vscode from "vscode";
import { FileHunter } from "../hunter";
import { DuplicationData, expandedUri, OtherFile } from "./fileops";

/**
 * Maintains duplication data and handles filesystem changes.
 */
export class CPDCache {
  private duplicateData: Map<string, Array<DuplicationData>>;
  private callbacks = new Array<() => void>();
  private fileHunter: FileHunter;
  // private diagnosticCollection: vscode.DiagnosticCollection
  // private config: CodeAnalysisConfig

  public constructor() {
    this.duplicateData = new Map<string, Array<DuplicationData>>();
    // this.diagnosticCollection = vscode.languages.createDiagnosticCollection("PMD CPD");

    var self = this;
    this.fileHunter = new FileHunter(
      "**/*.xml",
      async (file) => {
        const data = await vscode.workspace.fs.readFile(file);

        const result = data.toString().includes("<pmd-cpd");
        return result;
      },
      (file) => {
        this.readData(file);
        var watcher = vscode.workspace.createFileSystemWatcher(
          new vscode.RelativePattern(file, "*"),
        );
        watcher.onDidChange(() => {
          // console.debug(file.toString());
          self.duplicateData = new Map<string, Array<DuplicationData>>();
          self.readData(file);
        });
        watcher.onDidCreate(() => {
          self.duplicateData = new Map<string, Array<DuplicationData>>();
          self.readData(file);
        });
        watcher.onDidDelete(() => {
          self.duplicateData = new Map<string, Array<DuplicationData>>();
          self.fireChange();
        });
      },
    );
  }

  /**
   * Actually read the data
   * @param file uri to the cpd xml file to process
   */
  private readData(file: vscode.Uri) {
    var self = this;

    vscode.workspace.fs.readFile(file).then(
      (data) => {
        xml.parseString(data, (err, cpdData) => {
          if (err) {
            throw err;
          }
          // if(cpdData["pmd-cpd"].$.version !== '1.0.1'){
          //     throw new Error(`Invalid PMD CPD report version. Expected 1.0.0 got ${cpdData["pmd-cpd"].$.version}`)
          // }

          // this.diagnosticCollection.clear();

          const duplicates = cpdData["pmd-cpd"]["duplication"];

          // foreach duplicate returned by PMD CPD
          Object.keys(duplicates).forEach((value: string, idx: number) => {
            const tokensDuplicate = Number(duplicates[idx].$.tokens);

            const xmlFiles = duplicates[idx]["file"];
            const allFiles = new Array<OtherFile>();

            Object.keys(xmlFiles).forEach((value, idx) => {
              const xmlFile = xmlFiles[idx].$;
              allFiles.push(
                new OtherFile(
                  vscode.Uri.file(xmlFile.path),
                  Number(xmlFile.line),
                  Number(xmlFile.endline),
                  Number(xmlFile.column),
                  Number(xmlFile.endcolumn),
                ),
              );
            });

            Object.keys(xmlFiles).forEach((value: string, idx: number) => {
              const dupFile = xmlFiles[idx].$;
              const file = vscode.Uri.file(dupFile.path);
              const startLine = Number(dupFile.line);
              const endLine = Number(dupFile.endline);
              const otherFiles = new Array<OtherFile>();

              // const issues = new Array<vscode.Diagnostic>();

              allFiles.forEach((path) => {
                if (
                  path.file.toString() !== file.toString() ||
                  path.line !== startLine
                ) {
                  otherFiles.push(path);
                  // issues.push(new vscode.Diagnostic(path.range, "Duplicate code", vscode.DiagnosticSeverity.Warning))
                }
              });

              const uriString = file.toString();
              const dupElement = new DuplicationData(
                file,
                otherFiles,
                startLine,
                endLine,
                tokensDuplicate,
                Number(dupFile.column),
                Number(dupFile.endColumn),
              );

              // this.diagnosticCollection.set(file, issues);

              if (!self.duplicateData.has(uriString)) {
                self.duplicateData.set(uriString, new Array<DuplicationData>());
              }
              const dupSet =
                self.duplicateData.get(uriString) ||
                new Array<DuplicationData>();
              dupSet.push(dupElement);
            });
          });
          self.fireChange();
        });
      },
      (reason) => {
        console.log(
          "Could not read duplication data from " + file + " because " + reason,
        );
      },
    );
  }

  /**
   * Rerender decorations if change of duplication data.
   */
  private fireChange() {
    this.callbacks.forEach((cb) => cb());
  }

  /**
   * Register function to be called on any change.
   * @param cb
   */
  public onChange(cb: () => void) {
    this.callbacks.push(cb);
  }

  /**
   * Retrieve Duplication data for a given file.
   * @param file The file we want data for
   * @returns All Duplicate data for the given file, or []
   */
  public getData(file: vscode.Uri): DuplicationData[] {
    var duplicates = this.duplicateData.get(file.toString());
    if (duplicates !== null && duplicates !== undefined) {
      return duplicates;
    }
    return [];
  }

  public getKnownFiles(): Array<vscode.Uri> {
    return Array.from(this.duplicateData.keys(), (v, k) => expandedUri(v));
  }
}
