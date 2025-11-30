//@ts-check
// script for document-level architecture

import { BasicComponent } from "./components/base";
import { isBlank, IsStringNameSafe } from "./lilutils";

// DOCUMENT-LEVEL - imported to index LAST, after all other imports are completed
(() => {

    // #region Enums
    
    globalThis.BlendMode = {
        /** The final color is the top color, regardless of what the bottom color is. The effect is like two opaque pieces of paper overlapping. */
        Normal: 'normal',
        /** The final color is the result of multiplying the top and bottom colors. A black layer leads to a black final layer, and a white layer leads to no change. The effect is like two images printed on transparent film overlapping. */
        Multiply: 'multiply',
        /** The final color is the result of inverting the colors, multiplying them, and inverting that value. A black layer leads to no change, and a white layer leads to a white final layer. The effect is like two images shining onto a projection screen. */
        Screen: 'screen',
        /** The final color is the result of {@linkcode Multiply multiply} if the bottom color is darker, or {@linkcode Screen screen} if the bottom color is lighter. This blend mode is equivalent to {@linkcode HardLight hard-light} but with the layers swapped. */
        Overlay: 'overlay',
        /** The final color is composed of the darkest values of each color channel. */
        Darken: 'darken',
        /** The final color is composed of the lightest values of each color channel. */
        Lighten: 'lighten',
        /** The final color is the result of dividing the bottom color by the inverse of the top color. A black foreground leads to no change. A foreground with the inverse color of the backdrop leads to a fully lit color. This blend mode is similar to {@linkcode Screen screen}, but the foreground only needs to be as light as the inverse of the backdrop to create a fully lit color. */
        ColorDodge: 'color-dodge',
        /** The final color is the result of inverting the bottom color, dividing the value by the top color, and inverting that value. A white foreground leads to no change. A foreground with the inverse color of the backdrop leads to a black final image. This blend mode is similar to {@linkcode Multiply multiply}, but the foreground only needs to be as dark as the inverse of the backdrop to make the final image black. */
        ColorBurn: 'color-burn',
        /** The final color is the result of {@linkcode Multiply multiply} if the top color is darker, or {@linkcode Screen screen} if the top color is lighter. This blend mode is equivalent to overlay but with the layers swapped. The effect is similar to shining a harsh spotlight on the backdrop. */
        HardLight: 'hard-light',
        /** The final color is similar to {@linkcode HardLight hard-light}, but softer. This blend mode behaves similar to {@linkcode HardLight hard-light}. The effect is similar to shining a diffused spotlight on the backdrop. */
        SoftLight: 'soft-light',
        /** The final color is the result of subtracting the darker of the two colors from the lighter one. A black layer has no effect, while a white layer inverts the other layer's color. */
        Difference: 'difference',
        /** The final color is similar to {@linkcode Difference difference}, but with less contrast. As with {@linkcode Difference difference}, a black layer has no effect, while a white layer inverts the other layer's color. */
        Exclusion: 'exclusion',
        /** The final color has the *hue* of the top color, while using the *saturation* and *luminosity* of the bottom color. */
        Hue: 'hue',
        /** The final color has the *saturation* of the top color, while using the *hue* and *luminosity* of the bottom color. A pure gray backdrop, having no saturation, will have no effect. */
        Saturation: 'saturation',
        /** The final color has the *hue* and *saturation* of the top color, while using the *luminosity* of the bottom color. The effect preserves gray levels and can be used to colorize the foreground. */
        Color: 'color',
        /** The final color has the *luminosity* of the top color, while using the *hue* and *saturation* of the bottom color. This blend mode is equivalent to {@linkcode Color color}, but with the layers swapped. */
        Luminosity: 'luminosity',
    };

    // #endregion Enums 

    // #region Node 

    /** 
     * The `appendChild()` method of the Node interface adds a node to the end of the list of children of a specified parent node. 
     * @type {(Node: any) => Node} 
     */
    const _appendChild = Node.prototype.appendChild;

    /**
     * Calls the function with the specified object as the this 
     * value and the specified rest arguments as the arguments.
     * @param {Node} childNode
     * @override This overrides 
     * {@linkcode Node.prototype.appendChild appendChild} to 
     * allow directly adding {@linkcode BasicComponent} classes.
     */
    Node.prototype.appendChild = function (childNode) {
        // if appending a BasicComponent directly, add its div
        if (typeof childNode === 'object' &&
            childNode instanceof BasicComponent) {
            return _appendChild.call(this, childNode.div);
        }
        // original method
        return _appendChild.call(this, childNode);
    };

    // #endregion Node

    // #region Array


    /** unique symbol for arrayName internal property */
    const _arrayName = Symbol('arrayName');
    Object.defineProperty(Array.prototype, 'name', {
        /** 
         * Optionally-assigned name for this array
         * @returns {string} */
        get: function () { return this[_arrayName] || undefined; },
        /**
         * Optionally-assigned name for this array
         * @param {string|undefined} [name=undefined] Name to assign to this array. Default `undefined`
         * @returns {void} */
        set: function (name) {
            if (name === null || name === undefined) {
                // null and undefined are acceptable 
            } else {
                if (typeof name !== 'string') {
                    throw new TypeError('Array name must be string, null, or undefined')
                }
            }
            if (name != null) {
                if (!IsStringNameSafe(name, true, false)) {
                    throw new SyntaxError(('Array name must only contain alphanumeric characters, ' +
                        'underscores, or dollar signs (no whitespace), and cannot be a single underscore, ' +
                        `and cannot begin with a number. Invalid name: ${name}`));
                }
            }
            if (this[_arrayName] === name) { return; } // don't change if new name is identical 
            if (this.hasOwnProperty('onChange')) {
                let prevName = this[_arrayName];
                let prevArray = this.clone();
                const array = /** @type {Array} */ (this);
                if (array.suppressOnChange != true) {
                    array.onChange('name', array, prevArray, name, prevName);
                }
            }
            this[_arrayName] = name;
        },
        configurable: true,
        enumerable: true,
    });

    // all mutating functions for an array: 
    // copyWithin, fill, pop, push, reverse, shift, sort, splice, unshift

    /**
     * Returns this array after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param {Number} target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param {Number} start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param {Number} [end=this.length] If not specified, length of the this object is used as its default value.
     * @returns {any[]} This array, after modification
     * @override This overrides {@linkcode Array.prototype.copyWithin copyWithin} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _copyWithin = Array.prototype.copyWithin;
    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param {any} value value to fill array section with
     * @param {Number} [start=0] index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array. If undefined, 0 is used.
     * @param {Number} [end=this.length] index to stop filling the array at. If end is negative, it is treated as
     * length+end. If undefined, array.length is used.
     * @returns {any[]} The modified array
     * @override This overrides {@linkcode Array.prototype.fill fill} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _fill = Array.prototype.fill;
    /**
     * Removes the last element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     * @returns {any | undefined} The now-removed last element of the array (or `undefined`)
     * @override This overrides {@linkcode Array.prototype.pop pop} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _pop = Array.prototype.pop;
    /**
     * Appends new elements to the end of an array, and returns the new length of the array.
     * @param {...any} items New elements to add to the array.
     * @returns {Number} The new length of the array 
     * @override This overrides {@linkcode Array.prototype.push push} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _push = Array.prototype.push;
    /**
     * Reverses the elements in an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @returns {any[]} Returns a reference to this same, now reversed, array 
     * @override This overrides {@linkcode Array.prototype.reverse reverse} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _reverse = Array.prototype.reverse;
    /**
     * Removes the first element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     * @returns {any[] | undefined} The now-removed first element of the array (or `undefined`)
     * @override This overrides {@linkcode Array.prototype.shift shift} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _shift = Array.prototype.shift;
    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @param {(a: any, b: any) => number} compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     * @returns {Array<any>} Reference to this array object 
     * @override This overrides {@linkcode Array.prototype.sort sort} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _sort = Array.prototype.sort;
    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param {Number} start The zero-based location in the array from which to start removing elements.
     * @param {Number} [deleteCount=0] The number of elements to remove. Omitting this argument will remove all elements from the start
     * paramater location to end of the array. If value of this argument is either a negative number, zero, undefined, or a type
     * that cannot be converted to an integer, the function will evaluate the argument as zero and not remove any elements.
     * @param {...any} [items=undefined] Optional elements to add to the array. If omitted, will only remove elements from the array.
     * @returns {any[]} An array containing the elements that were deleted, including `[]` if nothing was deleted.
     * @override This overrides {@linkcode Array.prototype.splice splice} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _splice = Array.prototype.splice;
    /**
     * Inserts new elements at the start of an array, and returns the new length of the array.
     * @param {...any} items Elements to insert at the start of the array.
     * @returns {Number} The new length of the array.
     * @override This overrides {@linkcode Array.prototype.unshift unshift} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    const _unshift = Array.prototype.unshift;
    /**
     * Returns this array after copying a section of the array identified by start and end
     * to the same array starting at position target
     * @param {Number} target If target is negative, it is treated as length+target where length is the
     * length of the array.
     * @param {Number} start If start is negative, it is treated as length+start. If end is negative, it
     * is treated as length+end.
     * @param {Number} [end=this.length] If not specified, length of the this object is used as its default value.
     * @returns {any[]} This array, after modification
     * @override This overrides {@linkcode Array.prototype.copyWithin copyWithin} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     * @type {(target: number, start: number, end?: number) => any[]} 
     */
    Array.prototype.copyWithin = function (target, start, end = this.length) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _copyWithin.call(this, target, start, end);
            if (this.suppressOnChange != true) {
                this.onChange('copyWithin', this, prev, v, target, start, end);
            }
            return v;
        }
        return _copyWithin.call(this, target, start, end);
    };


    /**
     * Changes all array elements from `start` to `end` index to a static `value` and returns the modified array
     * @param {any} value value to fill array section with
     * @param {Number} [start=0] index to start filling the array at. If start is negative, it is treated as
     * length+start where length is the length of the array. If undefined, 0 is used.
     * @param {Number} [end=this.length] index to stop filling the array at. If end is negative, it is treated as
     * length+end. If undefined, array.length is used.
     * @returns {any[]} The modified array
     * @override This overrides {@linkcode Array.prototype.fill fill} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.fill = function (value, start = 0, end = this.length) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _fill.call(this, value, start, end);
            if (this.suppressOnChange != true) {
                this.onChange('fill', this, prev, v, value, start, end);
            }
            return v;
        }
        return _fill.call(this, value, start, end);
    };

    /**
     * Removes the last element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     * @returns {any | undefined} The now-removed last element of the array (or `undefined`)
     * @override This overrides {@linkcode Array.prototype.pop pop} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.pop = function () {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _pop.call(this);
            if (this.suppressOnChange != true) {
                this.onChange('pop', this, prev, v);
            }
            return v;
        }
        return _pop.call(this);
    };

    /**
     * Appends new elements to the end of an array, and returns the new length of the array.
     * @param {...any} items New elements to add to the array.
     * @returns {Number} The new length of the array 
     * @override This overrides {@linkcode Array.prototype.push push} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.push = function (...items) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _push.call(this, ...items);
            if (this.suppressOnChange != true) {
                this.onChange('push', this, prev, v, ...items);
            }
            return v;
        }
        return _push.call(this, ...items);
    };

    /**
     * Removes the given value from the array, via {@linkcode Array.splice}.
     * @param {any} value Value to remove from the array
     * @returns {any|null} Returns removed value, or `null` if the value wasn't found or couldn't be removed 
     */
    Array.prototype.remove = function (value) {
        let i = this.indexOf(value);
        if (i == -1) { return null; }
        return this.splice(i, 1)[0];
    }

    /**
     * Removes the value at the given index from the array, via {@linkcode Array.splice}.
     * 
     * Largely a convenience method, basically just `splice(index)`
     * @param {number} index Index to remove the value of from the array
     * @returns {any|null} Returns removed value, or `null` if the index was < 0, or > array length. 
     * 
     * **Note:** May also return `null` if the value at the index itself was `null`.
     */
    Array.prototype.removeAt = function (index) {
        if (index < 0 || index >= this.length) { return null; }
        return this.splice(index, 1)[0];
    }

    /**
     * Reverses the elements in an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @returns {any[]} Returns a reference to this same, now reversed, array 
     * @override This overrides {@linkcode Array.prototype.reverse reverse} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.reverse = function () {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _reverse.call(this);
            if (this.suppressOnChange != true) {
                this.onChange('reverse', this, prev, v);
            }
            return v;
        }
        return _reverse.call(this);
    };

    /**
     * Removes the first element from an array and returns it.
     * If the array is empty, undefined is returned and the array is not modified.
     * @returns {any[] | undefined} The now-removed first element of the array (or `undefined`)
     * @override This overrides {@linkcode Array.prototype.shift shift} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.shift = function () {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _shift.call(this);
            if (this.suppressOnChange != true) {
                this.onChange('shift', this, prev, v);
            }
            return v;
        }
        return _shift.call(this);
    };

    /**
     * Sorts an array in place.
     * This method mutates the array and returns a reference to the same array.
     * @param {(a: any, b: any) => number} compareFn Function used to determine the order of the elements. It is expected to return
     * a negative value if the first argument is less than the second argument, zero if they're equal, and a positive
     * value otherwise. If omitted, the elements are sorted in ascending, UTF-16 code unit order.
     * ```ts
     * [11,2,22,1].sort((a, b) => a - b)
     * ```
     * @returns {Array<any>} Reference to this array object 
     * @override This overrides {@linkcode Array.prototype.sort sort} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.sort = function (compareFn) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _sort.call(this, compareFn);
            if (this.suppressOnChange != true) {
                this.onChange('sort', this, prev, v, compareFn);
            }
            return v;
        }
        return _sort.call(this, compareFn);
    };

    /**
     * Removes elements from an array and, if necessary, inserts new elements in their place, returning the deleted elements.
     * @param {Number} start The zero-based location in the array from which to start removing elements.
     * @param {Number} [deleteCount=0] The number of elements to remove. Omitting this argument will remove all elements from the start
     * paramater location to end of the array. If value of this argument is either a negative number, zero, undefined, or a type
     * that cannot be converted to an integer, the function will evaluate the argument as zero and not remove any elements.
     * @param {...any} [items=[]] Optional elements to add to the array. If omitted, will only remove elements from the array.
     * @returns {any[]} An array containing the elements that were deleted, including `[]` if nothing was deleted.
     * @override This overrides {@linkcode Array.prototype.splice splice} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.splice = function (start, deleteCount = 0, ...items) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _splice.call(this, start, deleteCount, ...items);
            if (this.suppressOnChange != true) {
                this.onChange('splice', this, prev, v, start, deleteCount, ...items);
            }
            return v;
        }
        return _splice.call(this, start, deleteCount, ...items);
    };

    /**
     * Inserts new elements at the start of an array, and returns the new length of the array.
     * @param {...any} items Elements to insert at the start of the array.
     * @returns {Number} The new length of the array.
     * @override This overrides {@linkcode Array.prototype.unshift unshift} to allow for 
     * invoking an {@linkcode Array.prototype.onChange onChange} callback on array objects. 
     */
    Array.prototype.unshift = function (...items) {
        if (this.hasOwnProperty('onChange')) {
            let prev = this.clone();
            let v = _unshift.call(this, ...items);
            if (this.suppressOnChange != true) {
                this.onChange('unshift', this, prev, v, ...items);
            }
            return v;
        }
        return _unshift.call(this, ...items);
    };

    /**
     * Checks if the given value is contained anywhere in this array
     * @param {any} value Value to check for 
     * @returns {boolean}
     */
    Array.prototype.contains = function (value) {
        return (this.indexOf(value) >= 0);
    }
    /**
     * Checks if ANY of the given values are contained in this array
     * @param {...any} value Values to check for 
     * @returns {boolean}
     */
    Array.prototype.containsAny = function (...value) {
        if (FLATTEN_CONTAINS) { value = /** @type {any[]} */ (value.flat()); }
        for (let i = 0; i < value.length; i++) {
            if (this.contains(value[i])) { return true; }
        }
        return false;
    }
    /**
     * Checks if ANY of the given values are contained in this array
     * @param {...any} value Values to check for 
     * @returns {boolean}
     */
    Array.prototype.containsAll = function (...value) {
        if (FLATTEN_CONTAINS) { value = /** @type {any[]} */ (value.flat()); }
        for (let i = 0; i < value.length; i++) {
            if (!this.contains(value[i])) { return false; }
        }
        return true;
    }
    /** Call `flat()` on arrays processed in {@linkcode Array.prototype.containsAny containsAny} and {@linkcode Array.prototype.containsAll containsAll}? @returns {boolean} */
    const FLATTEN_CONTAINS = true;

    /**
     * Removes all `null` and `undefined` values from this array, 
     * via calling {@linkcode Array.splice}.
     * @returns {number}
     * @type {() => number}
     * */
    Array.prototype.removeNullValues = function () {
        let removedCount = 0;
        for (let i = this.length - 1; i >= 0; i--) {
            if (this[i] == null) { this.splice(i, 1); removedCount++; }
        }
        return removedCount;
    }


    /**
     * Returns a clone of this array, either using `Array.from()` or (if {@link Array.structuredClone deep cloning}) 
     * `structuredClone` (or `JSON.stringify`/`JSON.parse` if array values aren't serializable).
     * @param {boolean} [deepClone=false] Use `structuredClone` copy? If false, uses `Array.from()`. Deep cloning creates new value instances for property editing. Default `false`
     * @returns {any[]} The newly cloned version of the given array 
     */
    Array.prototype.clone = function (deepClone = false) {
        return deepClone ? this.structuredClone() : Array.from(this);
    }
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
     * @returns {any[]} The newly cloned version of the given array 
     */
    Array.prototype.structuredClone = function () {
        try {
            // attempt structuredClone
            return structuredClone(this);
        } catch {
            // fallback in case of non-serializable values error 
            return JSON.parse(JSON.stringify(this));
        }
    }
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
     * @returns {any[]} The newly cloned version of the given array 
     * @borrows structuredClone as deepClone
     */
    Array.prototype.deepClone = function () {
        return this.structuredClone();
    }

    // #endregion Array 

    // #region Number 

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
    Number.prototype.toMax = function (maxDecimals = 3, ensurOneDecimal = false) {
        if (maxDecimals == -1) { return this.valueOf().toString(); }
        if (typeof maxDecimals === 'boolean') {
            ensurOneDecimal = maxDecimals;
            maxDecimals = 3;
        }
        maxDecimals = maxDecimals.clamp(0, 20);
        let str = this.valueOf().toFixed(maxDecimals);
        str = String(Number(str));
        if (ensurOneDecimal && str.indexOf('.') == -1) { str += '.0'; }
        return str;
    };

    /** 
     * Clamps a number between the given minimum and maximum values, 
     * and returns the clamped value. 
     * 
     * By default, clamps between 0 and 1.
     * @param {number} [min = 0] Minimum possible value
     * @param {number} [max = 1] Maximum possible value
     * @returns {number} */
    Number.prototype.clamp = function (min = 0, max = 1) {
        // ensure min/max values are valid 
        if (min > max) { let m = min; min = max; max = m; }
        else if (min == max) { return min; }
        return Math.min(Math.max(this.valueOf(), min), max);
    };

    /**
     * Checks if this number is between the given minimum and maximum values.
     * @param {number} min Minimum bound value 
     * @param {number} max Maximum bound value 
     * @param {boolean} [inclusive=true] Does exactly matching a bound count as being between? Default `true` 
     * @returns {boolean} */
    Number.prototype.isBetween = function (min, max, inclusive = true) {
        return inclusive ?
            this.valueOf() >= min && this.valueOf() <= max :
            this.valueOf() > min && this.valueOf() < max;
    };

    /**
     * Checks if this number is even, returning `true`, or odd, returning `false`
     * @see {@link Number.isOdd isOdd}
     * @returns {boolean} */
    Number.prototype.isEven = function () {
        if (!Number.isFinite(this.valueOf())) {
            throw new Error(`ERROR: value ${this.valueOf()} is not finite, cannot determine if even/odd`);
        }
        return this.valueOf() % 2 == 0;
    };
    /**
     * Checks if this number is odd, returning `true`, or even, returning `false`
     * @see {@link Number.isEven isEven}
     * @returns {boolean} */
    Number.prototype.isOdd = function () { return !this.valueOf().isEven; };

    // #endregion Number

    // #region String 

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
    String.prototype.count = function (countString, allowOverlap = false) {
        if (isBlank(countString)) { return 0; }
        // a string cannot contain another string longer than itself
        if (countString.length > this.length) { return 0; }
        if (countString.length == this.length) { return this == countString ? 1 : 0; }
        let count = 0;
        switch (countString.length) {
            case 0:
                // theoretically this should already be caught, but, failsafe 
                return 0;
            case 1:
                // one character, simply iterate through the whole string 
                for (let i = 0; i < this.length; i++) {
                    if (this.charAt(i) == countString) { count++; }
                }
                return count;
            default:
                // more than one character 
                // optimization, don't substring unless first char matches 
                let firstChar = countString.charAt(0);
                // optimization, only search to this length minus one less target length 
                for (let i = 0; i < this.length - (countString.length - 1); i++) {
                    if (this.charAt(i) == firstChar) {
                        let sub = this.substring(i, i + countString.length);
                        if (sub == countString) { count++; }
                        // if overlapping values aren't allowed, skip ahead 
                        if (!allowOverlap) {
                            i += countString.length - 1;
                        }
                    }
                }
                return count;
        }
    };

    /**
     * Removes the first instance of the given string or expression. 
     * Returns the modified string. 
     * 
     * Convenience, shorthand for `string.replaceAll(removeValue,'')`
     * @param {string | RegExp} removeValue Value to remove
     * @returns {string} 
     */
    String.prototype.remove = function (removeValue) {
        return this.replace(removeValue, '');
    }
    /**
     * Removes all instances of the given string or expression. 
     * Returns the modified string. 
     * 
     * Convenience, shorthand for `string.replaceAll(removeValue,'')`
     * @param {string | RegExp} removeValue Value to remove
     * @returns {string} 
     */
    String.prototype.removeAll = function (removeValue) {
        return this.replaceAll(removeValue, '');
    }

    /**
     * 
     * @param {boolean} [allowNegative=true] 
     * @param {boolean} [allowDecimal=true] 
     * @returns {number}
     */
    // String.prototype.getNumber = function (allowNegative = true, allowDecimal = true) {
    //     throw new Error(`Not Yet Implemented, String.prototype.getNumber`);
    //     if (this == null || isBlank(this.toString())) { return null; }
    //     return null;
    // };

    /**
     * 
     * @param {boolean} [allowNegative=true] 
     * @param {boolean} [allowDecimal=true] 
     * @returns {number[]}
     */
    // String.prototype.getNumbers = function (allowNegative = true, allowDecimal = true) {
    //     throw new Error(`Not Yet Implemented, String.prototype.getNumbers`);
    //     return [];
    // }

    // getNumber(allowNegative?: boolean, allowDecimal?: boolean): number;
    // getNumbers(allowNegative?: boolean, allowDecimal?: boolean): number[];

    // #endregion String 

})();