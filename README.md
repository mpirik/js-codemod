## js-codemod

This repository contains a collection of codemod scripts for use with
[JSCodeshift](https://github.com/facebook/jscodeshift).

### Setup & Run

```sh
npm install -g jscodeshift
git clone https://github.com/mpirik/js-codemod.git
jscodeshift -t <codemod-script> <file/directory>
```

Use the `-d` option for a dry-run and use `-p` to print the output for
comparison.

### Included Scripts

#### `arrow-function`

Transforms most functions to arrow functions. Does not transform named or generator functions.

```sh
jscodeshift -t js-codemod/transforms/arrow-function.js <file>
```

Note: In order to force parenthesis in all cases, `thisIsNotAValidParamAndShouldBeRemoved` is added as a parameter to single parameter functions. You'll want to find/replace that to remove it from your code.
