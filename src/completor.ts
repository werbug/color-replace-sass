import { Key } from 'readline';
import * as vscode from 'vscode';
import { ColorValueToName } from './delcarations';
import { parseVariableByPrior } from './utils';
import { Prior, VariablePriorMap, Config } from './delcarations';

// class ColorCompletionIem implements vscode.CompletionItem {

// }

export class Completor {
  private variableFiles: string[];
  private prior: Prior;
  private variablePriorMap: VariablePriorMap;
  private allColorValues: string[];
  private insertType: string;
  constructor(config: Config) {
    this.insertType = config.inertType;
    this.variableFiles = config.variableFiles;
    this.prior = config.prior;
    this.initialVariables();
  }

  public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position): vscode.CompletionItem[] {
    const start: vscode.Position = new vscode.Position(position.line, 0);
    const range: vscode.Range = new vscode.Range(start, position);
    const currentLine: string = document.getText(range);
    const currentColorIndex: number = currentLine.lastIndexOf('#');
    const currentColor: string = currentColorIndex > -1 ? currentLine.slice(currentColorIndex) : '';
    if (this.variablePriorMap && currentColor && currentColor.length > 1 && currentColor.length < 7) {
      const colors: string[] = this.getPossibleColorValue(currentColor);

      return colors.map((value: string) => {
        const item: vscode.CompletionItem = new vscode.CompletionItem(value);
        const name: string = this.findVariableName(value);
        item.detail = name;
        if (this.insertType === 'var') {
          item.insertText = name;
        } else {
          item.insertText = value;
        }

        return item;
      });
    } else {
      return [];
    }
  }

  private async initialVariables(): Promise<void> {
    if (this.variablePriorMap) {
      return;
    }
    this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
    this.allColorValues = Object.keys(this.variablePriorMap)
                                .map((key: string) => this.variablePriorMap[key])
                                .map(
                                  (valueToName: ColorValueToName) => {
                                  return Object.keys(valueToName)
                                  .reduce(
                                    (pre: string[], value: string) => {
                                      pre.push(value);

                                      return pre;
                                    },
                                    []
                                  );
                                })
                                .reduce((result: string[], arr: string[]) => result.concat(arr), []);
  }

  private getPossibleColorValue(key: string): string[] {
    return this.allColorValues.filter((value: string) => value.startsWith(key));
  }

  private findVariableName(value: string): string | undefined {
    for (let priorWeight: number = this.prior.length; priorWeight > -1; priorWeight--) {
      const valueToName: ColorValueToName = this.variablePriorMap[priorWeight];
      const variableName: string | undefined = valueToName && valueToName[value];
      if (variableName) {
        return variableName;
      }
    }

    return '';
  }
}
