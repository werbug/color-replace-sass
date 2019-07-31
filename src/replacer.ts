import { Position, Range, window, TextEditor, TextDocument, TextEditorEdit } from 'vscode';
import { parseVariableByPrior, readFile } from './utils';
import { Prior, VariablePriorMap, ColorValueToName, Config } from './delcarations';
import { connect } from 'tls';
import { strictEqual } from 'assert';

export class Replacer {
  private variableFiles: string[];
  private prior: Prior;
  private unReplaceWarn: boolean;
  private variablePriorMap: VariablePriorMap;

  constructor(config: Config) {
    this.variableFiles = config.variableFiles;
    this.prior = config.prior;
    this.unReplaceWarn = config.unReplaceWarn;
    this.variablePriorMap = {};
  }

  public async replaceFile(): Promise<void> {
    try {
      await this.initialVariable();
    } catch (err) {
      console.error(err);
    }
    this.replace();
  }

  private async replace(): Promise<void> {
    const activeTextEditor: TextEditor = window.activeTextEditor;
    if (!activeTextEditor) {
      return;
    }
    const document: TextDocument = activeTextEditor.document;
    const start: Position = new Position(0, 0);
    const end: Position = new Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
    const range: Range = new Range(start, end);
    const content: string = document.getText(range);

    // my
      // const myreg: RegExp = /(?<name>[^;\s]*?):[^:;]*?(?<value>#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})([;\s\n]|$)/g;
      const myreg: RegExp = /(?<name>[^;\s]*?):(?<value>[^:;]*?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})[^:;]*?);/g;
      let unReplacedCount: number = 0;
      let replaced: string = ''

      const getStyle = (content: string, nullstr: string) => {
        let str = content
        let i = str.indexOf('<style');

        let styleprestr = str.slice(0, i+6)
        let stylebestr = str.slice(i+6, str.length)
        let stylestr = stylebestr.slice(0, stylebestr.indexOf('</style')+7)

        let repla = stylestr.replace(myreg, (m1: string, m2: string, m3: string) => {
          // color: #ffffff; color #ffffff
          // const name: string = this.findVariableName(m3.toUpperCase(), m2);
          // if (name) {
          //   return m1.replace(/#([\da-fA-F]{6}|[\da-fA-F]{3})/g, name);
          // } else {
          //   unReplacedCount ++;
    
          //   return m1;
          // }

          // 0: "background: abc#fff def#000000ghi#f1f1f1mno#f2f2f2ghi;"
          // 1: "background"
          // 2: " abc#fff def#000000ghi#f1f1f1mno#f2f2f2ghi"

          return m1.replace(/#([\da-fA-F]{6}|[\da-fA-F]{3})/g, ($1: string) => {
              const name: string = this.findVariableName($1.toUpperCase(), m2);
              
              if (name) {
                  return name
              }
              else {
                  unReplacedCount++;
                  return $1;
              }
          })
        });

        let newstr = nullstr.concat(styleprestr, repla)

        let nextstylebestr = stylebestr.slice(stylebestr.indexOf('</style')+7, stylebestr.length)

        if (nextstylebestr.indexOf('<style') != -1) {
          getStyle(nextstylebestr, newstr)
        } else {
          replaced = newstr.concat(nextstylebestr)
        }
      }
      getStyle(content, '');

    // end my

    // const reg: RegExp = /#([\da-fA-F]{6}|[\da-fA-F]{3})/g;
    // let unReplacedCount: number = 0;
    // const replaced: string = content.replace(reg, (match: string) => {
    //   const name: string = this.findVariableName(match.toUpperCase());
    //   if (name) {
    //     return name;
    //   } else {
    //     unReplacedCount ++;

    //     return match;
    //   }
    // });

    activeTextEditor.edit((textEditor: TextEditorEdit) => {
      textEditor.replace(range, replaced);
      if (this.unReplaceWarn && unReplacedCount > 0) {
        window.showWarningMessage(`有${unReplacedCount}个颜色值没有找到对应的变量`);
      }
    });
  }

  private async initialVariable(): Promise<void> {
    try {
      this.variablePriorMap = await parseVariableByPrior(this.variableFiles, this.prior);
    } catch (err) {
      console.error(err);
    }
  }

  private findVariableName(value: string, name: string): string | undefined {
    for (let priorWeight: number = this.prior.length; priorWeight > -1; priorWeight--) {
      const valueToName: ColorValueToName = this.variablePriorMap[priorWeight];
      // const variableName: string | undefined = valueToName && valueToName[value];
      // my
      let getName: string = '';
      let variableName: string | undefined = undefined;
      if (valueToName) {
        for (let key in valueToName) {
          if (key.indexOf(name) != -1 && key.indexOf(value) != -1) {
            getName = valueToName[key];
            break;
          }
        }
        variableName = getName
      } else {
        variableName = undefined
      }
      // end my
      if (variableName) {
        return variableName;
      }
    }

    return undefined;
  }
}
