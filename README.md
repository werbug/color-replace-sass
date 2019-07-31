# [color-variable-replace](https://marketplace.visualstudio.com/items?itemName=color-variable-replace.color-variable-replace)
## Features
Sometimes using css extension like Less, Sass, Stylus. We usually define color variable in one or mutiple files.This extension can help you replace hex color value with color variable name.

## Extension Settings
In your project/.vscode/setting.json config this extension.

`colorReplace.variableFiles` the paths of file which in defines color variables

`colorReplace.prior` the priority of variable names, support string and regular expression

`colorReplace.unReplaceWarn` give warning message when there is any color value that can't find corresponding variable name

`colorReplace.insertType` when auto complete, use color value or variable name, value is 'var' or 'value'

`colorReplace.onSave` if auto replace when file save
Blow is a example of configuration
```json
{
  "colorReplace.variableFiles": [
    "/test/variables.less"
  ],
  "colorReplace.prior": ["kolor", "color"],
  "colorReplace.insertType": "value",
  "colorReplace.onSave": true
}
```
## How use
1. shortcut `ctrl+shift+c`
2. vscode command. `cmd+shift+p` and execute color replace command
3. config auto replace when file save
