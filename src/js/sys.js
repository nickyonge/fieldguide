//@ts-check
// script for system/window-level architecture

export const devtoolsURL = import.meta.url;

// SYSTEM/WINDOW-LEVEL - imported to index FIRST, before all other imports are begun
(() => {

    // #region Console


    /** Prefix applied to {@linkcode console.if()} call message */
    const CONSOLE_IF_PREFIX = '【𝙇𝙤𝙜 𝙄𝙛】[s]\n';
    /** Should {@linkcode console.if()} calls be grouped and output full stack trace? */
    const CONSOLE_IF_OUTPUT_STACK_TRACE = false;

    const CONSOLE_STACK_FORMAT_WEBPACK_LINKS = true;

    // Add console.if (log only when the first arg is truthy)
    // bind initial log and trace vals 
    const log = Function.prototype.bind.call(console.log, console);
    const trace = Function.prototype.bind.call(console.trace, console);


    Object.defineProperty(console, 'stack', {
        get: function () {
            let s = console.stackString;
            let atIndex = s.indexOf('at ');
            if (atIndex == -1) {
                console.error("Invalid Stack Trace found, no lines exported, \"at\" not found, investigate", console.stackString);
                return [];
            }
            s = s.slice(atIndex + 3);
            s = s.replace(/\r\n|\n|\r/g, '');
            let a = s.split('at ');
            for (let i = 0; i < a.length; i++) {
                let line = a[i].trim();
                if (CONSOLE_STACK_FORMAT_WEBPACK_LINKS) {
                    let jsIndex = line.indexOf('.js');
                    let dirIndex = line.lastIndexOf('./');// use last, in case of .././js 

                    const advancedImplementation = false;
                    if (!advancedImplementation) {
                        // simple implementation 
                        let parenthesisIndex = line.indexOf(' (');
                        let func = parenthesisIndex == -1 ? '' : line.slice(0, parenthesisIndex);
                        let file = dirIndex == -1 ? '' : line.slice(dirIndex + 1).trim();
                        const stripLineColumn = true;
                        if (stripLineColumn) {
                            let colonCount = 0;
                            for (let i = 0; i < file.length; i++) {
                                if (file[i] === ':') { colonCount++; }
                            }
                            switch (colonCount) {
                                case 0:
                                case 1:
                                    if (file.lastIndexOf(')') == file.length - 1) {
                                        file = file.slice(0, file.length - 1);
                                    }
                                    break;
                                default:
                                    let colonIndex = file.indexOf(':');
                                    colonIndex = colonIndex + file.slice(colonIndex + 1).indexOf(':');// get 2nd index of :
                                    file = file.slice(0, colonIndex);
                                    break;
                            }
                        } else {
                            if (file.lastIndexOf(')') == file.length - 1) {
                                file = file.slice(0, file.length - 1);
                            }
                        }
                        // const linePrefix = 'webpack:///';// gotta ensure this is ok for prod 
                        const linePrefix = '';
                        line = `${func},${linePrefix}${file}`;
                    } else {
                        // advanced implementation

                        // gotta access the webpack context to get the hash ID of each file

                        // (webpack-internal:///./js/assetExporter.js:317:15)
                        // if (dirIndex < 0 || jsIndex < 0) {
                        //     console.warn("WARNING: invalid stack trace line, can't format webpack links", line);
                        //     continue;
                        // }
                        // let url = line.slice(0, jsIndex).slice(dirIndex - jsIndex);
                        // console.log();
                        line = line.replace('webpack-internal', 'webpack');
                        line = line.replace('///./', '///');
                        if (jsIndex >= 0) {
                            let before = line.slice(0, jsIndex);
                            let after = line.slice(jsIndex + 4);
                            line = `${before}.js?${after})`;
                        }
                        // line = 'webpack:///js/sys.js?797c:87';
                    }
                }
                a[i] = line;
            }
            return a;
        },
        configurable: false,
        enumerable: true
    });
    Object.defineProperty(console, 'stackString', {
        get: function () {
            return new Error().stack;
        },
        configurable: false,
        enumerable: true
    });


    Object.defineProperty(console, 'if', {
        /**
         * Conditional-based log - only outputs if the given conditional value is `true`.
         * Basically {@linkcode console.assert console.assert()}, except does NOT throw 
         * an error if the conditional is `false`. 
         * 
         * As per {@linkcode console.log}: Prints to stdout with newline. Multiple arguments can be passed, 
         * with the first used as the primary message and all additional used as substitution values similar 
         * to `printf(3)` (the arguments are all passed to 
         * {@linkcode https://nodejs.org/docs/latest-v24.x/api/util.html#utilformatformat-args util.format()}).
         * @param {boolean} conditional Conditional value to check; if `true`, outputs `console.log` with following params 
         * @param {any} [message=undefined] Message to pass to `console.log` 
         * @param {...any} optionalParams Optional params to pass to `console.log`
         * @example
         * const count = 5;
         * console.log('count: %d', count); // Prints: count: 5, to stdout
         * console.log('count:', count); //    Prints: count: 5, to stdout
         * 
         * @see {@linkcode https://nodejs.org/docs/latest-v24.x/api/util.html#utilformatformat-args util.format()} for more information.
         * @returns {boolean} returns the evaluated condition, to chain calls 
         */
        value(conditional, message = undefined, ...optionalParams) {
            if (!conditional) { return false; }
            let prefix = CONSOLE_IF_PREFIX;
            let stack = console.stack;
            let stackLine = '';
            for (let i = 0; i < stack.length; i++) {
                if (stack[i].indexOf('console.get') == 0 ||
                    stack[i].indexOf('console.value') == 0 ||
                    stack[i].indexOf('console.log') == 0) {
                    continue;
                }
                stackLine = stack[i];
                break;
            }
            let stackIndex = 0;
            let failsafe = 999;
            while (stackIndex >= 0 && failsafe > 0) {
                failsafe--;
                stackIndex = prefix.indexOf('[s]');
                if (stackIndex >= 0) {
                    prefix = prefix.replace('[s]', stackLine);
                }
                if (failsafe <= 0) {
                    console.error("ERROR hit while loop failsafe, this shouldn't happen, investigate, prefix: " + CONSOLE_IF_PREFIX);
                }
            }
            let msg = (typeof message == 'string' && message.trim() != '') ? `${prefix}${message}` : prefix;
            if (CONSOLE_IF_OUTPUT_STACK_TRACE) {
                console.groupCollapsed(msg);
                log(msg, ...optionalParams);
                trace();
                console.groupEnd();
            } else {
                log(msg, ...optionalParams);
            }
            return true;
        },
        configurable: false,
        writable: false,
        enumerable: true
    });

    // #endregion Console

    // #region Spread Params

    /**
     * Extract primitive types from boxed/wrapped objects 
     * @param {object|any} obj 
     * @returns {any}
     */
    function ObjectToPrimitive(obj) {
        return IsObjectBoxed(obj) ? obj.valueOf() : obj;
    }

    /**
     * Returns whether the given object is a boxed object or not
     * @param {object} obj Object to check if it's a boxed wrapper (eg `String("abc")`, returning `true`) or a primitive (eg `"abc"`, returning `false`)
     * @param {boolean} [preserveType=true] Preserve types on objects that have a `valueOf` that returns the object converted to a different type (eg `Date`, as `Date().valueOf()` returns a `number`). If `preserveType` is true, `Date` would return `false`.
     * @returns {boolean} 
     */
    function IsObjectBoxed(obj, preserveType = true) {
        if (obj == null) { return false; }
        // I hate it, but use try/catch in case of proxies, or objects that have mucked with valueOf 
        try {
            if (preserveType) {
                // ensure a specific valid boxed object - strnig, number, boolean, bigint, or symbol
                let tag = Object.prototype.toString.call(obj);
                if (tag != null && typeof tag === 'string') { tag = tag.toLowerCase().trim(); }
                switch (tag) {
                    case '[object string]':
                    case '[object number]':
                    case '[object boolean]':
                    case '[object bigint]':
                    case '[object symbol]':
                        // return the primitive via valueOf
                        return true;
                }
                // passed the switch, presumably not an object or a boxed primitive with alternate value, eg Date, array, objects, etc 
            } else {
                // just check if the given object has a valueOf callback
                if (obj['valueOf'] && typeof obj.valueOf === 'function') {
                    return true;
                }
            }
        } catch {
            console.warn(`WARNING: Failed to determine if object: ${obj}, is primitive, preserveType: ${preserveType}, returning false`, obj);
        }
        // not a boxed primitive, or it IS a boxed primitive and type is being preserved 
        return false;
    }

    /**
     * Flatten value into a 1D array (incl recursive arrays), optionally 
     * skipping null values, and optionally ignoring duplicate values, and
     * returns the result as a new array.
     * 
     * **Note:** Arrays are flattened, but other collections (eg `Set`) are treated as single values.
     * @this {any} `this` can be of any input type
     * @param {boolean} [allowNullValues=true] Are `null` and `undefined` values allowed? Default `true`
     * @param {boolean} [allowDuplicateValues=true] Are duplicate values allowed? Default `true`
     * @returns {any[]} 
     */
    function flattenSpread(allowNullValues = true, allowDuplicateValues = true) {

        // get primitive 
        const root = ObjectToPrimitive(this);

        // prep output, and if input value isn't an array, make it one
        /** @type {any[]} */ const out = [];
        /** @type {any[]} */ const stack = Array.isArray(root) ? [...root] : [root];

        let failsafe = (stack.length) + 999;
        while (stack.length) {
            // decrement failsafe 
            failsafe--;

            // get first value out of the array 
            const firstValue = stack.shift();

            // check if allowing null/undefined values 
            if (firstValue == null) {
                if (allowNullValues) {
                    // allowed, push to output 
                    out.push(firstValue);
                }
                continue;
            }

            // deep flatten nested arrays 
            if (Array.isArray(firstValue)) {
                if (firstValue.length > 0) {
                    failsafe += firstValue.length + 1;
                    stack.unshift(...firstValue);
                }
                continue;
            }

            // push to output 
            out.push(firstValue);

            if (failsafe <= 0) {
                console.error("ERROR: while loop hit failsafe while flattening spread param, this shouldn't happen, investigate", this);
                break;
            }
        }

        // if removing duplicate values, convert out to set 
        // this remove duplicates while preserving order. objects/functions are compared by reference
        return allowDuplicateValues ? out : [...new Set(out)];
    }

    // define the flattenSpread property itself 
    Object.defineProperty(Object.prototype, 'flattenSpread', {
        value: flattenSpread,
        writable: true,
        configurable: true,
        enumerable: false
    });

    // #endregion Spread Params

})();
