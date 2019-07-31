import { parseVariable } from './utils';

export type ColorValueToName = {
  [prop: string]: string;
};

export type ColorNameToValue = {
  [prop: string]: string;
};

export type VariablePriorMap = {
  [props: string]: ColorValueToName
};

export type Prior = (string | RegExp)[];

export type Config = {
  variableFiles: string[],
  prior: Prior,
  unReplaceWarn: boolean,
  inertType: string,
  onSave: boolean
};
