import type { BasicComponent } from './src/js/components/base';

declare global {

    // #region TypeDefs 

    /**
     * Alternative receiving param for string spread params. 
     * Instead of `...string`, use `spreadString`. Can receive 
     * single values, arrays, and nested arrays.
     * 
     * **Note:** call {@linkcode String.flattenSpread flattenSpread()} 
     * to convert any received values to a 1D array.
     * 
     * A string-limited version of {@linkcode spreadValue}. */
    type spreadString = string[] | [string[]] | [string, ...string[]];
    /**
     * Alternative receiving param for value spread params. 
     * Instead of `...any`, use `spreadValue`. Can receive 
     * single values, arrays, and nested arrays.
     * 
     * **Note:** call {@linkcode String.flattenSpread flattenSpread()} 
     * to convert any received values to a 1D array. */
    type spreadValue = any[] | [any[]] | [any, ...any[]];

    // #endregion TypeDefs

    // #region Node
    interface Node {

        /**
         * Calls the function with the specified object as the this 
         * value and the specified rest arguments as the arguments.
         * @param thisArg The object to be used as the this object.
         * @param args Argument values to be passed to the function.
         * @override This overrides 
         * {@linkcode Node.prototype.appendChild appendChild} to 
         * allow directly adding {@linkcode BasicComponent} classes.
         */
        appendChild<T extends Node | BasicComponent>(Node: T): Node;

    }
    // #endregion Node

    // #region Object 
    interface Object {
        /**
         * Flatten value into a 1D array (incl recursive arrays), optionally 
         * skipping null values, and optionally ignoring duplicate values, and
         * returns the result as a new array.
         * 
         * **Note:** Arrays are flattened, but other collections (eg `Set`) are treated as single values.
         * @param {boolean} [allowNullValues=true] Are `null` and `undefined` values allowed? Default `true`
         * @param {boolean} [allowDuplicateValues=true] Are duplicate values allowed? Default `true`
         * @returns {any[]} 
         */
        flattenSpread(allowNullValues?: boolean, allowDuplicateValues?: boolean): any[];
    }
    // #endregion Object

    // #region Array 
    interface Array<T> {

        /**
         * Flatten array values in this array into a 1D array (incl recursive arrays), 
         * optionally skipping null values, and optionally ignoring duplicate values, 
         * and return the result as a new array.
         * 
         * **Note:** Arrays are flattened, but other collections (eg `Set`) are treated as single values.
         * @param {boolean} [allowNullValues=true] Are `null` and `undefined` values allowed? Default `true`
         * @param {boolean} [allowDuplicateValues=true] Are duplicate values allowed? Default `true`
         * @returns {any[]} 
         */
        flattenSpread(allowNullValues?: boolean, allowDuplicateValues?: boolean): any[];

        /**
         * Optionally-assigned name for this array 
         * @type {string} */
        name?: string;

        /**
         * Optionally-defined flag that prevents {@linkcode onChange} 
         * callbacks from invoking, even if they're defined.
         */
        suppressOnChange?: boolean;

        /**
         * Checks if the given value is contained anywhere in this array
         * @param {T} value Value to check for 
         * @returns {boolean}
         * @type {<T>(value:T): boolean}
         * @template T 
         */
        contains: (value: T) => boolean;
        /**
         * Checks if ANY of the given values are contained in this array
         * @param {...T} value Values to check for 
         * @returns {boolean}
         * @type {<T>(...value:T[]): boolean}
         * @template T 
         */
        containsAny: (...value: T[]) => boolean;
        /**
         * Checks if ALL of the given values are contained in this array
         * @param {...T} value Values to check for 
         * @returns {boolean}
         * @type {<T>(...value:T[]): boolean}
         * @template T 
         */
        containsAll: (...value: T[]) => boolean;

        /**
         * Removes all `null` and `undefined` values from this array. 
         * Returns the number of values removed.
         * @returns {number}
         * @type {(): number}
         */
        removeNullValues: () => number;

        /**
         * Callback invoked whenever a {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#copying_methods_and_mutating_methods mutating} 
         * method is called on an array - that is, a method that directly modifies
         * the given array, and doesn't simply reference it (eg, `find()`) or that
         * itself returns an entirely new array or type (eg, `slice()` or `join()`). 
         * Also called when {@linkcode Array.prototype.name name} is changed.
         * 
         * All {@link Array.prototype} mutating methods, and thus possible values for `type`, include (with parameters): 
         * - ≠ {@linkcode Array.prototype.copyWithin copyWithin}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/copyWithin 📄}: 3 params: `[ target:number, start:number, end?:number=undefined ]` 
         * - ≠ {@linkcode Array.prototype.fill fill}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/fill 📄}: 3 params: `[ value:T, start?:number, end?:number ]` 
         * - − {@linkcode Array.prototype.pop pop}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/pop 📄}: 0 params: `[]` 
         * - \+ {@linkcode Array.prototype.push push}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/push 📄}: 0 + [... spread] params: `[...items:any[] ]` 
         * - ≈ {@linkcode Array.prototype.reverse reverse}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reverse 📄}: 0 params: `[]` 
         * - − {@linkcode Array.prototype.shift shift}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/shift 📄}: 0 params: `[]` 
         * - ≈ {@linkcode Array.prototype.sort sort}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort 📄}: 1 param: `[ compareFn?:(a:any, b:any):number ]` 
         * - − {@linkcode Array.prototype.splice splice}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice 📄}: 2 + [... spread] params: `[ start:number, deleteCount?:number=0, ...items:any[] ]`
         * - \+ {@linkcode Array.prototype.unshift unshift}{@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/unshift 📄}: 0 + [... spread] params: `[...items:any[] ]` 
         * 
         * Key:
         * - \+: Method adds a new value to the array 
         * - −: Method removes a value from the array 
         * - ≈: Method modifies the order of, but does not change, the values of the array 
         * - ≠: Method modifies the values of, but not the overall length of, the array 
         * - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array 📄}: Clickable link to the relevant online documentation
         * 
         * @param {string} type The name of the method used on the array, as a string. Eg, `"push"` for {@linkcode Array.prototype.push array.push()}. See {@linkcode onChange} description for a comprehensive list. 
         * @param {T[]} updatedArray The array object itself that was modified 
         * @param {T[]} previousArray A {@linkcode Array.clone clone} of the original array, before modification. **NOT** a deep clone - it's a new array, with intact original references.
         * @param {T} returnValue The value returned by the modified method. Eg, for `type = "pop"`, returns the array's now-removed last element, as per {@linkcode Array.prototype.pop array.pop()}.
         * @param {...T} [parameters=undefined] All parameter values supplied to the array in the invoked method. See {@linkcode onChange} description for a comprehensive list. 
         * @returns {void}
         * 
         * Callback is also invoked for changes of the following properties: 
         * - {@linkcode Array.prototype.name}, 1 param: `[ previousName:string ]`, and a `returnValue` of the newly-assigned `name` value
         * 
         * **NOTE:** the `onChange` callback is NOT invoked when: 
         *  - {@linkcode Array.prototype.length array.length} value is changed 
         *  - A value in the array, eg `myArray[0] = x`, is directly changed 
         * @type {(type:string, source:T[], returnValue:T, ...parameters:T[]): T}
         * @template T 
         */
        onChange?: (type: string, updatedArray: T[], previousArray: T[], returnValue: T, ...parameters: T[]) => any;

        /**
         * Returns this array after copying a section of the array identified by start and end
         * to the same array starting at position target
         * @param {Number} target If target is negative, it is treated as length+target where length is the
         * length of the array.
         * @param {Number} start If start is negative, it is treated as length+start. If end is negative, it
         * is treated as length+end.
         * @param {Number} [end=this.length] If not specified, length of the this object is used as its default value.
         * @returns {T[]} This array, after modification
         * @override This overrides {@linkcode Array.prototype.copyWithin copyWithin} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {(target: number, start: number, end?: number): T[]} 
         * @template T 
         */
        copyWithin(target: number, start: number, end?: number): T[];

        /**
         * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
         * @param {T} value value to fill array section with
         * @param {Number} [start=0] index to start filling the array at. If start is negative, it is treated as
         * length+start where length is the length of the array. If undefined, 0 is used.
         * @param {Number} [end=this.length] index to stop filling the array at. If end is negative, it is treated as
         * length+end. If undefined, array.length is used.
         * @returns {T[]} The modified array
         * @override This overrides {@linkcode Array.prototype.fill fill} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(value: T, start?: number, end?: number): T[]}
         * @template T 
         */
        fill<T>(value: T, start?: number, end?: number): T[]

        /**
         * Removes the last element from an array and returns it.
         * If the array is empty, undefined is returned and the array is not modified.
         * @returns {T | undefined} The now-removed last element of the array (or `undefined`)
         * @override This overrides {@linkcode Array.prototype.pop pop} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(): T | undefined}
         * @template T 
         */
        pop<T>(): T | undefined;

        /**
         * Appends new elements to the end of an array, and returns the new length of the array.
         * @param {...T} items New elements to add to the array.
         * @returns {Number} The new length of the array 
         * @override This overrides {@linkcode Array.prototype.push push} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(...items: T[]): number}
         * @template T 
         */
        push<T>(...items: T[]): number;

        /**
         * Removes the given value from the array, via {@linkcode splice}.
         * @param {T} value Value to remove from the array
         * @returns {T|null} Returns removed value, or `null` if the value wasn't found or couldn't be removed 
         * @type {<T>(value: T): T}
         * @template T 
         */
        remove<T>(value: T): T;

        /**
         * Removes the value at the given index from the array, via {@linkcode splice}.
         * 
         * Largely a convenience method, basically just  
         * @param {number} index Index to remove the value of from the array
         * @returns {T|null} Returns removed value, or `null` if the value wasn't found or couldn't be removed 
         * @type {<T>(value: T): T}
         * @template T 
         */
        removeAt<T>(index: number): T;

        /**
         * Reverses the elements in an array in place.
         * This method mutates the array and returns a reference to the same array.
         * @returns {T[]} Returns a reference to this same, now reversed, array 
         * @override This overrides {@linkcode Array.prototype.reverse reverse} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(): T[]}
         * @template T 
         */
        reverse<T>(): T[];

        /**
         * Removes the first element from an array and returns it.
         * If the array is empty, undefined is returned and the array is not modified.
         * @returns {T[] | undefined} The now-removed first element of the array (or `undefined`)
         * @override This overrides {@linkcode Array.prototype.shift shift} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(): T[] | undefined}
         * @template T 
         */
        shift<T>(): T[] | undefined;

        /**
         * Sorts an array in place.
         * This method mutates the array and returns a reference to the same array.
         * @param {(a: T, b: T): number} compareFn Function used to determine the order of the elements. It is expected to return
         * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
         * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
         * ```ts
         * [11,2,22,1].sort((a, b) => a - b)
         * ```
         * @returns {Array<T>} Reference to this array object 
         * @override This overrides {@linkcode Array.prototype.sort sort} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(compareFn?: (a: T, b: T): number): T[]}
         * @template T 
         */
        sort<T>(compareFn?: (a: T, b: T) => number): T[];

        /**
         * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
         * @param {Number} start The zero-based location in the array from which to start removing elements.
         * @param {Number} [deleteCount=0] The number of elements to remove. Omitting this argument will remove all elements from the start
         * paramater location to end of the array. If value of this argument is either a negative number, zero, undefined, or a type
         * that cannot be converted to an integer, the function will evaluate the argument as zero and not remove any elements.
         * @param {...T} [items=undefined] Optional elements to add to the array. If omitted, will only remove elements from the array.
         * @returns {T[]} An array containing the elements that were deleted, including `[]` if nothing was deleted.
         * @override This overrides {@linkcode Array.prototype.splice splice} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(start: number, deleteCount?: number, ...items: T[]): T[]}
         * @template T 
         */
        splice<T>(start: number, deleteCount?: number, ...items: T[]): T[];

        /**
         * Inserts new elements at the start of an array, and returns the new length of the array.
         * @param {...T} items Elements to insert at the start of the array.
         * @returns {Number} The new length of the array.
         * @override This overrides {@linkcode Array.prototype.unshift unshift} to allow for 
         * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
         * @type {<T>(...items: T[]): number}
         * @template T 
         */
        unshift<T>(...items: T[]): number;

        /**
         * Returns a clone of this array, either using `Array.from()` or (if {@link Array.structuredClone deep cloning}) 
         * `structuredClone` (or `JSON.stringify`/`JSON.parse` if array values aren't serializable).
         * @param {boolean} [deepClone=false] Use `structuredClone` copy? If false, uses `Array.from()`. Default `false`
         * @returns {T[]} The newly cloned version of the given array 
         * @type {<T>(deepClone:boolean): T[]}
         * @template T 
         */
        clone<T>(deepClone?: boolean): T[];

        /**
         * Returns a `structuredClone` copy of this array, for deep cloning. 
         * Deep cloning creates new value instances for property editing.
         * 
         * **Note:** All values in the array must be serializable to use 
         * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone structuredClone}.
         * If array contains any non-serializable values such as an `Object`,
         * a try-catch statement will instead use `JSON.parse(JSON.stringify(myArray))`, 
         * which is more expensive, but will successfully create a deep clone
         * of non-serializable values.
         * @returns {T[]} The newly cloned version of the given array 
         * @type {<T>(): T[]}
         * @template T 
         */
        structuredClone<T>(): T[];
        /**
         * Returns a `structuredClone` copy of this array, for deep cloning. 
         * Deep cloning creates new value instances for property editing.
         * 
         * Convenience, alternate name of {@linkcode Array.structuredClone}.
         * 
         * **Note:** All values in the array must be serializable to use 
         * {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Window/structuredClone structuredClone}.
         * If array contains any non-serializable values such as an `Object`,
         * a try-catch statement will instead use `JSON.parse(JSON.stringify(myArray))`, 
         * which is more expensive, but will successfully create a deep clone
         * of non-serializable values.
         * @returns {T[]} The newly cloned version of the given array 
         * @type {<T>(): T[]}
         * @template T 
         * @borrows structuredClone as deepClone
         */
        deepClone<T>(): T[];

    }
    // #endregion Array

    // #region Number 
    interface Number {

        /** 
         * Converts the given number to string to the given max number of decimals, 
         * while (unlike `toFixed`) also removing any trailing zeros. 
         * @param {number|boolean} [maxDecimals=3] 
         * Either max decimals, or (if bool) ensure-one-decimal flag. Default `3`
         * - **If Number:**  
         * Maximum, not mandatory, decimal places.  
         * If `-1`, returns as string with no limiting. 
         * Otherwise, must be between `0` and `20`, per 
         * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/toFixed toFixed() docs}.
         * - **If Boolean:**  
         * Convenience, serves the place of {@linkcode ensurOneDecimal}.  
         * If `true`, enforces a `".0"` at the end of integers, so `33` becomes `"33.0"`. 
         * If `false`, integers like `33` can return without decimals. The default 
         * value of {@linkcode ensurOneDecimal} is `false`.
         * @param {boolean} [ensurOneDecimal = false]
         * If the value has no decimal values, should one be inserted? 
         * Eg, `33` becomes `33.0`. Default `false`
         * @returns {string}
         * @example
         * console.log(toMax(33.333333, 3)); // "33.333"
         * console.log(toMax(33.3, 3));      // "33.3"
         * console.log(toFixed(33.3, 3));    // "33.300"
         * console.log(toMax(33));           // "33"
         * console.log(toMax(33, true));     // "33.0"
         */
        toMax(maxDecimals?: number | boolean, ensurOneDecimal?: boolean): string;

        /** 
         * Clamps a number between the given minimum and maximum values, 
         * and returns the clamped value. 
         * 
         * By default, clamps between 0 and 1.
         * @param {number} [min = 0] Minimum possible value (default `0`)
         * @param {number} [max = 1] Maximum possible value (default `1`)
         * @returns {number} */
        clamp(min?: number, max?: number): number;

        /**
         * Checks if this number is between the given minimum and maximum values.
         * @param {number} min Minimum bound value 
         * @param {number} max Maximum bound value 
         * @param {boolean} [inclusive=true] Does exactly matching a bound count as being between? Default `true` 
         * @returns {boolean} */
        isBetween(min: number, max: number, inclusive?: boolean): boolean;

        /**
         * Checks if this number is even, returning `true`, or odd, returning `false`
         * @see {@link Number.isOdd isOdd}
         * @returns {boolean} */
        isEven(): boolean;
        /**
         * Checks if this number is odd, returning `true`, or even, returning `false`
         * @see {@link Number.isEven isEven}
         * @returns {boolean} */
        isOdd(): boolean;
    }
    // #endregion Number

    // #region String 
    interface String {

        /**
         * Flatten string into a 1D array (incl recursive arrays), optionally 
         * skipping null values, and optionally ignoring duplicate values, and
         * returns the result as a new array. 
         * 
         * This is present largely as a typesafe way to accommodate functions 
         * that take ...spread param input and/or single string input.
         * @param {boolean} [allowNullValues=true] Are `null` and `undefined` values allowed? Default `true`
         * @param {boolean} [allowDuplicateValues=true] Are duplicate values allowed? Default `true`
         * @returns {string[]} 
         */
        flattenSpread(allowNullValues?: boolean, allowDuplicateValues?: boolean): string[];

        /**
         * Counts the number of times the given character or string is found 
         * within this string. 
         * @param {string} countString String/char to count the instances of 
         * @param {boolean?} [allowOverlap = false] 
         * Should overlapping values be included individually? Has no impact if 
         * searching for a single character. Default `false` 
         * 
         * If overlapping is disabled, after finding a match, the search index 
         * will skip past the match's length.
         * 
         * ---
         * Eg, if searching `"AAAAA"` for `"AAA"`, that value overlaps multiple 
         * times. 
         * 
         * If `allowOverlap` is `true`, it will return `3`
         * - `"[AAA]AA"` 1, `"A[AAA]A"` 2, and `"AA[AAA]"` 3 
         * 
         * However, if `allowOverlap` is `false`, it will return `1` 
         * - `"[AAA]AA"` 1, then skip to: `"AAA↓AA"`  
         * - The remaining string, `"AA"`, cannot contain `"AAA"`; return `1`  
         * @returns {number}
         */
        count(countString: string, allowOverlap?: boolean): number;

        /**
         * Removes the first instance of the given string or expression. 
         * Returns the modified string. 
         * 
         * Convenience, shorthand for `string.replaceAll(removeValue,'')`
         * @param {string | RegExp} removeValue Value to remove
         * @returns {string} 
         */
        remove(removeValue: string): string;
        /**
         * Removes all instances of the given string or expression. 
         * Returns the modified string. 
         * 
         * Convenience, shorthand for `string.replaceAll(removeValue,'')`
         * @param {string | RegExp} removeValue Value to remove
         * @returns {string} 
         */
        removeAll(removeValue: string): string;

        // DPJS_TO_DO: String.prototype.getNumber / getNumbers 
        // Issue URL: https://github.com/nickyonge/evto-web/issues/74

        /**
         * Extracts a number from a string. Returns the first number found, 
         * separated by non-numeric characters (eg, `"num1 and num2"`) returns `1`.
         * If no number is found, returns `null`.
         * 
         * To get all numbers in a string, see {@linkcode getNumbers}.
         * @param allowNegative Are negative values (prefixed with `-`) allowed? Default `true`
         * @param allowDecimal Are decimal values allowed? Default `true`
         */
        // getNumber(allowNegative?: boolean, allowDecimal?: boolean): number;

        /**
         * Extracts a number from a string. Numbers are separated by any 
         * non-numeric characters (eg, `"num1 and num2"`) returns `[1,2]`.
         * If no number is found, returns `[]`.
         * 
         * To get the first number in a string, see {@linkcode getNumbers}.
         * @param allowNegative Are negative values (prefixed with `-`) allowed? Default `true`
         * @param allowDecimal Are decimal values allowed? Default `true`
         */
        // getNumbers(allowNegative?: boolean, allowDecimal?: boolean): number[];

    }
    // #endregion String 

    // #region Console 
    interface Console {

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
         * @param {...any} [optionalParams] Optional params to pass to `console.log`
         * @example
         * const count = 5;
         * console.log('count: %d', count); // Prints: count: 5, to stdout
         * console.log('count:', count); //    Prints: count: 5, to stdout
         * 
         * @see {@linkcode https://nodejs.org/docs/latest-v24.x/api/util.html#utilformatformat-args util.format()} for more information.
         */
        if(conditional: boolean, message?: any, ...optionalParams: any[]): void;

        /**
         * Return the current stack trace, formatted as an array
         * where each index is the next line in the stack output.
         * @returns {string[]} Stack trace, formatted into a string array */
        stack: string;

        /**
         * Return the current stack trace as an unformatted string. 
         * 
         * Equivalent to calling `new Error().stack;`
         * @type {string}
         */
        stackString: string;

    }
    // #endregion Console

    // #region Element 
    interface Element {

        // mostly typesafe declaration 
        // (there's almost definitely a better way of doing this, but I'm tired of TS telling me that things that DO exist, don't) 
        checked?: boolean;
        defaultChecked?: boolean;
        value?: string | number | boolean;
        draggable?: 'true' | 'false' | 'auto' | boolean;
        style?: CSSStyleDeclaration;
        disabled?: boolean;

        _priorDraggable?: [any];
        _priorPointerEvents?: [any];

        /** Removes keyboard focus from this element. @returns {void} */
        blur(): void;

        /** Simulates a mouse click on an element. @returns {void} */
        click(): void;

        /**
         * Sets focus on the specified element, if it can be focused. The focused element is the element that will receive keyboard and similar events by default.
         * @param {object} [options=undefined] An optional object for controlling aspects of the focusing process
         * @see https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus
         */
        focus(options?: {
            /** A boolean value indicating whether or not the browser should scroll the document to bring the newly-focused element into view. Default `false` */
            preventScroll?: boolean,
            /** A boolean value that should be set to `true` to force, or `false` to prevent visible indication that the element is focused. Default `undefined`, deferring to browser accessibility settings. */
            focusVisible?: boolean
        }): void;
    }
    // #endregion Element

}

export { };