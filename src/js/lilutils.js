// some little utilities :3

// #region Strings

/** 
 * Check if a string is `null`, empty, or whitespace. 
 * 
 * Returns `false` if value is a string with any non-whitespace 
 * content in it. Returns `true` if the value is `null`, empty, 
 * blank, or if it is not a string. 
 * @param {string} str input string to test 
 * @param {boolean} [errorOnNonString=false] 
 * Throw error on a non-string? If false, just return `true`.
 * @returns {boolean} true if blank, false if contains content */
export function isBlank(str, errorOnNonString = true) {
    if (str == null) { return true; }// null/undefined counts as blank
    if (typeof str !== 'string') {
        if (errorOnNonString) {
            throw new Error(`ERROR: can\'t check non-string if blank, returning true. Fix (or set errorOnNonString to false). Type:${typeof str}, value:${str}`);
        }
        return true;
    }
    return !str || !str.trim();
};
/** quick test if the given value is a string @param {string} str string to test @returns {boolean} */
export const isString = str => typeof str == 'string';
/** check if a value IS a string AND IS NOT blank/whitespace/null
 * @param {string} str input string to test 
 * @returns {boolean} true if non-blank string, false is blank or not string */
export const isStringNotBlank = str => isString(str) && !isBlank(str);
/** Returns true only if value IS a string, AND that string IS blank (or whitespace).
 * @param {string} str 
 * @returns {boolean}
 * @see {@link isBlank} */
export const isStringAndBlank = str => isString(str) && isBlank(str);

/** 
 * Checks {@linkcode isStringNotBlank} on the given string. 
 * If it IS a string AND it's not blank, returns that string. If it's blank, or
 * whitespace, or `null`, or not a string, returns `''`.
 * @param {string} str String to check 
 * @param {string} [prefix=undefined] Optional prefix to add, IF the string isn't blank
 * @param {string} [suffix=undefined] Optional suffix to add, IF the string isn't blank
 * @returns {string}
 */
export function ReturnStringNotBlank(str, prefix = undefined, suffix = undefined) {
    if (isStringNotBlank(str)) {
        return `${isStringNotBlank(prefix) ? prefix : ''}${str}${isStringNotBlank(suffix) ? suffix : ''}`
    }
    return '';
}

/**
 * Insert a given string `insert` into the `base` string at index `index` 
 * @param {string} base String to modify 
 * @param {string} insert String to insert into `base`
 * @param {number} [index = -1] index to insert `insert` into `base` at. If -1, automatically places at end. 
 * @returns {string}
 */
export function InsertString(base, insert, index = -1) {
    if (!isString(base)) { return base; } // null/invalid base, return base 
    if (!isString(insert)) { return base; } // null/invalid insert, return base 
    if (!Number.isFinite(index)) { return base; } // invalid number, return base 
    if (index == -1) { index = base.length; } // -1, match to base length
    if (index < 0 || index > base.length) {
        console.warn("WARNING: index must be a positive value within the size of base (or -1), can't insert string, returning base", base, insert, index);
        return base;
    }
    // create regex for index param, insert, and return 
    const regex = new RegExp(`(^.{${index}})`);
    return base.replace(regex, `$1${insert}`);
}

/**
 * Is the string name-safe? Specifically, it must only contain alphanumeric
 * characters or `_` underscores. No other special characters nor whitespace.
 * 
 * If {@linkcode varConvention} is `true` (default), the string may also 
 * include `$` dollar signs, and must NOT begin with a number.
 * 
 * Returns `true` if those conditions are met, `false` otherwise. Also returns
 * `false` if the string is `null` or blank.
 * @param {string} str Input string to check 
 * @param {boolean} [varConvention = true] 
 * Should variable naming convention be used? Default `true`. Has two effects, 
 * - The start of the string CANNOT be a number, 
 * - The character `$` is valid
 * @param {boolean} [allowSingleUnderscore=true] Should `_` be allowed? Default `true`
 * @param  {spreadString} excludeChars Any additional characters or strings to explicitly exclude
 * @returns {boolean}
 */
export function IsStringNameSafe(str, varConvention = true, allowSingleUnderscore = true, ...excludeChars) {
    if (isBlank(str)) { return false; }
    if (str.indexOf(' ') >= 0) { return false; }
    if (!allowSingleUnderscore && str === '_') { return false; }
    if (excludeChars != null && excludeChars.length > 0) {
        excludeChars = excludeChars.flattenSpread();
        for (let i = 0; i < excludeChars.length; i++) {
            if (excludeChars[i] == null) { continue; }
            if (str.indexOf(excludeChars[i]) >= 0) {
                return false;
            }
        }
    }
    return /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(str);
}

/**
 * Converts a {@linkcode cssPreserveAspectRatio} or a corresponding 
 * boolean/number value to a CSS-valid string.
 * - **Note:** If using a boolean or number, `false` / `0` 
 * returns `"none"`, and `true` / `1` returns the default 
 * value, '"xMidYMid meet'. 
 * @param {cssPreserveAspectRatio|boolean|0|1} preserveAspectRatio 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio
 * @returns {cssPreserveAspectRatio}
 */
export function GetPreserveAspectRatio(preserveAspectRatio) {
    if (preserveAspectRatio == null) { return null; }
    switch (typeof preserveAspectRatio) {
        case 'boolean':
            return preserveAspectRatio ? 'xMidYMid meet' : 'none';
        case 'number':
            return preserveAspectRatio == 1 ? 'xMidYMax meet' : 'none';
    }
    return preserveAspectRatio;
}

// #endregion Strings

// #region String Num

/**
 * Removes {@link StringNumericOnly non-numeric} chars from a string and returns the resulting number. 
 * Returns {@linkcode returnOnInvalid} (default `NaN`) if no number is found, or if parsing fails. 
 * @param {string|number} str Input string to convert. If given a number, simply returns it.
 * @param {boolean} [parseToInt = false] If true, returns `int`. If false, returns `Number`. Default `false`. 
 * @param {number} [returnOnInvalid=NaN] Returns this value if no number is found, or if parsing fails. Default `NaN`
 * @returns {number|NaN} The parsed number, or `NaN` if no digits are found.
 * @see {@linkcode EnsureToNumber} if you need to parse a non-string, non-numeric value
 */
export function StringToNumber(str, parseToInt = false, returnOnInvalid = NaN) {
    if (typeof str === 'number') { return str; }
    if (!isStringNotBlank(str)) { return returnOnInvalid; }
    let strLow = str.toLowerCase().trim();
    if (strLow == 'infinity') { return Infinity; }
    else if (strLow == '-infinity') { return -Infinity; }
    else if (strLow == 'nan') { return NaN; }
    if (!StringContainsNumeric(str)) { return returnOnInvalid; }
    str = StringNumericOnly(str);// strip away all non-numeric chars 
    return parseToInt ? parseInt(str) : Number(str);
}

/**
 * Ensures a numeric string does not exceed the given number of decimal places.
 * 
 * **NOTE:** does NOT round the string. If you want it rounded, use {@link StringToNumber} and {@link Number.toMax toMax}.
 * @param {string} str 
 * @param {number} [maxDecimals=3] 
 * @param {boolean} [preProcessStringToNumeric=true] 
 * @returns {string|null}
 */
export function StringNumericToMax(str, maxDecimals = 3, preProcessStringToNumeric = true) {
    if (!isString(str)) { return null; }
    else if (isBlank(str)) { return ''; }
    if (preProcessStringToNumeric) { str = StringNumericOnly(str); }
    if (maxDecimals < 0) { return str; }
    let i = str.indexOf('.');
    if (i < 0) { return str; }
    if (maxDecimals == 0) { return str.substring(0, i); }
    if (str.length < i + maxDecimals + 1) { return str; }
    return str.substring(i + maxDecimals + 1);
    // if (str.length > )
}

/** Strips away all non-alphanumeric characters from a string
 * @param {string} str string to process @returns {string} 
 * @example StringAlphanumericOnly('abc123!@#'); // returns 'abc123' */
export const StringAlphanumericOnly = str => (isBlank(str) ? str : str.replace(/[^a-zA-Z0-9]/g, ''));
/** Strips away all non-numerical characters from a string
 * @param {string|number} str string to process (if given a number, returns as a string)
 * @param {boolean} [keepNumericSymbols=true] If true, keeps one `-` at the start of the number, and one `.` within the number
 * @returns {string} 
 * @example StringNumericOnly('abc-12.34!@#'); // returns '-12.34' */
export function StringNumericOnly(str, keepNumericSymbols = true) {
    if (typeof str === 'number') { return str.toString(); }
    if (isBlank(str)) { return str; }
    if (keepNumericSymbols) {
        // remove everything before the first digit, minus sign, or decimal point 
        str = str.replace(/^[^\d.-]*/, '');
        // remove all minus signs that are not the first string value
        str = str.replace(/(?!^)-/g, '');
        // preserve initial minus sign
        const isNegative = str.startsWith('-');
        if (isNegative) { str = str.slice(1); }
        // keep only digits and decimal point 
        str = str.replace(/[^0-9.]/g, '');
        // remove any decimal that isn't followed by any zeros 
        str = str.replace(/\.(?!.*\d)/g, '');
        // keep only the first decimal, if one is found - remove the rest
        const decimalIndex = str.indexOf('.');
        if (decimalIndex >= 0) {
            str = str.slice(0, decimalIndex + 1) + str.slice(decimalIndex + 1).replace(/\./g, '');
        }
        // re-apply the initial minus sign, if needed
        if (isNegative) { str = `-${str}`; }
    } else {
        // simply remove all non-numeric character 
        str = str.replace(/^\D/g, '');
    }
    return str;
};
/** Strips away all non-alphabetical characters from a string
 * @param {string|number} str string to process @returns {string} 
 * @example StringAlphaOnly('abc123!@#'); // returns 'abc' */
export const StringAlphaOnly = str => (typeof str === 'number' ? '' : isBlank(str) ? str : str.replace(/[^a-zA-Z]/g, ''));

/** Strips away all alphanumeric characters from a string
 * @param {string} str string to process @returns {string} 
 * @example StringRemoveAlphanumeric('abc123!@#'); // returns '!@#' */
export const StringRemoveAlphanumeric = str => (isBlank(str) ? str : str.replace(/[a-zA-Z0-9]/g, ''));
/** Strips away all numerical characters from a string
 * @param {string} str string to process @returns {string} 
 * @example StringRemoveNumeric('abc123!@#'); // returns 'abc!@#' */
export const StringRemoveNumeric = str => (isBlank(str) ? str : str.replace(/[0-9]/g, ''));
/** Strips away all alphabetical characters from a string
 * @param {string} str string to process @returns {string} 
 * @example StringRemoveAlpha('abc123!@#'); // returns '123!@#' */
export const StringRemoveAlpha = str => (isBlank(str) ? str : str.replace(/[a-zA-Z]/g, ''));

/** Checks if string contains ANY alphanumeric characters 
 * @param {string} str string to check @returns {boolean} */
export const StringContainsAlphanumeric = str => (isStringNotBlank(str) && /[a-zA-Z0-9]/.test(str));
/** Checks if string contains ANY numerical characters 
 * - **Note:** while it makes sense to make optional the 
 * inclusion of negative/decimal symbols if checking if 
 * the string is ONLY numeric, it's moot while checking if
 * a string contains ANY numeric. It's `true` regardless.
 * @param {string} str string to check @returns {boolean} */
export const StringContainsNumeric = str => (isStringNotBlank(str) && /[0-9]/.test(str));
/** Checks if string contains ANY alphabetical characters 
 * @param {string} str string to check @returns {boolean} */
export const StringContainsAlpha = str => (isStringNotBlank(str) && /[a-zA-Z]/.test(str));

/** Checks if string contains ONLY alphanumeric characters 
 * @param {string} str string to check @returns {boolean} */
export const StringOnlyAlphanumeric = str => (isStringNotBlank(str) && /^[a-zA-Z0-9]+$/.test(str));
/** Checks if string contains ONLY numerical characters 
 * @param {string} str string to check 
 * @param {boolean} [allowDecimalPoint=true] should a decimal point be considered? Default `true` 
 * @param {boolean} [allowNegativeSign=true] should a negative be considered? Default `true` 
 * @returns {boolean} */
export function StringOnlyNumeric(str, allowNegativeSign = true, allowDecimalPoint = true) {
    if (!isStringNotBlank(str)) { return false; }
    if (allowNegativeSign) {
        if (allowDecimalPoint) {
            // allow negative, allow decimal 
            return /^-?[0-9]\d*(\.\d+)?$/.test(str);
        } else {
            // allow negative, refuse decimal 
            return /^-?[0-9]\d*$/.test(str);
        }
    } else {
        if (allowDecimalPoint) {
            // refuse negative, allow decimal 
            return /^[0-9]\d*(\.\d+)?$/.test(str);
        } else {
            // refuse negative, refuse decimal 
            return /^[0-9]\d*$/.test(str);
        }
    }
}
/** Checks if string contains ONLY alphabetical characters 
 * @param {string} str string to check @returns {boolean} */
export const StringOnlyAlpha = str => (isStringNotBlank(str) && /^[a-zA-Z]+$/.test(str));

/** 
 * Checks if the given string has any numbers in it, and if so, 
 * returns the index of the first number found. Otherwise, returns -1 
 * @param {string} str string to check 
 * @param {boolean} [allowNegativeSign=true] 
 * Should a negative sign be consdered the start of a number? Default `true`
 * @param {boolean} [allowDecimalStart=true] 
 * Can a decimal count as the start of the number? Eg, `.5` as opposed to `0.5`) 
 * - **Note:** If this is `false` but {@linkcode allowNegativeSign} is `true`, 
 * a string of `"-.5"` will return `2` as the first index, as the `.` is not 
 * preceeded by a number.
 * @returns {number} */
export function StringIndexOfFirstNumber(str, allowNegativeSign = true, allowDecimalStart = true) {
    if (!isStringNotBlank(str)) { return -1 };
    if (allowNegativeSign) {
        if (allowDecimalStart) {
            return str.search(/-?\d?[.]?\d+/);
        } else {
            return str.search(/-?\d+/);
        }
    } else {
        if (allowDecimalStart) {
            return str.search(/\d?[.]?\d+/);
        } else {
            return str.search(/\d+/);
        }
    }
};

/** Splits a string into an array of alternating numeric and
 * non-numeric parts. Numeric parts are converted to numbers.
 * Pure numbers are returned in a single-value array. 
 * If `null` or neither a number nor string, returns `null`.
 * @param {string} str
 * @returns {(string|number)[]|null} Array of string and number segments
 * @example 
 * StringNumericDivider('abc123def!@#456?'); // ['abc',123,'def!@#',456,'?'] 
 * StringNumericDivider('no numbers');       // ['no numbers'] 
 * StringNumericDivider('123');              // [123] 
 * StringNumericDivider(456);                // [456] 
 */
export const StringNumericDivider = str => {
    if (str == null) { return null; } // null, return
    if (typeof str == 'number') { return [str]; } // number, return in array 
    if (!isString(str)) return null; // neither string nor number 
    if (isBlank(str)) { return [str]; } // blank/whitespace string, return in array  
    // find all numeric/non-numeric sequences, and split
    const strReg = str.match(/\d+(?:\.\d+)?|\D+/g);
    if (!strReg) return []; // if none found, return
    // map to array and convert numeric-only values to number 
    return strReg.map(s => /^\d+(?:\.\d+)?$/.test(s) ? Number(s) : s);
};
// #endregion Str Num

// #region Str Color 

/**
 * Adds an alpha value to a hex code via 0-1 numeric value
 * @param {color} color Hex code formatted color, eg `#FF00FF` 
 * @param {number} opacity Number from 0 to 1 to represent alpha value 
 * @returns Hex code with hex-formatted alpha added
*/
export function AddAlphaToHex(color, opacity) {
    // credit: https://stackoverflow.com/questions/19799777/how-to-add-transparency-information-to-a-hex-color-code/68398236#68398236
    let _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

/**
 * Checks if the string is a valid color. Can either check purely for
 * hex codes (`#FF0000`), or any CSS-safe color string (default).
 * @param {color} color Color string to check 
 * @param {boolean} [hexOnly=false] Are only hex colors consdered? 
 * Eg, `#FF0000`. If `false`, any CSS-safe color string can be used, 
 * such as `red` or `rgb(255,0,0)`. Faster but limited. Default `false`
 * @returns {boolean}
 */
export function IsStringColor(color, hexOnly = false) {
    if (isBlank(color)) { return false; }
    if (hexOnly) { return /^#([0-9A-F]{3}|[0-9A-F]{6})$/i.test(color); }
    return EnsureColorValid(color) != null;
}

/** Enum for specifying how to handle alpha values when formatting RGBA */
const RGBAlpha = Object.freeze({
    /** Alpha should be *excluded*, returning `rgb(r, g, b)` */
    Exclude: -1,
    /** Alpha should be *ignored*, making no changes to the `rgb/a( ... )` value */
    Ignore: 0,
    /** Alpha should be *included*, returning `rgba(r, g, b, a)` */
    Include: 1,
});

/**
 * Confirms a string IS a valid color, and returns the valid result. 
 * Inclusive of all standard CSS color types: hex, RGB/A, HSL/A, 
 * HWB, name string (eg, `"LavenderBlush"`)
 * 
 * If the color is not a valid color (either the input is `null` / 
 * blank, or the input is not a color), returns `null`.
 * - **Note:** The specific format returned by this method is not 
 *   consistent. It *will* be a valid CSS color, but the format may 
 *   vary depending input string, browser, or otherwise.
 *   - For a consistent return type, use {@linkcode ColorToHex}, 
 *     {@linkcode ColorToRGBA}, or {@linkcode ColorToArray}.
 *   - To determine if a string is a valid color and not return a 
 *     potentially modified version, use {@linkcode IsStringColor}.
 * @param {color} color Color string to check  
 * @returns {color}
 */
export function EnsureColorValid(color) {
    if (isBlank(color)) { return null; }
    let span = DummySpan();
    span.style.color = color;
    return isBlank(span.style.color) ? null : span.style.color;
}

/**
 * Takes any CSS-safe color string (hex, RGB/A, HSL/A, HWB, or name 
 * strings like `"LavenderBlush"`) and returns it as an RGB/A formatted
 * string. 
 * @param {color} color Color string to convert to RGBA  
 * @param {-1|0|1|'exclude'|'ignore'|'include'|`set${number}`} [alpha] 
 * Optional value determining what to do with the alpha value. 
 * Default {@linkcode RGBAlpha.Include}.  
 * - `-1`, `"exclude"`, and {@linkcode RGBAlpha.Exclude} will omit any 
 * alpha values and return `"rgb(r, g, b)"` 
 * - `1`, `"includue"`, and {@linkcode RGBAlpha.Include} will ensure  
 * an alpha value is included, returning `"rgba(r, g, b, a)"`. If one 
 * isn't present, adds alpha value of `1.0`
 * - `0`, `"ignore"`, and {@linkcode RGBAlpha.Ignore} will return the 
 * value however the CSS computed style formats it. This is typically 
 * `rgba` but can vary. If it matters, you should specify to be sure.
 * - `"set0"` through `"set100"` will directly assign the given alpha 
 * value. Must be between `0` and `100`, will get normalized to 
 * between `0` and `1`, rounded to max three decimals.  
 * Eg, `"set50"` returns `"rgba(r, g, b, 0.5)"`
 * @returns {color} 
 */
export function ColorToRGBA(color, alpha = RGBAlpha.Include) {
    if (isBlank(color)) { return null; }
    // create a dummy, determine basic string validity 
    let span = DummySpan();
    span.style.color = color;
    if (isBlank(span.style.color)) { return null; }
    // use getComputedStyle to convert to rgb/a 
    document.body.appendChild(span);
    // let style = getComputedStyle(span);
    let newColor = getComputedStyle(span).color?.trim().toLowerCase();
    // let color = style.color.trim().toLowerCase();
    // let color = style.color;
    document.body.removeChild(span);
    if (isBlank(newColor)) { return null; }
    // check alpha inclusion 
    if (alpha == null) { return newColor; }
    let alphaValue = null;
    /** @param {string} numStr @returns {number} */
    const getAlphaNumber = (numStr) => {
        return EnsureToNumber(numStr.substring(numStr.search(/-?.?\d/))).clamp(0, 100) * 0.01;
    }
    if (typeof alpha === 'string' && alpha.startsWith('set')) {
        alphaValue = getAlphaNumber(alpha);
        alpha = 'set0';
    }
    switch (alpha) {
        case 0:
        case 'ignore':
            return newColor;
        case -1:
        case 'exclude':
            // ensure we remove alpha if rgba  
            if (newColor.startsWith('rgba')) {
                newColor = newColor.replace('a', '');
            }
            // remove alpha value 
            switch (newColor.count(',')) {
                case 2:
                    // already 2 values, only rbg 
                    break;
                case 3:
                    // remove alpha value 
                    let commaIndex = newColor.lastIndexOf(',');
                    let parenIndex = newColor.lastIndexOf(')');
                    if (commaIndex == -1 || parenIndex == -1) {
                        console.error(`ERROR: improperly formatted getComputedStyle color output "${newColor}", returning null, investigate`, this);
                        return null;
                    }
                    let before = newColor.substring(0, commaIndex);
                    let after = newColor.substring(parenIndex);
                    newColor = before + after;
                    break;
                default:
                    console.warn(`WARNING: irregular number (${newColor.count(',')}) of comma-delimited values in rgb/a: "${newColor}", returning null, investigate`, this);
                    return null;
            }
            return newColor;
        case 1:
        case 'include':
            // ensure we insert alpha if rgb 
            if (newColor.startsWith('rgb(')) {
                newColor = 'rgba' + newColor.substring(3);
            }
            switch (newColor.count(',')) {
                case 2:
                    // add alpha value 
                    let parenIndex = newColor.lastIndexOf(')');
                    newColor = `${newColor.substring(0, parenIndex)}, 1.0)`;
                    break;
                case 3:
                    // it's already 3 values, rgba 
                    break;
                default:
                    console.warn(`WARNING: irregular number (${newColor.count(',')}) of comma-delimited values in rgb/a: "${newColor}", returning null, investigate`, this);
                    return null;
            }
            return newColor;
        default:
            // either error, or misformatted set number 
            if (!alpha.startsWith('set')) {
                console.error(`ERROR: Invalid alpha value ${alpha}, can't determine alpha inclusion, ignoring, returning color "${newColor}"`, this);
                return newColor;
            }
            console.warn(`WARNING: alpha set value: ${alpha} for color: "${newColor}" shouldn't happen, should be set0, alphaValue: ${alphaValue}, investigate`, this);
            if (alphaValue == null) {
                // ensure non-null alpha value if we somehow skipped it before 
                alphaValue = getAlphaNumber(alpha);
            }
        case 'set0':
            // set at a specific color
            if (newColor.startsWith('rgb(')) {
                newColor = 'rgba' + newColor.substring(3);
            }
            switch (newColor.count(',')) {
                case 2:
                    // no alpha present, just add it 
                    if (newColor.count(',') == 2) {
                        let parenIndex = newColor.lastIndexOf(')');
                        newColor = `${newColor.substring(0, parenIndex)}, ${alphaValue.toMax(true)})`;
                    }
                    return newColor;
                case 3:
                    // alpha present, replace with given value 
                    let commaIndex = newColor.lastIndexOf(',');
                    newColor = `${newColor.substring(0, commaIndex)}, ${alphaValue.toMax(true)})`;
                    return newColor;
                default:
                    console.warn(`WARNING: irregular number (${newColor.count(',')}) of comma-delimited values in rgb/a: "${newColor}", alphaValue: ${alphaValue}, returning null, investigate`, this);
                    return null;
            }
    }
}

/**
 * Converts the given string to a three-or-four-value numer array 
 * corresponding to the color's RGB/A values. 
 * 
 * If the given string is not a color, or if the conversion 
 * otherwise fails, returns `null`. 
 * @param {color} color Color string to convert 
 * @param {-1|0|1|'exclude'|'ignore'|'include'|`set${number}`} [alpha] 
 * Optional value determining what to do with the alpha value. 
 * Default {@linkcode RGBAlpha.Include}.  
 * - `-1`, `"exclude"`, and {@linkcode RGBAlpha.Exclude} will omit any 
 * alpha values and return `[r, g, b]` 
 * - `1`, `"includue"`, and {@linkcode RGBAlpha.Include} will ensure  
 * an alpha value is included, returning `[r, g, b, a]`. If one 
 * isn't present, adds alpha value of `1.0`
 * - `0`, `"ignore"`, and {@linkcode RGBAlpha.Ignore} will return the 
 * value however the CSS computed style formats it. This is typically 
 * `rgba` but can vary. If it matters, you should specify to be sure.
 * - `"set0"` through `"set100"` will directly assign the given alpha 
 * value. Must be between `0` and `100`, will get normalized to 
 * between `0` and `1`, rounded to max three decimals.  
 * Eg, `"set50"` returns `[r, g, b, 0.5]`
 * @returns {[number, number, number, number?]|null}
 */
export function ColorToArray(color, alpha = RGBAlpha.Include) {
    throw new Error(`Not Yet Implemented, ColorToArray, can't convert str: ${color}`);
    color = EnsureColorValid(color);
    if (color == null) { return null; }
    // create dummy CSS style 
    let _span = DummySpan();
}

/**
 * @param {color} color Color string to convert 
 * @param {-1|0|1|'exclude'|'ignore'|'include'|`set${number}`} [alpha] 
 * Optional value determining what to do with the alpha value. 
 * Default {@linkcode RGBAlpha.Ignore}.  
 * - `-1`, `"exclude"`, and {@linkcode RGBAlpha.Exclude} will omit any 
 * alpha values and return `"#f0f0f0"` 
 * - `1`, `"includue"`, and {@linkcode RGBAlpha.Include} will ensure  
 * an alpha value is included, returning `"#f0f0f0ff"`. If one 
 * isn't present, adds alpha value of `"ff"`
 * - `0`, `"ignore"`, and {@linkcode RGBAlpha.Ignore} will return the 
 * value however the CSS computed style formats it. This is typically 
 * `rgba` but can vary. If it matters, you should specify to be sure. 
 * - `"set0"` through `"set100"` will directly assign the given alpha 
 * value. Must be between `0` and `100`, will get normalized to 
 * between `0` and `1`, rounded to max three decimals.  
 * Eg, `"set50"` returns `"#f0f0f080"`, as the hex value `"80"` 
 * equates to 127.5 (rounded to 128), or 50% of 255.
 * @param {string} [prefixHash='#'] Optional prefix. Default `#`
 * @returns {color}
 */
export function ColorToHex(color, alpha = RGBAlpha.Ignore, prefixHash = '#') {
    throw new Error(`Not Yet Implemented, ColorToHex, can't convert str: ${color}`);
}

// #endregion Str Color

// #region Numbers

/**
 * Takes a value, and ensures that it's a number. If `value` isn't a number
 * and can't be parsed, returns {@linkcode returnOnInvalid} (default `NaN`) 
 * and optionally outputs an error.
 * @param {number|any} value Input value to convert to a Number 
 * @param {boolean} [errorOnFailure=true] output an error upon parsing failure? Default `true`
 * @param {number} [returnOnInvalid=NaN] Value to return on parsing error. Default `NaN`
 * @param {boolean} [ensureFinite=true] Ensure non-infinite + non-NaN return value? Default `true`
 * - **Note:** Even if `ensureFinite` is `true`, an invalid operation will still return
 * {@linkcode returnOnInvalid}, even if it's `NaN`. If it's mandatory to ensure a given
 * fallback number, set {@linkcode returnOnInvalid} to `0` or the desired default value.
 * @returns {number}
 */
export function EnsureToNumber(value, errorOnFailure = true, returnOnInvalid = NaN, ensureFinite = true) {
    function failure(/** @type {string} */ reason) {
        if (errorOnFailure) {
            console.error(`ERROR: failed to parse value: ${value} (type: ${typeof value}) to Number, ${reason}`, value);
        }
        return returnOnInvalid;
    }
    function checkReturnFinite(value, ensureFinite) {
        if (!ensureFinite) { return value; }
        if (IsNumberFinite(value)) { return value; }
        return failure('value returned is NaN or infinite');
    }
    if (value == null) { return failure('value is null or undefined'); }
    switch (typeof value) {
        case 'number': return checkReturnFinite(value, ensureFinite);
        case 'string': return checkReturnFinite(StringToNumber(value, false, returnOnInvalid), ensureFinite);
        case 'boolean': return checkReturnFinite(value ? 1 : 0, ensureFinite);
        case 'bigint': return checkReturnFinite(Number(value), ensureFinite);
        default:
            // other type - attempt to coerce to number
            const n = Number(value);
            if (Number.isFinite(n)) { return checkReturnFinite(n, ensureFinite); }
            // failed, before checking if n is Infinity, -Infinity, or NaN, try toString
            const s = value.toString();
            if (isStringNotBlank(s)) {
                const sn = StringToNumber(s, false, returnOnInvalid);
                if (Number.isFinite(sn)) { return checkReturnFinite(sn, ensureFinite); }
                if (IsNumberInfiniteOrNaN(sn)) { return checkReturnFinite(sn, ensureFinite); }
            }
            // infinity/NaN n check
            if (IsNumberInfiniteOrNaN(n)) { return checkReturnFinite(n, ensureFinite); }
            if (n == null || typeof n != 'number') {
                // conversion fully failed
                return failure('failed to convert value, likely too complex for conversion');
            }
            // unspecified error
            return failure('catastrophic error?? like, how???');
    }
}

/**
 * Checks if the given number is explicitly 
 * `Infinity`, `-Infinity`, or `NaN`
 * @param {number} num Number to check  
 * @returns {boolean} */
export function IsNumberInfiniteOrNaN(num) {
    if (num == null || typeof num != 'number') { return false; }
    if (Number.isFinite(num)) { return false; }
    return num === Infinity || num === -Infinity || Number.isNaN(num);
}
/** 
 * Checks if the given number is a valid number
 * that is not `Infinity`, `-Infinity`, or `NaN`.
 * 
 * Convenience to match {@linkcode IsNumberInfiniteOrNaN}
 * styling; simply calls `Number.isFinite`.
 * @param {number} num Number to check
 * @returns {boolean} 
 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isFinite Number.isFinite()} on MDN */
export function IsNumberFinite(num) {
    return Number.isFinite(num);
}

/**
 * Convert a {@linkcode numberOptionalNumber} value to string. 
 * 
 * If the given value is `null`, returns `null`
 * @param {cssNumberOptionalNumber} numberOptionalNumber Number, or 1-or-2-value number[] array
 * @param {boolean} [joinWithComma=false] If two numbers, join with comma? 
 * If `true`, returns `"1, 2"`. If `false`, returns `"1 2"`. Default `false`
 * @returns {string}
 */
export function NumberOptionalNumberToString(numberOptionalNumber, joinWithComma = false) {
    return NumberListOfNumbersToString(numberOptionalNumber, joinWithComma, null);
}

/**
 * Convert a {@linkcode cssNumberOptionalNumber} value to string. 
 * Ensures all numbers are rounded to {@link integer} values. 
 * 
 * If the given value is `null`, returns `null`
 * @param {cssIntegerOptionalInteger} integerOptionalInteger {@link integer Integer}, or 1-or-2-value integer[] array
 * @param {boolean} [joinWithComma=false] If two numbers, join with comma? 
 * If `true`, returns `"1, 2"`. If `false`, returns `"1 2"`. Default `false` 
 * @param {RoundOps} [roundingOperation=RoundOps.Round] 
 * How should non-integer values be rounded? Default {@linkcode RoundOps.Round}
 * @returns {string}
 */
export function IntegerOptionalIntegerToString(integerOptionalInteger, joinWithComma = false, roundingOperation = RoundOps.Round) {
    if (typeof integerOptionalInteger == 'number') {
        integerOptionalInteger = [integerOptionalInteger];
    }
    switch (integerOptionalInteger.length) {
        case 2:
            integerOptionalInteger[1] = RoundWith(integerOptionalInteger[1], roundingOperation);
        case 1:
            integerOptionalInteger[0] = RoundWith(integerOptionalInteger[0], roundingOperation);
            break;
    }
    return NumberListOfNumbersToString(integerOptionalInteger, joinWithComma);
}

/**
 * Convert a {@linkcode numberListOfNumbers} value to string. 
 * 
 * If the given value is `null`, returns `null`
 * @param {cssNumberListOfNumbers} numberListOfNumbers Number, or number[] array 
 * @param {boolean} [joinWithComma=false] If two numbers, join with comma? 
 * If `true`, returns `"1, 2, 3, ..."`. If `false`, returns `"1 2 3 ..."`. Default `false`
 * @param {number|null} [replaceNullValuesWith=null] If any null values are found, 
 * should they be removed (`null`) or replaced with a given value? Default `null` 
 * @returns {string}
 */
export function NumberListOfNumbersToString(numberListOfNumbers, joinWithComma = false, replaceNullValuesWith = null) {
    if (numberListOfNumbers == null) { return null; }
    if (typeof numberListOfNumbers == 'number') {
        return numberListOfNumbers.toString();
    }
    if (replaceNullValuesWith == null) {
        numberListOfNumbers.removeNullValues();
    } else {
        for (let i = 0; i < numberListOfNumbers.length; i++) {
            if (numberListOfNumbers[i] == null) {
                numberListOfNumbers[i] = replaceNullValuesWith;
            }
        }
    }
    return numberListOfNumbers.join(joinWithComma ? ', ' : ' ');
}

/**
 * Converts a number to a percentage string, formatted `"N%"` where `N` is the 
 * given number. The given number can either be a number, a string number, or a
 * string percent. 
 * 
 * If {@linkcode number} is `null` or `NaN`, returns `null`. 
 * 
 * - **Note:** If {@linkcode number} any form of string, the numberic value will be extracted 
 * and processed per the other parameters. Eg, `"50.5%"` will return `"50%"` if 
 * {@linkcode roundingOperation} is {@linkcode RoundOps.Round} or {@linkcode RoundOps.Floor Floor}.
 * @param {number|`${number}`|percentage} number Numeric value to convert. 
 * Can be a number, number as string, or a {@linkcode percentage}.
 * @param {boolean|'only01'} [multiplyBy100 = true] Number-to-percentage 
 * multiplication protocol. If `false`, does not multiply. If `true`, multiplies 
 * the {@linkcode number} param by `100`. If `"only01"`, multiplies {@linkcode number}
 * if it's between `0.0` and `1.0` (inclusive). If `null`, treated as `false`. 
 * Default `true`.
 * - **Note:** `"only01"` is inclusive of `1`. Be sure to set this to `false` 
 * or `null` if your input value is a range of `0` to `100`.
 * @param {number} [minValue = null] Min allowed value. If `null`, no min limit. 
 * A value of `0` will prevent negative output values. Default `null`
 * @param {number} [maxValue = null] Max allowed value. If `null`, no max limit. 
 * A value of `100`, along with a {@linkcode minValue} of `0`, will clamp the 
 * percentage to `0` to `100`. Default `null`
 * @param {RoundOps} [roundingOperation=RoundOps.Round] Rounding operation to use. 
 * Rounding occurs last. Default {@linkcode RoundOps.Round}.
 * @returns {percentage}
 */
export function ToPercentage(number, multiplyBy100 = true, minValue = null, maxValue = null, roundingOperation = RoundOps.Round) {
    if (number == null) { return null; }
    if (typeof number == 'string') {
        // convert to number to obey the rest of the parameters 
        if (number.endsWith('%')) {
            number = EnsureToNumber(number.substring(0, number.length - 1));
        } else {
            number = EnsureToNumber(number);
        }
        if (number == null) { return null; }
    }
    if (Number.isNaN(number)) { return null; }
    // check multiplication 
    switch (multiplyBy100) {
        default:
            console.error(`ERROR: invalid ToPercentage multiplyBy100 value ${multiplyBy100}, not doing any multiplication to ${number}`, this);
        case false:
        case null:
            // do nothing 
            break;
        case 'only01':
            if (number <= 0 || number > 1) {
                break;
            }
        case true:
            number *= 100;
            break;
    }
    // check min/max clamping 
    if (minValue != null) {
        if (maxValue != null) { number = number.clamp(minValue, maxValue); }
        else {
            if (number < minValue) { number = minValue; }
        }
    } else if (maxValue != null) {
        if (number > maxValue) { number = maxValue; }
    }
    // check rounding 
    number = RoundWith(number, roundingOperation);
}

/** 
 * Security mode to use when generating a random number. 
 * - {@linkcode RandomSecureMode.Fast Fast}: Uses `Math.random`. 
 * Quickest pseudorandom generation, but non-cryptographically secure. 
 * - {@linkcode RandomSecureMode.TrySecure TrySecure}: Attempts cryptographically 
 * secure pseudorandom number generation (CSPRNG) via the WebCrypto API. 
 * If the API is unavailable, reverts to {@linkcode RandomSecureMode.Fast Fast}. 
 * - {@linkcode RandomSecureMode.ForceSecure ForceSecure}: Attempts cryptographically 
 * secure pseudorandom number generation (CSPRNG) via the WebCrypto API. 
 * If the API is unavailable, throws an error.
 *     - **Note:** While this is cryptographically secure, it's still being run on the user's 
 *     local environment. Any client-side code execution is fundamentally unsafe. 
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API WebCrypto API} MDN documentation
 * @typedef {'Fast'|'TrySecure'|'ForceSecure'} RandomSecureMode
 */
export const RandomSecureMode = Object.freeze({
    /** 
     * Uses `Math.random()` to get a random value from the array. 
     * This is preferred for most user-facing situations, such as 
     * random colour variation or single-player gameplay situations. 
     * 
     * "Would it be fundamentally okay if the user could predict the result?" */
    Fast: 'Fast',
    /** 
     * Safer, more expensive. Tries to use cryptographically-secure random number generation via the 
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API WebCrypto API}.
     * If that API is unavailable, defaults to using {@linkcode RandomSecureMode.Fast Fast}. 
     * Useful when security is important yet non-critical, and functionality is MORE important. */
    TrySecure: 'TrySecure',
    /** 
     * Safer, more expensive. Tries to use cryptographically-secure random number generation via the 
     * {@link https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API WebCrypto API}.
     * Throws an error if the API is unavailable. 
     * 
     * - **Note:** While this is cryptographically secure, it's still being run on the user's 
     * local environment. Any client-side code execution is fundamentally unsafe. */
    ForceSecure: 'ForceSecure'
});

/**
 * Generates and returns a random number between `min` (inclusive) and `max` (exclusive). 
 * 
 * Optionally uses the WebCrypto API for cryptographically secure pseudorandom number generation (CSPRNG). 
 * 
 * To get an integer-rounded random value, see {@linkcode RandomInt}. In the case of arrays, 
 * remember to account for rounding being `max` inclusive by default. 
 * 
 * ---
 * @param {number} [min=0] Minimum possible random value. Must be finite. Default `0`
 * @param {number} [max=1] Minimum possible random value. Must be finite. Default `0`
 * @param {RandomSecureMode} secureMode Security mode to use during generation. Default {@linkcode RandomSecureMode.Fast Fast}
 * @returns {number}
 */
export function RandomValue(min = 0, max = 1, secureMode = RandomSecureMode.Fast) {
    // ensure valid input values 
    if (!IsNumberFinite(min) || !IsNumberFinite(max)) {
        throw new Error(`Cannot generate random number with non-finite values, min: ${min}, max: ${max}, secureMode: ${secureMode}, returning NaN`, this);
    }
    if (min === max) { return min; }
    else if (max < min) [min, max] = [max, min];
    // check security mode 
    if (secureMode != 'Fast') {
        // local ref to webcrypto api 
        const webCryptoAPI = globalThis.crypto;
        if (webCryptoAPI != null && typeof webCryptoAPI?.getRandomValues === "function") {
            // WebCrypto API is available 
            const uInt32array = new Uint32Array(1);
            webCryptoAPI.getRandomValues(uInt32array);
            const unitInterval = uInt32array[0] / 0x100000000; // smallest fractional unit (1/2^32), 0 inclusive, 1 exclusive 
            return (unitInterval * (max - min)) + min; // map unit to min/max range, min inclusive, max exclusive
        } else if (secureMode == 'ForceSecure') {
            // api is unavailable but required, error out 
            throw new Error('This environment does not support web cryptography. Cannot generate secure random number.');
        }
    }
    // fast, simple execution 
    return min + Math.random() * (max - min);
}
/**
 * Generates and returns a random integer between `min` (inclusive) and `max` (inclusive), 
 * using the given {@linkcode RoundOps rounding operation}. 
 * 
 * Optionally uses the WebCrypto API for cryptographically secure pseudorandom number generation (CSPRNG). 
 * 
 * - **NOTE:** If {@linkcode roundingOperation} is {@linkcode RoundOps.None}, simply returns 
 * {@linkcode RandomValue} with the given parameters. In this case, {@linkcode max} is *exclusive*, not *inclusive*.
 * - **NOTE:** If getting a random array index (or other `max` exclusive operation), remember to use 
 * {@linkcode RoundOps.Floor} for your {@linkcode roundingOperation}, or simply use {@linkcode RandomArrayIndex}.
 * 
 * ---
 * @param {number} [min=0] Minimum possible random value. Must be finite. Default `0`
 * @param {number} [max=1] Minimum possible random value. Must be finite. Default `0`
 * @param {RoundOps} [roundingOperation=RoundOps.Round] Rounding operation to use. Default {@linkcode RoundOps.Round Round}.
 * @param {RandomSecureMode} secureMode Security mode to use during generation. Default {@linkcode RandomSecureMode.Fast Fast}
 * @returns {number}
 */
export function RandomInt(min = 0, max = 100, roundingOperation = RoundOps.Round, secureMode = RandomSecureMode.Fast) {
    let randomValue = RandomValue(min, max, secureMode);
    return RoundWith(randomValue, roundingOperation);
}

/**
 * Gets a random index value from the given array.
 * @param {any[]} array Array to get a random index of. Must be non-null, and have a `length` greater than 0.
 * @param {RandomSecureMode} [secureMode=RandomSecureMode.Fast] Security mode to use during generation. Default {@linkcode RandomSecureMode.Fast Fast}
 * @returns {number}
 */
export function RandomArrayIndex(array, secureMode = RandomSecureMode.Fast) {
    if (array == null || array.length === 0) {
        console.warn(`Can't get random index from a null/empty array, array: ${array}, secureMode: ${secureMode}, returning NaN`, this);
        return NaN;
    }
    let index = RandomInt(0, array.length, RoundOps.Floor);
    let failsafe = Math.max(10, array.length + 1);
    while (index >= array.length && failsafe > 0) {
        index = RandomInt(0, array.length, RoundOps.Floor);
        failsafe--;
        if (failsafe == 0) {
            console.warn("WARNING: hit the RandomInt failsafe getting random index, investigate", this);
        }
    }
    return index;
}

// #endregion Numbers

// #region Math


/** All possible rounding operations @typedef {'round'|'ceil'|'floor'|'none'} RoundOps */
export const RoundOps = Object.freeze({
    /** Round to the nearest integer: `0.2 = 0` , `0.49 = 0` , `0.5 = 1` , `0.8 = 1` */
    Round: 'round',
    /** Ceiling, round UP to the next integer: `0.2 = 1` , `0.5 = 1` , `0.8 = 1` */
    Ceil: 'ceil',
    /** Floor, round DOWN to the last integer: `0.2 = 0` , `0.5 = 0` , `0.8 = 0` */
    Floor: 'floor',
    /** Do not round: `0.2 = 0.2` , `0.49 = 0.49` , `0.5 = 0.5` , `0.8 = 0.8` */
    None: 'none'
});

/**
 * Rounds the given number using the specified {@link RoundOps rounding operation}. 
 * Returns the rounded number, or `null` / `NaN` if {@linkcode number} is either of those. 
 * 
 * Default {@linkcode roundingOperation} value is {@linkcode RoundOps.Round}. If it's `null`, 
 * it's treated as {@linkcode RoundOps.Round}.
 * @param {number} number Number to round 
 * @param {RoundOps} [roundingOperation] Rounding opeartion to use. Default {@linkcode RoundOps.Round}, 
 * which is also how `null` values are treated. 
 * @returns {number}
 */
export function Round(number, roundingOperation = RoundOps.Round) { return RoundWith(number, roundingOperation); }
/** Rounds the given number down @param {number} number Number to round down @see {@linkcode RoundOps.Ceil} @returns {number} */
export function Ceil(number) { return RoundWith(number, RoundOps.Ceil); }
/** Rounds the given number up @param {number} number Number to round down @see {@linkcode RoundOps.Floor} @returns {number} */
export function Floor(number) { return RoundWith(number, RoundOps.Floor); }
/**
 * Rounds the given number using the specified {@link RoundOps rounding operation}. 
 * Returns the rounded number, or `null` / `NaN` if the parameter is either of those. 
 * @param {number} number Number to round 
 * @param {RoundOps} roundingOperation Rounding operation to use. If `null`, uses {@linkcode RoundOps.Round} 
 * @returns {number}
 */
export function RoundWith(number, roundingOperation) {
    if (number == null) { return null; }
    else if (Number.isNaN(number)) { return NaN; }
    switch (roundingOperation) {
        case null:
            if (_ROUNDWITH_WARN_ON_NULL) {
                console.warn(`WARNING: null RoundWith roundingOperation, it should be specified, defaulting to RoundOps.Round for number ${number}`, this)
            }
        case RoundOps.Round:
            return Math.round(number);
        case RoundOps.Ceil:
            return Math.ceil(number);
        case RoundOps.Floor:
            return Math.floor(number);
        default:
            console.error(`ERROR: invalid RoundWith roundingOperation ${roundingOperation}, can't round, returning initial number ${number}`, this);
        case RoundOps.None:
            return number;
    }
}
/** Should {@linkcode RoundWith} output a warning if the given {@link RoundOps rounding operation} is `null`? */
const _ROUNDWITH_WARN_ON_NULL = false;

/**
 * Lerps (linearly interpolates) between an origin `a` and 
 * target `b` number by the given time value. 
 * @param {number} a Origin value, if `t == 0`
 * @param {number} b Target value, if `t == 1` 
 * @param {number} t Interpolation amount. 0 returns origin, 
 * 1 returns target, 0.5 returns halfway between the two. 
 * @returns {number}
 */
export function Lerp(a, b, t) { return a + ((b - a) * t); }

/** 
 * Gets the interpolation factor for the given value within the
 * given range. If value is between `min` and `max`, returns a
 * value between `0` and `1`. 
 * 
 * Values below `min` will be `< 0`, above `max` will be `> 1`.
 * 
 * If `min` and `max` are equal, values below `min` will return
 * `-Infinity`, and above `max` will return `Infinity`.
 * @param {Number} value Value to determine normalized range of 
 * @param {Number} min Minimal value, the "start" of the range 
 * @param {Number} max Maximal value, the "end" of the range 
 * @returns {Number}
 */
export function InverseLerp(value, min, max) {
    if (!Number.isFinite(value)) { return NaN; }
    if (!Number.isFinite(min) || !Number.isFinite(max)) {
        if (min == null || max == null || typeof min != 'number' || typeof max != 'number') { return NaN; }
        if (Number.isFinite(min)) { return -Infinity; } return Infinity;
    }
    if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(value)) { return NaN; }
    if (min === max) {
        if (min === value) { return 0; }// could be 0 or 1 
        if (min === 0) { return NaN; }// can't divide by zero
        if (value < min) { return -Infinity; } return Infinity;
    }
    return (value - min) / (max - min);
}

// #endregion Math

// #region Geometry

/** 
 * Convert the given `x` amd `y` coordinates to a `point` object
 * @param {number} x  @param {number} y 
 * @returns {{x:number, y:number}} an object with given `.x` and `.y` coordinate properties */
export function toPoint(x, y) { return { x: x, y: y }; }
/**
 * Checks if the given value `pt` is a {@link toPoint point} object (an object with `.x` and `.y` properties)
 * @param {{x:number, y:number}} pt Point to check
 * @param {boolean} [strict = false] If true, performs a stricter check, ensuring `x` and `y` are non-inherited numbers 
 * @returns {boolean} */
export function isPoint(pt, strict = false) {
    if (pt == null || typeof pt != 'object') return false;
    return strict ?
        pt.hasOwnProperty('x') && pt.hasOwnProperty('y') &&
        typeof pt.x == 'number' && typeof pt.y == 'number' :
        'x' in pt && 'y' in pt;
}
/**
 * Checks (non-strict) if all the given values are {@link toPoint point} objects
 * @param  {...{x:number, y:number}} pts array or values of, hopefully, {@link toPoint point} objects
 * @returns {boolean}
 */
export function arePoints(...pts) {
    if (pts == null || !Array.isArray(pts)) { return false; }
    pts = pts.flattenSpread();
    for (let i = 0; i < pts.length; i++) {
        if (!isPoint(pts[i])) { return false; }
    }
    return true;
}

/**
 * Rotates the given X/Y coordinates around the given X/Y pivot point by the given angle, in degrees (default) or radians 
 * @param {number} pointX X coordinate to be rotated @param {number} pointY Y coordinate to be rotated 
 * @param {number} pivotX X coordinate to rotate around @param {number} pivotY Y coordinate to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointXYAroundPivotXY(pointX, pointY, pivotX, pivotY, angle, inDegrees = true) {
    return RotatePointAroundPivot(toPoint(pointX, pointY), toPoint(pivotX, pivotY), angle, inDegrees);
}
/**
 * Rotates the given XY point around the given pivot point by the given angle, in degrees (default) or radians 
 * @param {number} pointX X coordinate to be rotated @param {number} pointY Y coordinate to be rotated 
 * @param {{x:number, y:number}} pivot XY {@link toPoint point} coordinates to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointXYAroundPivot(pointX, pointY, pivot, angle, inDegrees = true) {
    return RotatePointAroundPivot(toPoint(pointX, pointY), pivot, angle, inDegrees);
}
/**
 * Rotates the given XY point around the given pivot point by the given angle, in degrees (default) or radians 
 * @param {{x:number, y:number}} point XY {@link toPoint point} coordinates to be rotated 
 * @param {number} pivotX X coordinate to rotate around @param {number} pivotY Y coordinate to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointAroundPivotXY(point, pivotX, pivotY, angle, inDegrees = true) {
    return RotatePointAroundPivot(point, toPoint(pivotX, pivotY), angle, inDegrees);
}
/**
 * Rotates the given XY point around the given pivot point by the given angle, in degrees (default) or radians 
 * @param {{x:number, y:number}} point XY {@link toPoint point} coordinates to be rotated 
 * @param {{x:number, y:number}} pivot XY {@link toPoint point} coordinates to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointAroundPivot(point, pivot, angle, inDegrees = true) {
    // translate to origin 
    point.x -= pivot.x;
    point.y -= pivot.y;
    // rotate
    point = RotatePointAroundOrigin(point, angle, inDegrees);
    // translate back 
    point.x += pivot.x;
    point.y += pivot.y;
    return point;
}
/**
 * Rotates the given point around origin [0,0] by the given angle, in degrees (default) or radians 
 * @param {number} pointX X coordinate to be rotated @param {number} pointY Y coordinate to be rotated 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointXYAroundOrigin(pointX, pointY, angle, inDegrees = true) {
    return RotatePointAroundOrigin(toPoint(pointX, pointY), angle);
}
/**
 * Rotates the given point around origin [0,0] by the given angle, in degrees (default) or radians 
 * @param {{x:number, y:number}} point XY {@link toPoint point} coordinates to be rotated 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}} a {@link toPoint point} with given `.x` and `.y` coordinate properties, rotated as specified */
export function RotatePointAroundOrigin(point, angle, inDegrees = true) {
    // if needed, convert degrees to radians 
    if (inDegrees) { angle = AngleDegreesToRadians(angle); }
    // rotate around origin 
    let rx = (point.x * Math.cos(angle)) - (point.y * Math.sin(angle));
    let ry = (point.x * Math.sin(angle)) + (point.y * Math.cos(angle));
    point.x = rx;
    point.y = ry;
    return point;
}

/** Convert radians to degrees @param {number} radians @see {@link AngleDegreesToRadians} @returns {number} */
export function AngleRadiansToDegrees(radians) { return radians * (180 / Math.PI); }
/** Convert degrees to radians @param {number} degrees @see {@link AngleRadiansToDegrees} @returns {number} */
export function AngleDegreesToRadians(degrees) { return degrees * (Math.PI / 180); }

/**
 * Takes an array of XY {@link toPoint points}, determines their shared center, and rotates them all around it 
 * @param {{x:number, y:number}[]} points Array of {@link toPoint points}, to all rotate around their calculated shared center 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}[]} input array, with all points rotated as specified */
export function RotatePointsAroundSharedCenter(points, angle, inDegrees = true) {
    let center = FindPointsSharedCenter(...points);
    return RotatePointsAroundPivot(points, center, angle, inDegrees);
}
/**
 * Takes an array of XY {@link toPoint points} and rotates them all around the given pivot coordinates 
 * @param {{x:number, y:number}[]} points Array of {@link toPoint points}, to be rotated 
 * @param {number} pivotX X coordinate to rotate around @param {number} pivotY Y coordinate to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}[]} input array, with all points rotated as specified */
export function RotatePointsAroundPivotXY(points, pivotX, pivotY, angle, inDegrees = true) {
    return RotatePointsAroundPivot(points, toPoint(pivotX, pivotY), angle, inDegrees);
}
/**
 * Takes an array of XY {@link toPoint points} and rotates them all around the given pivot point 
 * @param {{x:number, y:number}[]} points Array of {@link toPoint points}, to be rotated 
 * @param {{x:number, y:number}} pivot XY {@link toPoint point} coordinates to rotate around 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}[]} input array, with all points rotated as specified */
export function RotatePointsAroundPivot(points, pivot, angle, inDegrees = true) {
    points.forEach(point => { point = RotatePointAroundPivot(point, pivot, angle, inDegrees); });
    return points;
}
/**
 * Takes an array of XY {@link toPoint points} and rotates them all around origin [0,0] 
 * @param {{x:number, y:number}[]} points Array of {@link toPoint points}, to be rotated 
 * @param {number} angle Angle to rotate by, in degrees (default) or radians 
 * @param {boolean} [inDegrees=true] If `angle` in degrees? If false, angle is in radians 
 * @returns {{x:number, y:number}[]} input array, with all points rotated as specified */
export function RotatePointsAroundOrigin(points, angle, inDegrees = true) {
    points.forEach(point => { point = RotatePointAroundOrigin(point, angle, inDegrees); });
    return points;
}
/**
 * Determines the shared center {@link toPoint point} of all given {@link toPoint points}
 * @param {...{x:number, y:number}} points Array of {@link toPoint points} to calculate the shared center of 
 * @returns {{x:number, y:number}} Single XY {@link toPoint point} representing the shared center of all given points */
export function FindPointsSharedCenter(...points) {
    // ensure non-null and valid, otherwise return point with NaN coords 
    if (points == null) { return { x: NaN, y: NaN }; }
    points = points.flattenSpread();
    if (points.length == 0) { return { x: NaN, y: NaN }; }
    if (points.length == 1) { return points[0]; } // single point, it's its own center 
    // add all points coords together, average, return 
    let center = { x: 0, y: 0 };
    for (let i = 0; i < points.length; i++) {
        center.x += points[i].x;
        center.y += points[i].y;
    }
    center.x /= points.length;
    center.y /= points.length;
    return center;
}
// #endregion Geometry

// #region Arrays 

/**
 * Gets the longest length array found in a given 2d array
 * @param {Array<Array<any>>} arrays 2d array 
 * @returns {number} max length found of all arrays in 2d array, 
 * or 0 if invalid/error 
 */
export function MaxLength2DArray(arrays) {
    if (!Is2DArray(arrays)) { return 0; }
    let max = 0;
    for (let i = 0; i < arrays.length; i++) {
        if (!Array.isArray(arrays[i])) { continue; }
        let len = arrays[i].length;
        if (len > max) { max = len; }
    }
    return max;
}

/**
 * Determine if the given `arrays` value is, in fact, a 2D array
 * @param {Array<Array<any>>} arrays 2d array 
 * @param {boolean} [checkAllArrayIndices = true] check all indices?
 * if true, returns `false` if any indices ARE NOT an array. if false,
 * returns `true` if any indices ARE an array.
 * @returns {boolean}
 */
export function Is2DArray(arrays, checkAllArrayIndices = true) {
    if (!arrays) { return false; }
    if (!Array.isArray(arrays)) { return false; }
    if (arrays.length == 0) { return false; }
    for (let i = 0; i < arrays.length; i++) {
        if (checkAllArrayIndices) {
            if (!Array.isArray(arrays[i])) {
                return false;
            }
        } else {
            if (Array.isArray(arrays[i])) {
                return true;
            }
        }
    }
    return checkAllArrayIndices;
}

/**
 * Takes an array or 2D array, and ensures all its indices are also arrays. 
 * Eg, [[1],2,3,[4,5]] will become [[1],[2],[3],[4,5]]
 * @param {Array<Array<any>>|Array<any>} array array to convert into 2d array
 * @returns {Array<Array<any>>} 2d array version of input array 
 */
export function ConvertArrayIndicesTo2DArray(array) {
    if (!array) { return null; }
    if (!Array.isArray(array)) { return null; }
    if (array.length == 0) { return array; }
    let newArray = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] == null || array[i] == undefined) {
            // null/undefined value, push empty array
            // newArray.push([null]);
            newArray.push([]);
        } else if (Array.isArray(array[i])) {
            // already an array, push into new array 
            newArray.push(array[i]);
        } else {
            // not an array, push new value in its own array into array
            newArray.push([array[i]]);
        }
    }
    return newArray;
}

// #endregion Arrays

// #region CSS

/** 
 * @typedef {object} CSSStyleAccessor Wrapper around Get the {@linkcode CSSStyleDeclaration}, ensuring it's only accessed after the document has fully loaded.
 * @property {CSSStyleDeclaration} style Get the {@linkcode CSSStyleDeclaration} loaded on this page. Accessing prior to load throws an error. 
 */

/** 
 * Load-safe accessor for the {@link CSSStyleDeclaration CSS stylesheet} on this page.
 * 
 * **Note:** Use {@linkcode css.style} when accessing the stylesheet (eg, 
 * `style.value.getPropertyValue`), as this is just an accessor.
 * @type {CSSStyleAccessor}
 * @readonly
 */
export const css = {
    get style() {
        if (!_style) {
            if (!document.body) {
                throw new Error("Body isn't yet loaded, don't call style until after window is loaded");
            }
            _style = window.getComputedStyle(document.body);
        }
        return _style;
    }
};
/** 
 * local {@link css} reference for utils
 * @type {CSSStyleDeclaration|null} */
let _style = null;

/**
 * Gets a CSS variable from loaded stylesheets
 * @param {string} varName Name of variable. Should start with `--`, but if not, it will be added
 * @returns {string|undefined} Value of the given variable
 */
export function GetCSSVariable(varName) {
    if (isBlank(varName)) { return; }
    if (!varName.startsWith('--')) {
        varName = `${varName.startsWith('-') ? '-' : '--'}${varName}`;
    }
    return css.style.getPropertyValue(varName);
}

// #endregion CSS

// #region HTML Elements

/**
 * Get all sibling elements to the given element
 * @param {Element} element 
 * @returns {Element[]}
 */
export function GetAllSiblings(element) {
    if (!element || !element.parentNode) { return []; }
    return Array.from(element.parentNode.children).
        filter(sibling => sibling !== element);
}
/**
 * Get all parent elements to the given child element
 * @param {Element} child 
 * @returns {Element[]}
 */
export function GetAllParents(child) {
    if (child == null || child.parentElement == null) { return []; }
    let parents = [];
    let currentElement = child;
    while (currentElement && currentElement !== document.body && currentElement !== document.documentElement) {
        currentElement = currentElement.parentElement;
        if (currentElement) { // Ensure currentElement is not null before pushing
            parents.push(currentElement);
        }
    }
    return parents;
}
/**
 * Get all children of the given element, optionally recursively getting subsequent children
 * @param {Element} parent parent element
 * @param {boolean} [recursive = true] include children of children? default true
 * @returns {Element[]}
 */
export function GetAllChildren(parent, recursive = true) {
    if (!recursive) { return [...parent.children]; }
    let children = [];
    for (const child of parent.children) {
        children.push(child);
        if (child.children.length > 0) {
            children = children.concat(GetAllChildren(child, true));
        }
    }
    return children;
}
/**
 * Returns the first sibling of the given element with the given class found. 
 * If none are found, returns null 
 * @param {Element} element source element to search siblings 
 * @param {string} cssClass class name to check for
 * @returns {Element|null} first found sibling element with class, or null
 */
export function GetSiblingWithClass(element, cssClass) {
    let siblings = GetAllSiblings(element);
    if (siblings.length == 0) { return null; }
    for (let i = 0; i < siblings.length; i++) {
        if (ElementHasClass(siblings[i], cssClass)) {
            return siblings[i];
        }
    }
    return null;
}
/**
 * Returns all siblings of the given element with the given class found.
 * @param {Element} element source element to search siblings 
 * @param {string} cssClass class name to check for
 * @returns {Element[]} all sibling elements with class
 */
export function GetAllSiblingsWithClass(element, cssClass) {
    let siblings = GetAllSiblings(element);
    if (siblings.length == 0) { return []; }
    let siblingsWithClass = [];
    for (let i = 0; i < siblings.length; i++) {
        if (ElementHasClass(siblings[i], cssClass)) {
            siblingsWithClass.push(siblings[i]);
        }
    }
    return siblingsWithClass;
}
/**
 * Returns the first child of the given element with the given class found. 
 * If none are found, returns null 
 * @param {Element} parentElement source parent element to search the children of 
 * @param {string} cssClass class name to check for 
 * @param {boolean} [recursive=true] search children of children? Default `true` 
 * @returns {Element|null} first found child element with class, or null
 */
export function GetChildWithClass(parentElement, cssClass, recursive = true) {
    for (const child of parentElement.children) {
        if (ElementHasClass(child, cssClass)) {
            return child;
        }
        if (recursive) {
            let grandchild = GetChildWithClass(child, cssClass, recursive);
            if (grandchild != null) {
                return grandchild;
            }
        }
    }
    return null;
}
/**
 * Returns all children of the given element with the given class found
 * @param {Element} parentElement source parent element to search the children of 
 * @param {string} cssClass class name to check for 
 * @param {boolean} [recursive=true] search children of children? Default `true` 
 * @returns {Element[]} child elements with class
 */
export function GetAllChildrenWithClass(parentElement, cssClass, recursive = true) {
    let children = GetAllChildren(parentElement, recursive);
    if (children == []) { return null; }
    let childrenWithClass = [];
    for (let i = 0; i < children.length; i++) {
        if (ElementHasClass(children[i], cssClass)) {
            childrenWithClass.push(children[i]);
        }
    }
    return childrenWithClass;
}
/**
 * Returns the first parent of the given element with the given class found. 
 * If none are found, returns null 
 * @param {Element} childElement source child element to search the parents of 
 * @param {string} cssClass class name to check for 
 * @returns {Element|null} first found parent element with class, or null
 */
export function GetParentWithClass(childElement, cssClass) {
    let parents = GetAllParents(childElement);
    if (parents == []) { return null; }
    for (let i = 0; i < parents.length; i++) {
        if (ElementHasClass(parents[i], cssClass)) {
            return parents[i];
        }
    }
    return null;
}
/**
 * Returns all parents of the given element with the given class found. 
 * @param {Element} childElement source child element to search the parents of 
 * @param {string} cssClass class name to check for 
 * @returns {Element[]} parent elements with class, or null
 */
export function GetAllParentsWithClass(childElement, cssClass) {
    let parents = GetAllParents(childElement);
    if (parents == []) { return []; }
    let parentsWithClass = [];
    for (let i = 0; i < parents.length; i++) {
        if (ElementHasClass(parents[i], cssClass)) {
            parentsWithClass.push(parents[i]);
        }
    }
    return parentsWithClass;
}

/**
 * Gets all Elements in an array with the given CSS class. 
 * 
 * Uses `getElementsByClassName`. To search for multiple CSS classes, 
 * use {@linkcode GetAllElementsWithClasses}, or separate multiple class
 * names by whitespace. If no classes are found or the given class is 
 * empty, returns `[]`
 * @param {string} cssClass CSS class to read. If null/blank, returns `[]` 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName 
 * @returns {Element[]}
 */
export function GetAllElementsWithClass(cssClass) {
    if (isBlank(cssClass)) { return []; }
    cssClass = cssClass.removeAll('.'); // remove periods from class names 
    let htmlCollection = document.getElementsByClassName(cssClass);
    return Array.from(htmlCollection);
}
/**
 * Gets all Elements in an array with all of the given CSS classes. 
 * 
 * For using a single CSS class, see {@linkcode GetAllChildrenWithClass}.
 * @param {spreadString} cssClasses CSS classes to read. If null, returns `[]` 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document/getElementsByClassName 
 * @returns {Element[]}
 */
export function GetAllElementsWithClasses(...cssClasses) {
    if (cssClasses == null) { return []; }
    cssClasses = cssClasses.flattenSpread();
    return GetAllElementsWithClass(cssClasses.join(' '));
}

/**
 * Convenience method, just checks if the given element has the given CSS class
 * @param {Element} element 
 * @param {string} cssClass 
 * @returns {boolean}
 */
export function ElementHasClass(element, cssClass) {
    return element != null && element.classList.contains(cssClass);
}

/**
 * Is the given `parentElement` the parent of the given `childElement`? 
 * Returns `true` if so. 
 * 
 * If `recursive` is `true`, searches the entire DOM hierarchy from
 * `childElement` upwards. If `false`, only checks for immediate parenting. 
 * @param {Element} parentElement Parent element to search for 
 * @param {Element} childElement Child element to reference 
 * @param {boolean} [recursive=true] Search entire hierarchy? Default `true` 
 * @see {@linkcode IsChildOf} 
 * @returns {boolean} 
 */
export function IsParentOf(parentElement, childElement, recursive = true) {
    // if (childElement == null) { return false; }
    // if (childElement.parentElement == null) { return parentElement == null; } // ignore 
    if (childElement == null || parentElement == null) { return false; }
    if (childElement.parentElement === parentElement) { return true; }
    if (recursive) { return IsParentOf(parentElement, childElement.parentElement, recursive); }
    return false;
}
/**
 * Is the given `childElement` a child of the given `parentElement`? 
 * Returns `true` if so. 
 * 
 * If `recursive` is `true`, searches the entire DOM hierarchy from
 * `childElement` upwards. If `false`, only checks for immediate parenting. 
 * @param {Element} parentElement Parent element to search for 
 * @param {Element} childElement Child element to reference 
 * @param {boolean} [recursive=true] Search entire hierarchy? Default `true` 
 * @see {@linkcode IsParentOf}
 * @returns {boolean} 
 */
export function IsChildOf(childElement, parentElement, recursive = true) {
    return IsParentOf(parentElement, childElement);
}

/**
 * Creates a new {@link HTMLSpanElement}, typically for CSS/JS type interactions. 
 * @returns {HTMLSpanElement}
 */
export const DummySpan = () => document.createElement('span');

// #endregion HTML Elements

// #region Element Selection

/**
 * Checks if the given Element is selected or not 
 * @param {Element} element Element to check for selection 
 * @param {boolean} [includeChildren=true] 
 * Also check if a child of the given element is selected? 
 * @returns {boolean} 
 */
export function IsElementSelected(element, includeChildren = true) {
    if (element == null) { return false; }

    // check for selection
    const selection = window.getSelection && window.getSelection();
    if (selection && selection.rangeCount) {
        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            if (element.contains(range.commonAncestorContainer)) {
                return true;
            }
        }
    }
    // check for a focused descendant 
    const active = document.activeElement;
    if (active && element.contains(active)) {
        return true;
    }
    return false;
}

/**
 * Deselects (and optionally blurs) the given HTMLElement AND all its children
 * @param {Element} element HTMLElement to deselect
 * @param {boolean} [alsoBlur=true] also blur (unfocus) the element, or any focused children of the element?  
 */
export function DeselectElement(element, alsoBlur = true) {
    // ensure element is non-null
    if (element == null) { return; }
    // get selection 
    const selection = window.getSelection();
    // ensure that selection(s) exist
    if (selection.rangeCount) {
        for (let i = 0; i < selection.rangeCount; i++) {
            const range = selection.getRangeAt(i);
            // check if the selection intersects the given element
            if (element.contains(range.commonAncestorContainer)) {
                selection.removeAllRanges();
                break;
            }
        }
    }
    if (alsoBlur) {
        // check for any active elements / descendants to defocus 
        const active = document.activeElement;
        if (element.contains(active)) {
            active.blur();
        }
    }
}

/**
 * Deselect ALL selected elements on the page 
 * @param {boolean} [alsoBlur=true] also blur (unfocus) any and all focused elements?
 */
export function DeselectAll(alsoBlur = true) {
    window.getSelection().removeAllRanges();
    if (alsoBlur) {
        if (document.activeElement && document.activeElement !== document.body) {
            document.activeElement.blur();
        }
    }
}

/**
 * Selects the given Element, with optional config parameters
 * @param {Element} element element to select
 * @param {boolean} [focusVisible = true] 
 * @param {boolean} [preventScroll = false] 
 */
export function SelectFocusElement(element, focusVisible = true, preventScroll = false) {
    element.focus({ focusVisible: focusVisible, preventScroll: preventScroll });
}

/**
 * Returns the current active element (convenience method, just calls `document.activeElement`)
 * @returns {Element|null}
 */
export function GetActiveElement() {
    return document.activeElement;
}
/**
 * Returns true if the given element is the currently active element
 * @param {Element} element 
 * @returns {boolean}
 */
export function IsActiveElement(element) {
    if (!element) { return false }
    return element == GetActiveElement();
}

/**
 * Enables or disables the given HTML element by doing the following:
 * - On Enable...
 *   - Setting `pointerEvents` attribute to `'auto'`
 *   - Removing `aria-hidden` attribute
 *   - Removing `inert` attribute
 *   - Removing `tabIndex` attribute, including on all interactive children,
 *     unless a `preservedTabIndex` attribute is found, who's value will be used instead.
 * - On Disable...
 *   - Calls `DeselectElement` to deselect and blur the element
 *   - Setting `pointerEvents` attribute to `'none'`
 *   - Setting `tabIndex` attribute to `-1`, including to all interactive children
 *   - Setting `aria-hidden` attribute to `true`
 *   - Setting `inert` attribute to `''`
 * @param {Element} element HTMLElement to fully enable or disable
 * @param {boolean} [set=true] state to assign, `true` to Enable (default), or `false` to Disable 
 * @param {boolean} [updateStoredValues=false] Should stored values (draggable, pointer-events) 
 * also be updated? Default `false` 
 */
export function SetElementEnabled(element, set = true, updateStoredValues = false) {
    // preserve values on first call 
    if (element._priorDraggable == null) {
        element._priorDraggable = element.draggable;
    }
    if (element._priorPointerEvents == null) {
        element._priorPointerEvents = element.style.pointerEvents;
    }
    if (!set) {
        DeselectElement(element, true);
        if (updateStoredValues) {
            element.draggable = set ? element._priorDraggable : 'false';
        }
    }
    if (updateStoredValues) {
        element.style.pointerEvents = set ? element._priorPointerEvents : 'none';
    }
    if (set) {
        // enable 
        if (element.hasAttribute('preservedTabIndex')) {
            element.setAttribute('tabIndex', element.getAttribute('preservedTabIndex'));
        } else {
            element.removeAttribute('tabIndex');
        }
        element.removeAttribute('aria-hidden');
        element.removeAttribute('inert');
    } else {
        // disable 
        element.setAttribute('tabIndex', '-1');
        element.setAttribute('aria-hidden', 'true');
        element.setAttribute('inert', '');
    }
    element.querySelectorAll('a, button, input, select, textarea, [tabindex]').forEach(el => {
        if (set) {
            // enable 
            if (el.hasAttribute('preservedTabIndex')) {
                el.setAttribute('tabIndex', el.getAttribute('preservedTabIndex'));
            } else {
                el.removeAttribute('tabIndex');
            }
        } else {
            // disable 
            el.setAttribute('tabIndex', '-1');
        }
        if ('disabled' in el) el.disabled = !set;
    });
}

/**
 * Disables the given HTML element by doing the following:
 * - Setting `pointerEvents` attribute to `'none'`
 * - Setting `tabIndex` attribute to `-1`, including to all interactive children
 * - Setting `aria-hidden` attribute to `true`
 * - Setting `inert` attribute to `''`
 * 
 * Convenience function; simply calls `SetElementEnabled(element,false);`
 * @param {Element} element Element to fully disable
 */
export function SetElementDisabled(element) {
    SetElementEnabled(element, false);
}

/**
 * Is the given element connected to the document, and (optionally) is its 
 * `getClientRects()` count greater than zero (eg, is it rendered in the layout)?
 * @param {Element} element Element to check 
 * @param {boolean} [alsoCheckLayoutBox=true] If connected, also check `getClientRects` count? Default `true` 
 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Node/isConnected Node.isConnected} docs 
 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Element/getClientRects Element.getClientRects} docs 
 * @returns {boolean}
 */
export function IsElementConnected(element, alsoCheckLayoutBox = true) {
    if (!element.isConnected) { return false; }
    if (alsoCheckLayoutBox && element.getClientRects().length === 0) { return false; }
    return true;
}

// #endregion Element Selection

// #region Timing 

/** local array of intervals and timers @type {[string, number][]} */
let _intervals = [];
/**
 * sets a given interval timer label to timestamp of `performance.now()`
 * @param {string} label reference label for the given interval timer 
 */
export function SetInterval(label) {
    SetIntervalTo(label, performance.now());
}
/**
 * sets a given interval timer label to the given timestamp
 * @param {string} label reference label for the given interval timer  
 * @param {number} timestamp numeric timestamp to assign
 */
export function SetIntervalTo(label, timestamp) {
    if (isBlank(label)) {
        console.error(`ERROR: invalid interval label name, can't be null/blank`)
        return;
    }
    for (let i = 0; i < _intervals.length; i++) {
        if (_intervals[i][0] == label) {
            _intervals[i][1] = timestamp;
            return;
        }
    }
    _intervals.push([label, timestamp]);
}
/**
 * returns the stored value for the given interval timer label
 * @param {string} label reference label for the given interval timer 
 * @returns {number} stored value for interval, or `-1` if `label` is null/not found
 */
export function GetInterval(label) {
    if (!label) { return -1; }
    for (let i = 0; i < _intervals.length; i++) {
        if (_intervals[i][0] == label) { return _intervals[i][1]; }
    }
    return -1;
}
/**
 * checks if the given interval timer label exists
 * @param {string} label reference label for the given interval timer 
 * @returns {boolean}
 */
export function DoesIntervalExist(label) {
    for (let i = 0; i < _intervals.length; i++) {
        if (_intervals[i][0] == label) { return true; }
    }
    return false;
}
/**
 * gets the time in ms between the given time interval label's stored value and now
 * @param {string} label reference label for the given interval timer 
 * @returns {number} time in ms, or -1 if label isn't found or is invalid
 */
export function TimeSinceLastInterval(label) {
    let interval = GetInterval(label);
    if (interval == -1) { return -1; }
    return TimeBetweenTimestampAndNow(interval);
}
/**
 * returns true if the given interval timer label's time between its stored value
 * and now is greater than the given lapTime 
 * @param {string} label reference label for the given interval timer 
 * @param {number} lapTime time, in ms, to check between the label interval's stored time and now
 * @returns {boolean} true if equal/more time in ms as `lapTime` has passed
 */
export function HasIntervalLapped(label, lapTime) {
    let timeSince = TimeSinceLastInterval(label);
    if (timeSince == -1) { return false; }
    return timeSince >= lapTime;
}
/**
 * Checks if the given interval timer label's time in ms since last update
 * is the given lapTime or more. If false, returns `false`. If true, updates
 * the interval label's value to now, and returns `true`. If label wasn't already
 * defined, creates it via {@link SetInterval} and returns the value of `returnOnNew`
 * @param {string} label reference label for the given interval timer 
 * @param {number} lapTime time, in ms, to check between the label interval's stored time and now
 * @param {boolean} [returnOnNew = true] value to return if label doesn't already exist and is newly created 
 * @returns {boolean} true if "lap" has passed, false if not, `returnOnNew` if newly created label 
 */
export function LapCheckInterval(label, lapTime, returnOnNew = true) {
    if (!DoesIntervalExist(label)) {
        SetInterval(label);
        return returnOnNew;
    }
    if (HasIntervalLapped(label, lapTime)) {
        SetInterval(label);
        return true;
    }
    return false;
}
/**
 * Returns the time, in ms, between the given timestamp and `performance.now`
 * @param {number} timestamp timestamp to compare 
 * @returns {number} time, in ms, between the given timestamp and now
 */
export function TimeBetweenTimestampAndNow(timestamp) {
    return TimeBetweenTwoTimestamps(timestamp, performance.now())
}
/**
 * Returns the time, in ms, between the two given timestamps. 
 * Ensures absolute time, doesn't matter which timestamp is larger. 
 * @param {number} timestampA 
 * @param {number} timestampB 
 * @returns {number} time, in ms, between the two given timestamps
 */
export function TimeBetweenTwoTimestamps(timestampA, timestampB) {
    if (timestampB >= timestampA) {
        return timestampB - timestampA;
    }
    return timestampA - timestampB;
}

// #endregion Timing

// #region Browser

/** 
 * @typedef {'Normal'|'NoHistory'|'NewTab'|'Popup'} URLMode 
 * Method to use when opening a new URL via {@linkcode OpenURL}.
 * - {@linkcode URLMode.Normal Normal}: 
 *     Opens the given URL in the current browser tab.
 * - {@linkcode URLMode.NoHistory NoHistory}: 
 *     Opens in the same tab, but *does not* update the browser history,
 *     and no states are added to the Back/Forward navigation buttons. 
 *     Useful for situations like a post-login redirect. 
 *     
 *     Uses `window.location.replace(url)`
 *     {@link https://developer.mozilla.org/en-US/docs/Web/API/Location/replace (MDN docs)}
 *     instead of `Window.open()`. 
 * - {@linkcode URLMode.NewTab NewTab}: 
 *     Opens the given URL in a new browser tab 
 *     (or window, if the user's browser is configured to do so).
 * - {@linkcode URLMode.Popup Popup}: 
 *     Opens the given URL in a popup tab. If you want to customize the
 *     popup at all, it's recommended to call `Window.open` directly, to 
 *     access the `windowfeatures` parameter. 
 *     
 *     Will use the fixed name `"popup"`, meaning that by default, 
 *     a new window will be opened once and all future popups will use 
 *     that window until it's closed. 
 *     
 *     **Note:** Can be blocked by browsers, especially if opening multiple. 
 *     Avoid if possible. 
*/
export const URLMode = Object.freeze({
    /** Opens the given URL in the current browser tab. */
    Normal: 'Normal',
    /** 
     * Opens in the same tab, but *does not* update the browser history,
     * and no states are added to the Back/Forward navigation buttons. 
     * Useful for situations like a post-login redirect. 
     * 
     * Uses `window.location.replace(url)` instead of `Window.open()`.
     * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Location/replace Location.replace()} MDN documentation
     */
    NoHistory: 'NoHistory',
    /** 
     * Opens the given URL in a new browser tab 
     * (or window, if the user's browser is configured to do so).
     */
    NewTab: 'NewTab',
    /** 
     * Opens the given URL in a popup tab. If you want to customize the
     * popup at all, it's recommended to call `Window.open` directly, to 
     * access the `windowfeatures` parameter. 
     * 
     * Will use the fixed name `"popup"`, meaning that by default, 
     * a new window will be opened once and all future popups will use 
     * that window until it's closed. 
     * 
     * **Note:** Can be blocked by browsers, especially if opening multiple. 
     * Avoid if possible. 
     */
    Popup: 'Popup'
});

/**
 * Navigates to a new URL in the user's browser.
 * @param {string} url The URL or path of the resource to load. 
 * If blank or undefined, a blank page opens in the current browser context. 
 * @param {URLMode} [urlMode=URLMode.Normal] Mode to use for opening the URL. 
 * Simplified way of differentiating between opening in the same tab (`Normal`), 
 * opening in a new tab or window (`NewTab`), etc.
 * 
 * Default {@linkcode URLMode.Normal Normal}: open in the same tab.
 * @see {@linkcode https://developer.mozilla.org/en-US/docs/Web/API/Window/open Window.open()} MDN documentation
 */
export function OpenURL(url, urlMode = URLMode.Normal) {
    // auto-format URLs
    if (!isBlank(url)) {
        // check for appending forward slash 
        if (!url.endsWith('/')) {
            // add a forward slash if there is no special chars at the end 
            let subdomainStart = 0;
            for (let i = 0; i < _urlRecognizedExtensions.length; i++) {
                let domain = '.' + _urlRecognizedExtensions[i];
                let index = url.indexOf(domain);
                if (index >= 0) {
                    subdomainStart = index + domain.length;
                    break;
                }
            }
            // found start of domain, either 0 in the case of eg "relative/", or the end of ".com" in eg "test.com"
            let lastForwardSlash = url.lastIndexOf('/');
            let startSearchIndex = Math.max(subdomainStart, lastForwardSlash);
            let appendForwardSlash = true;
            for (let i = 0; i < _urlSpecialChars.length; i++) {
                if (url.substring(startSearchIndex).indexOf(_urlSpecialChars[i]) >= 0) {
                    appendForwardSlash = false;
                    break;
                }
            }
            if (appendForwardSlash) {
                url += '/';
            }
        }
    }
    switch (urlMode) {
        case URLMode.Normal:
            window.open(url, '_self');
            break;
        case URLMode.NoHistory:
            break;
        case URLMode.NewTab:
            window.open(url, '_blank');
            break;
        case URLMode.Popup:
            window.open(url, 'popup', 'popup');
            break;
        default:
            console.error(`Invalid URLMode: ${urlMode}, can't open URL: ${url}`, this);
            break;
    }
}

/** Array of common URL domains, plus some specific ones to check for */
const _urlRecognizedExtensions = ['com', 'net', 'org', 'info', 'ca', 'gov', 'co.uk', 'uk', 'de', 'fr', 'br', 'cn', 'in', 'ru', 'ly',
    'news', 'io', 'ai', 'tech', 'blog', 'bio', 'social', 'shop', 'store', 'online', 'biz', 'xyz', 'studio', 'gallery', 'garden'];
/** Special characters used in a URL to perform browser tasks */
const _urlSpecialChars = ['?', '=', '#'];

// #endregion Browser 

// #region Environment

/** If process.env.NODE_EVN is 'testing', should {@linkcode _env_isDevelopment} return `true`? */
const __TESTING_IS_DEVELOPMENT = true;
/** If process.env.NODE_EVN is 'staging', should {@linkcode _env_isProduction} return `true`? */
const __STAGING_IS_PRODUCTION = true;

/** 
 * Returns the current `process.env.NODE_EVN` environment. Typically `"development"` or `"production"`.
 * 
 * Also see `PRODUCTION_BUILD` in `webpack.config.js` 
 * 
 * @see {@linkcode _env_isDevelopment} 
 * @see {@linkcode _env_isProduction} 
 * @see https://www.geeksforgeeks.org/node-js/what-is-node_env-in-node-js/ */
export const _env_currentEnv = process.env.NODE_ENV;
/**
 * Is the {@link _env_currentEnv current} environment `staging`?
 * 
 * Also see `PRODUCTION_BUILD` in `webpack.config.js` (allows only `development` and `production`) 
 * 
 * **Note:** if {@linkcode __STAGING_IS_PRODUCTION} is `true`, {@linkcode _env_isProduction} will also return `true`. */
export const _env_isStaging = _env_currentEnv === 'staging';
/** 
 * Is the {@link _env_currentEnv current} environment `testing`/`test`?
 * 
 * Also see `PRODUCTION_BUILD` in `webpack.config.js` (allows only `development` and `production`) 
 * 
 * **Note:** if {@linkcode __TESTING_IS_DEVELOPMENT} is `true`, {@linkcode _env_isDevelopment} will also return `true`. */
export const _env_isTest = _env_currentEnv === 'testing' || _env_currentEnv === 'test';
/**
 * Is the {@link _env_currentEnv current} environment `production`/`prod`?
 * 
 * Also see `PRODUCTION_BUILD` in `webpack.config.js` (allows only `development` and `production`) 
 * 
 * **Note:** if {@linkcode __STAGING_IS_PRODUCTION} is `true`, the environment `staging` will also return `true`. */
export const _env_isProduction =
    _env_currentEnv === 'production' || _env_currentEnv === 'prod' ||
    (_env_isStaging && __STAGING_IS_PRODUCTION);
/**
 * Is the {@link _env_currentEnv current} environment `development`/`dev`?
 * 
 * **Note:** also `true` if environment is `null`\`undefined`\`""`.
 * 
 * Also see `PRODUCTION_BUILD` in `webpack.config.js` (allows only `development` and `production`) 
 * 
 * **Note:** if {@linkcode __TESTING_IS_DEVELOPMENT} is `true`, the environment `testing`/`test` will also return `true`. */
export const _env_isDevelopment =
    _env_currentEnv === null || _env_currentEnv === undefined || _env_currentEnv === '' ||
    _env_currentEnv === 'development' || _env_currentEnv === 'dev' ||
    !_env_isProduction && (!_env_isTest || __TESTING_IS_DEVELOPMENT);


// #endregion Environment
