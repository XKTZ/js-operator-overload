## js-operator-overload

This project uses babel to support the basic operator overloading functions

This plugin is divided into
- js-operator-overload-core: containing the functions, such as _executeBinaryExpression_ to execute the operator expressions
- js-operator-overload-babel: the babel plugin to transform the expressions into the execution code of functions in js-operator-overload-core

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

## How to use it

The plugin is intrusive. When writing an object which needs overload operator (for example, a vector):

```js
class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    
    [Symbol.for("+")](b) {
        return new Vector(this.x + b.x, this.y + b.y);
    }
}

let a = new Vector(1, 2);
let b = new Vector(3, 4);
let c = a + b;
```

However, due to the support of javascript's **prototype**, theoretically, this project also supports non-intrusive operator overload.

```js
Number.prototype[Symbol.for("+")] = function (y) {
    return this - y; 
}

let x = 3;
let y = 5;
let c = x + y; // -2
```

### Support operators

Binary operators:

```
+, -, *, /, %, **, &, |, ^, <<, >>, >>>, ==, <, > 
```

Unary operators:

```
~, +, -
```

_the '+' and '-' in unary needs to be written as "positive" and "negative" in `Symbol.for`_

Update operators:

```
++, --
```

## Configuration in babel

| Configuration Option | Description | Options | Default |
|---|---|---|---|
| `type` | To tell the plugin if the project is module or commonjs (to choose "import" or "require" in importing the core).| module<br/>commonjs | commonjs|
| `expandPostUpdateToFunction` |  See in following section "expandPostUpdateToFunction" | true, false | true |

### expandPostUpdateToFunction

#### Function expanding

For the post update expression, such as `a++` or `a--`, they return the original value while update themselves. So what they are really doing is like:

```js
// a++
let _ = a;
a ++;
return _;
```

However, it can only `return` for functions. Therefore, the post update will expand the original code into functions like:

```js
// let c = a ++;
let c = (() => {
    let _temp = a;
    a = _OperatorCore.executeUpdateExpression("++", a);
    return _temp;
})();
```

_Notice that if "++" only updates properties in object, due to the fact that object is not copied, only references are copied, `c` would still be updated `a` instead of non-updated. So if the original property is required instead of updated one, the class should return a **new** object everytime it updates instead of the `this`_

#### Comma expression

Expand to function is not the only choice to implement the post-update. There is another workaround which is **comma expression**.

```js
// let c = a ++;
let c = (_temp = a, a = _OperatorCore.executeUpdateExpression("++", a), _temp);
```

This would also make `c` the original value while `a` is updated. However, the problem of this stuff is it needs to declare a variable `_temp` at the beginning of each file. Therefore, it is not the default option. Set `expandPostUpdateToFunction` to `false` will let the plugin to replace it with comma expression.

