// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { CodeAnalysisConfig } from "./config";
import { CPDCache } from "./data/cpd/cache";
import { DuplicateCodeProvider } from "./data/cpd/treedata";

import { CPDGutters } from "./gutter";

export function activate(context: vscode.ExtensionContext) {
  CodeAnalysisConfig.init(context);
  console.debug("activate");
  const config = CodeAnalysisConfig.instance();
  const data = new CPDCache();
  const cpdGutters = new CPDGutters(data, config, context);
  const duplicateProvider = new DuplicateCodeProvider(data);

  const showCPDGutters = vscode.commands.registerCommand(
    "pmd-cpd.showDuplicates",
    () => {
      cpdGutters.showDuplicates();
    },
  );
  const hideCPDGutters = vscode.commands.registerCommand(
    "pmd-cpd.hideDuplicates",
    () => {
      cpdGutters.hideDuplicates();
    },
  );

  const refreshCPDTree = vscode.commands.registerCommand(
    "pmd-cpd.refreshDuplicates",
    () => {
      duplicateProvider.refresh();
    },
  );

  context.subscriptions.push(
    showCPDGutters,
    hideCPDGutters,
    refreshCPDTree,
    config,
  );

  vscode.window.registerTreeDataProvider(
    "cpd.DuplicateCode",
    duplicateProvider,
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
