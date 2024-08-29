import * as vscode from "vscode";
import { EXTENSION_NAME } from "./extension";

class UserSettings {
  public readonly minimumDuplicateTokens: number;
  public readonly minorIssueTokenThreshold: number;
  public readonly majorIssueTokenThreshold: number;
  public readonly onStartBehavior: string;
  public readonly language: Array<string>;
  public readonly sourceDirectory: string;

  constructor() {
    const settings = vscode.workspace.getConfiguration(EXTENSION_NAME);
    this.minimumDuplicateTokens = Number(
      settings.get("minimumDuplicateTokens"),
    );
    this.minorIssueTokenThreshold = Number(
      settings.get("minorIssueTokenThreshold"),
    );
    this.majorIssueTokenThreshold = Number(
      settings.get("majorIssueTokenThreshold"),
    );
    this.onStartBehavior = String(settings.get("onStartBehavior"));
    this.language = String(settings.get("language")).split(',');
    this.sourceDirectory = String(settings.get("sourceDirectory"));
  }
}

export class CPDConfig {
  /**
   * TODO: Mike 2023-03-13 I have no idea why the ThemeColors aren't working.
   */
  //#fa4d5640";
  public readonly criticalColor = new vscode.ThemeColor(
    "duplicateStatus.critical",
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
}

export type ConfidenceChangeCallBack = (confidences: Array<number>) => void;
export type RankChangeCallback = (minRank: number) => void;

export class CodeAnalysisConfig implements vscode.Disposable {
  public readonly cpdConfig = new CPDConfig();
  public readonly userSettings = new UserSettings();
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
        "Config must be initialized with the ExtensionContext first.",
      );
    }
    return CodeAnalysisConfig.staticInstance;
  }

  dispose() {}
}
