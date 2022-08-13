# js-operator-overload-babel

This is a plugin to transform expressions into the functions in js-operator-overload-core.

For example, it is able to transform:

```js
let d = a + b;
```

into:

```js
// this will only create once each file
const _OperatorCore = require("@xktz/js-operator-overload-core");

let d = _OperatorCore("+", a, b);
```