import * as fs from 'fs';
import { ColorNameToValue, ColorValueToName, Prior, VariablePriorMap } from './delcarations';

export function readFile(path: string): Promise<string> {
  return new Promise((resolve: (result: string) => void, reject: (error: NodeJS.ErrnoException) => void): void => {
    fs.readFile(path, 'utf8', (err: NodeJS.ErrnoException , data: string) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function parseVariable(variableFiles: string[]): Promise<ColorNameToValue> {
  const reg: RegExp = /([a-zA-Z_\$][a-zA-Z0-9_\-\$]*)\s*:\s*(#(?:[\da-fA-F]{6}|[\da-fA-F]{3}))/g;
  const nameToValue: ColorNameToValue = {};
  for (const path of variableFiles) {
    const content: string = await readFile(path);
    while (true) {
      const result: RegExpExecArray = reg.exec(content);
      if (!result) {
        break;
      } else {
        nameToValue[result[1]] = result[2].toUpperCase();
      }
    }
  }

  return nameToValue;
}

export function getPriorWeight(name: string, prior: Prior): number {
  const priorItem: string | RegExp = prior.find((p: string | RegExp) => {
    if (typeof p === 'string' && name.indexOf(p) > -1) {
      return true;
    } else if (p instanceof RegExp && p.test(name)) {
      return true;
    } else {
      return false;
    }
  });

  if (!priorItem) {
    return 0;
  } else {
    // 2-0 = 2
    return prior.length - prior.indexOf(priorItem);
  }
}

export async function parseVariableByPrior(variableFiles: string[], prior: Prior): Promise<VariablePriorMap> {
  // nameToValue: {
  //  $border: #ffffff
  //}
  const nameToValue: ColorNameToValue = await parseVariable(variableFiles);
  const variablePriorMap: VariablePriorMap = {};
  for (const name of Object.keys(nameToValue)) {
    // $border [border, borde] 2
    const priorWeight: number = getPriorWeight(name, prior);
    // object[2]
    const valueToName: ColorValueToName = variablePriorMap[priorWeight] || {};
    // my
    valueToName[name + nameToValue[name]] = name;
    // end my
    // map[2] = {#ffffff: $border}
    variablePriorMap[priorWeight] = valueToName;
  }

  return variablePriorMap;
}
