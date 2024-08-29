import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";

class UserSettings {
  public readonly minorIssueTokenThreshold: number;
  public readonly majorIssueTokenThreshold: number;
  public readonly onStartBehavior: string;

  constructor() {
    const settings = vscode.workspace.getConfiguration(EXTENSION_NAME);
    this.minorIssueTokenThreshold = Number(
      settings.get("minorIssueTokenThreshold")
    );
    this.majorIssueTokenThreshold = Number(
      settings.get("majorIssueTokenThreshold")
    );
    this.onStartBehavior = String(settings.get("onStartBehavior"));
  }
}

export class CPDConfig {
  /**
   * TODO: Mike 2023-03-13 I have no idea why the ThemeColors aren't working.
   */
  //#fa4d5640";
  public readonly criticalColor = new vscode.ThemeColor(
    "duplicateStatus.critical"
  );
  //"#ff832b40";
  public readonly majorColor = new vscode.ThemeColor("duplicateStatus.major");
  //"#f1c21b40";
  public readonly minorColor = new vscode.ThemeColor("duplicateStatus.minor");

  public readonly decTypeCritical =
    vscode.window.createTextEditorDecorationType({
      isWholeLine: true,
      rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
      backgroundColor: this.criticalColor,
      overviewRulerColor: this.criticalColor,
      overviewRulerLane: vscode.OverviewRulerLane.Full,
    });

  public readonly decTypeMajor = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    backgroundColor: this.majorColor,
    overviewRulerColor: this.majorColor,
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });

  public readonly decTypeMinor = vscode.window.createTextEditorDecorationType({
    isWholeLine: true,
    rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
    backgroundColor: this.minorColor,
    overviewRulerColor: this.minorColor,
    overviewRulerLane: vscode.OverviewRulerLane.Full,
  });

  public readonly userSettings = new UserSettings();
}

export type ConfidenceChangeCallBack = (confidences: Array<number>) => void;
export type RankChangeCallback = (minRank: number) => void;

export class CodeAnalysisConfig implements vscode.Disposable {
  public readonly cpdConfig = new CPDConfig();
  private static staticInstance: CodeAnalysisConfig;

  private constructor(private readonly context: vscode.ExtensionContext) {}

  public static init(context: vscode.ExtensionContext): void {
    if (CodeAnalysisConfig.staticInstance == null) {
      CodeAnalysisConfig.staticInstance = new CodeAnalysisConfig(context);
    }
  }

  public static instance(): CodeAnalysisConfig {
    if (!CodeAnalysisConfig.staticInstance) {
      throw new Error(
        "Config must be initialized with the ExtensionContext first."
      );
    }
    return CodeAnalysisConfig.staticInstance;
  }

  dispose() {}
}
