import * as vscode from "vscode";
import { CodeAnalysisConfig } from "./config";
import { CPDCache } from "./data/cpd/cache";

enum State {
  renderOn,
  renderOff,
}

/**
 * Handles rendering PMD-CMD duplicate data
 */
export class CPDGutters {
  private duplicates: CPDCache;
  private duplicateState: State;
  private config: CodeAnalysisConfig;

  public constructor(
    duplicates: CPDCache,
    config: CodeAnalysisConfig,
    context: vscode.ExtensionContext
  ) {
    this.duplicates = duplicates;
    this.config = config;
    this.duplicateState = State.renderOff;
    var onDupsChange = () => this.renderDuplicateGutters();

    this.duplicates.onChange(onDupsChange.bind(this));
  }

  public showDuplicates() {
    this.duplicateState = State.renderOn;
    var self = this;
    vscode.window.onDidChangeActiveTextEditor((editor) => {
      if (editor !== undefined) {
        self.renderDuplicateGutters();
      }
    });
    this.renderDuplicateGutters();
  }

  public hideDuplicates() {
    this.duplicateState = State.renderOff;
    vscode.window.onDidChangeActiveTextEditor((e) => {});
    this.renderDuplicateGutters();
  }

  private renderDuplicateGutters() {
    const editor = vscode.window.activeTextEditor;
    if (this.duplicateState === State.renderOff) {
      editor?.setDecorations(this.config.cpdConfig.decTypeCritical, []);
      editor?.setDecorations(this.config.cpdConfig.decTypeMajor, []);
      editor?.setDecorations(this.config.cpdConfig.decTypeMinor, []);
      return;
    }

    if (vscode.workspace.workspaceFolders !== undefined) {
      if (editor !== null && editor !== undefined) {
        const openFile = editor.document.fileName;
        const duplicates = this.duplicates.getData(vscode.Uri.file(openFile));

        var minor = new Array<vscode.DecorationOptions>();
        var major = new Array<vscode.DecorationOptions>();
        var critical = new Array<vscode.DecorationOptions>();

        duplicates?.forEach((duplicate) => {
          if (duplicate.numTokens < this.config.cpdConfig.minor) {
            minor.push(duplicate.getDecorationInformation());
          } else if (duplicate.numTokens < this.config.cpdConfig.major) {
            major.push(duplicate.getDecorationInformation());
          } else {
            critical.push(duplicate.getDecorationInformation());
          }
        });

        editor?.setDecorations(this.config.cpdConfig.decTypeMinor, minor);
        editor?.setDecorations(this.config.cpdConfig.decTypeMajor, major);
        editor?.setDecorations(this.config.cpdConfig.decTypeCritical, critical);
      }
    }
  }
}
