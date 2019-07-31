"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const utils_1 = require("./utils");
class Replacer {
    constructor(config) {
        this.variableFiles = config.variableFiles;
        this.prior = config.prior;
        this.unReplaceWarn = config.unReplaceWarn;
        this.variablePriorMap = {};
    }
    replaceFile() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.initialVariable();
            }
            catch (err) {
                console.error(err);
            }
            this.replace();
        });
    }
    replace() {
        return __awaiter(this, void 0, void 0, function* () {
            const activeTextEditor = vscode_1.window.activeTextEditor;
            if (!activeTextEditor) {
                return;
            }
            const document = activeTextEditor.document;
            const start = new vscode_1.Position(0, 0);
            const end = new vscode_1.Position(document.lineCount - 1, document.lineAt(document.lineCount - 1).text.length);
            const range = new vscode_1.Range(start, end);
            const content = document.getText(range);
            // my
            // const myreg: RegExp = /(?<name>[^;\s]*?):[^:;]*?(?<value>#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})([;\s\n]|$)/g;
            const myreg = /(?<name>[^;\s]*?):(?<value>[^:;]*?(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})[^:;]*?);/g;
            let unReplacedCount = 0;
            let replaced = '';
            const getStyle = (content, nullstr) => {
                let str = content;
                let i = str.indexOf('<style');
                let styleprestr = str.slice(0, i + 6);
                let stylebestr = str.slice(i + 6, str.length);
                let stylestr = stylebestr.slice(0, stylebestr.indexOf('</style') + 7);
                let repla = stylestr.replace(myreg, (m1, m2, m3) => {
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
                    return m1.replace(/#([\da-fA-F]{6}|[\da-fA-F]{3})/g, ($1) => {
                        const name = this.findVariableName($1.toUpperCase(), m2);
                        if (name) {
                            return name;
                        }
                        else {
                            unReplacedCount++;
                            return $1;
                        }
                    });
                });
                let newstr = nullstr.concat(styleprestr, repla);
                let nextstylebestr = stylebestr.slice(stylebestr.indexOf('</style') + 7, stylebestr.length);
                if (nextstylebestr.indexOf('<style') != -1) {
                    getStyle(nextstylebestr, newstr);
                }
                else {
                    replaced = newstr.concat(nextstylebestr);
                }
            };
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
            activeTextEditor.edit((textEditor) => {
                textEditor.replace(range, replaced);
                if (this.unReplaceWarn && unReplacedCount > 0) {
                    vscode_1.window.showWarningMessage(`有${unReplacedCount}个颜色值没有找到对应的变量`);
                }
            });
        });
    }
    initialVariable() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.variablePriorMap = yield utils_1.parseVariableByPrior(this.variableFiles, this.prior);
            }
            catch (err) {
                console.error(err);
            }
        });
    }
    findVariableName(value, name) {
        for (let priorWeight = this.prior.length; priorWeight > -1; priorWeight--) {
            const valueToName = this.variablePriorMap[priorWeight];
            // const variableName: string | undefined = valueToName && valueToName[value];
            // my
            let getName = '';
            let variableName = undefined;
            if (valueToName) {
                for (let key in valueToName) {
                    if (key.indexOf(name) != -1 && key.indexOf(value) != -1) {
                        getName = valueToName[key];
                        break;
                    }
                }
                variableName = getName;
            }
            else {
                variableName = undefined;
            }
            // end my
            if (variableName) {
                return variableName;
            }
        }
        return undefined;
    }
}
exports.Replacer = Replacer;
//# sourceMappingURL=replacer.js.map