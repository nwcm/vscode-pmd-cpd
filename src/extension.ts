// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CodeAnalysisConfig } from "./config";
import { CPDCache } from "./data/cpd/cache";
import { DuplicateCodeProvider } from "./data/cpd/treedata";

import { CPDGutters } from "./gutter";

export const EXTENSION_NAME = "pmd-cpd";
export const REPORT_OUTPUT_DIRECTORY = "reports/cpd";

export function activate(context: vscode.ExtensionContext) {
  CodeAnalysisConfig.init(context);
  const config = CodeAnalysisConfig.instance();
  const data = new CPDCache();
  const cpdGutters = new CPDGutters(data, config, context);
  const duplicateProvider = new DuplicateCodeProvider(data);

  const showCPDGutters = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.showDuplicates`,
    () => {
      cpdGutters.showDuplicates();
    },
  );
  const hideCPDGutters = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.hideDuplicates`,
    () => {
      cpdGutters.hideDuplicates();
    },
  );

  const refreshCPDTree = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.refreshDuplicates`,
    () => {
      duplicateProvider.refresh();
    },
  );

  const scanForDuplicates = vscode.commands.registerCommand(
    `${EXTENSION_NAME}.scanForDuplicates`,
    () => {
      cpdGutters.scanForDuplicates();
      duplicateProvider.refresh();
    },
  );

  // const clearDuplicates = vscode.commands.registerCommand(
  //   `${EXTENSION_NAME}.clearDuplicates`,
  //   () => {
  //     // duplicateProvider.refresh();
  //   }
  // );

  context.subscriptions.push(
    showCPDGutters,
    hideCPDGutters,
    refreshCPDTree,
    scanForDuplicates,
    config,
  );

  vscode.window.registerTreeDataProvider(
    "pmd-cpd.DuplicateCode",
    duplicateProvider,
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}