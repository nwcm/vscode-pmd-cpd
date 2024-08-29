import * as vscode from "vscode";
import { CodeAnalysisConfig } from "./config";
import { CPDCache } from "./data/cpd/cache";
import { EXTENSION_NAME } from "./extension";

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
  private statusBarItem: vscode.StatusBarItem;
  private static userTerminal: vscode.Terminal;
  // private userSettings: vscode.WorkspaceConfiguration;

  public constructor(
    duplicates: CPDCache,
    config: CodeAnalysisConfig,
    context: vscode.ExtensionContext,
  ) {
    // this.userSettings = vscode.workspace.getConfiguration(EXTENSION_NAME);
    // console.debug(JSON.stringify(settings));

    this.duplicates = duplicates;
    this.config = config;

    if (this.config.userSettings.onStartBehavior === "Show") {
      this.duplicateState = State.renderOn;
    } else {
      this.duplicateState = State.renderOff;
    }

    const onDupsChange = () => this.renderDuplicateGutters();

    this.duplicates.onChange(onDupsChange.bind(this));

    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Left,
      1,
    );
    this.statusBarItem.name = "dup";
    this.toggleStatusBarItem();
    this.statusBarItem.show();
    context.subscriptions.push(this.statusBarItem);
  }

  toggleStatusBarItem() {
    this.statusBarItem.text = this.showHideText;
    this.statusBarItem.tooltip = this.showHideTooltip;
    this.statusBarItem.command = this.showHideCommand;
  }

  get showHideText() {
    return this.duplicateState === State.renderOn
      ? "$(light-bulb) Hide duplicate code"
      : "$(light-bulb) Show duplicate code";
  }

  get showHideTooltip() {
    return this.duplicateState === State.renderOn
      ? "Hide duplicate code"
      : "Show duplicate code";
  }

  get showHideCommand() {
    return this.duplicateState === State.renderOn
      ? "pmd-cpd.hideDuplicates"
      : "pmd-cpd.showDuplicates";
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
    this.toggleStatusBarItem();
  }

  public hideDuplicates() {
    this.duplicateState = State.renderOff;
    vscode.window.onDidChangeActiveTextEditor((e) => {});
    this.renderDuplicateGutters();
    this.toggleStatusBarItem();
  }

  public scanForDuplicates() {
    const terminal =
      CPDGutters.userTerminal ?? vscode.window.createTerminal(`PMD-CPD`);
    CPDGutters.userTerminal = terminal;

    const directory = this.config.userSettings.sourceDirectory ?? ".";
    terminal.sendText(
      `pmd cpd --format xml --minimum-tokens ${this.config.userSettings.minimumDuplicateTokens} --language ${this.config.userSettings.language} --dir ${directory} > reports/cpd.xml`,
    );
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
          if (
            duplicate.numTokens <
            this.config.userSettings.minorIssueTokenThreshold
          ) {
            minor.push(duplicate.getDecorationInformation());
          } else if (
            duplicate.numTokens <
            this.config.userSettings.majorIssueTokenThreshold
          ) {
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
