import * as svg from './index';
import { svgHTMLAsset, svgConfig } from './index';
import { isBlank, IsStringNameSafe, isStringNotBlank, StringContainsNumeric, StringNumericDivider, StringNumericOnly, StringOnlyNumeric, StringToNumber } from "../lilutils";

/** 
 * Basic element used to create all assets in this lil SVG system (which prolly needs a name)
 * 
 * For the class that you can actually add to your document, see {@linkcode svg.htmlAsset svgHTMLAsset}.
 */
export class svgElement {
    /** Array containing all {@linkcode svgElement} instances @type {svgElement[]} */
    static allSVGElements = [];
    /** Filters and returns length of {@linkcode allSVGElements} @returns {Number} */
    static get allSVGElementsCount() { svgElement.#__filterElementsArray(); return svgElement.allSVGElements.length; }
    /** Remove all `null` values from the {@linkcode allSVGElements} array @returns {void} */
    static #__filterElementsArray() { svgElement.allSVGElements = svgElement.allSVGElements.filter(e => e != null); }
    /** Counter for all {@linkcode svgElement svgElements} ever instanced, ensuring unique IDs for each one. */
    static #svgElementsCount = 0;

    /** 
     * Unique identifier for this svgElement. 
     * 
     * Every svgElement *must* have a unique ID, but they will be 
     * automatically generated if not manually assigned in the constructor.
     * 
     * **Note:** if you find Maximum Call Stack Overflow errors occurring 
     * while creating new SVG elements, specifically when setting the 
     * {@linkcode id} outside of the constructor, consider settinig 
     * {@linkcode skipNextIDUpdate} to `true` before setting the ID.
     * @returns {string} 
     **/
    get id() { return this._id; };
    set id(v) {
        // check if we reset null values to default uniqueID 
        if (v == null && svgConfig.SETTING_ELEMENT_ID_NULL_SETS_TO_UNIQUE) {
            v = this.uniqueID;
        }
        if (this._id == v) { return; }
        // ensure ID is unique 
        if (v != null) {
            svgElement.#__filterElementsArray();
            for (let i = 0; i < svgElement.allSVGElements.length; i++) {
                if (svgElement.allSVGElements[i] == this) { continue; }
                if (isStringNotBlank(svgElement.allSVGElements[i].id)) {
                    if (svgElement.allSVGElements[i].id == v) {
                        // yup, IDs match 
                        if (svg.config.REQUIRE_UNIQUE_SVG_ELEMENT_IDS) {
                            console.error(`ERROR: svgElement ID ${v} is already in use. Cannot assign to this svgElement. IDs should be unique.`, this, svgElement.allSVGElements[i]);
                            return;
                        } else {
                            console.warn(`WARNING: svgElement ID ${v} is already in use. This may cause issues. IDs should be unique.`, this, svgElement.allSVGElements[i]);
                        }
                    }
                }
            }
        }
        let prev = this._id;
        this._id = v;
        if (!this._firstIDAssigned) {
            this._firstIDAssigned = true;
        } else {
            if (!this.suppressOnChange) {
                this._invokeChange('id', v, prev, this);
                if (this.hasOwnProperty('parent')) {
                    this.parent?._invokeChange('id', v, prev, this);
                }
            }
        }
        if (this.#_shouldSkipIDUpdate == true) {
            // do NOT perform ID update 
            this.skipNextOnChangeForID = false; // always ensure this is reset after update 
        } else {
            // update ID change on all SVG Elements 
            let newURL = this.stringToURL(v);
            for (let i = 0; i < svgElement.allSVGElementsCount; i++) {
                let e = svgElement.allSVGElements[i];
                if (e == null) { continue; }
                // iterate through all keys in an object, check for URLs to update 
                let values = getSortedValues(e).flat();
                for (let i = 0; i < values.length; i++) {
                    if (values[i] == null) { continue; }
                    if (this.isURL(values[i][1])) {
                        // extract id from URL 
                        let s = this.stringFromURL(values[i][1]);
                        if (s == prev) {
                            // yup, found a match! replace ID 
                            e[values[i][0]] = newURL;
                        }
                    }
                }
            }
        }

        //TODO: move object property/getter listing to utils 
        //Issue URL: https://github.com/nickyonge/evto-web/issues/55
        /**
         * Returns a list of all entries (properties, property descriptions) on this object AND its class parent prototype
         * @param {Object} obj Object to get properties of
         * @param {boolean} [skipObjectEntries=true] skip the entries from base `Object` prototype? Default `true`
         * @returns {[string, TypedPropertyDescriptor<any> & PropertyDescriptor][] | []}
         */
        function listAll(obj, skipObjectEntries = false) {
            let prototype = Object.getPrototypeOf(obj);
            if (prototype == null) { return []; }// reached the end! 
            if (skipObjectEntries && prototype.constructor.name === 'Object') { return []; } // don't include Object entries 
            // get all property descriptors 
            let entries = Object.entries(Object.getOwnPropertyDescriptors(prototype));
            if (!obj.__SKIP_INSTANCE_PROPERTIES) {
                // should only run on the first object passed into listAll, which is an iterative function 
                entries = entries.concat(Object.entries(Object.getOwnPropertyDescriptors(obj)));
            }
            let subEntries = [];
            for (let i = 0; i < entries.length; i++) {
                if (entries[i][0] === 'constructor') {
                    let p = entries[i][1].value.prototype;
                    let prev = null;
                    let hasProperty = p.hasOwnProperty('__SKIP_INSTANCE_PROPERTIES');
                    if (hasProperty) {
                        // in the EXTREMELY unlikely chance that an object prototype already has a
                        // property called __SKIP_INSTANCE_PROPERTIES, preserve and restore the value
                        prev = p.__SKIP_INSTANCE_PROPERTIES;
                    }
                    p.__SKIP_INSTANCE_PROPERTIES = true;// skip instance properties on parent constructors 
                    subEntries.push(listAll(p, skipObjectEntries));
                    if (hasProperty) {
                        p.__SKIP_INSTANCE_PROPERTIES = prev;
                    } else {
                        delete (p.__SKIP_INSTANCE_PROPERTIES);
                    }
                }
            }
            for (let i = 0; i < subEntries.length; i++) {
                entries = entries.concat(subEntries[i]);
            }
            return entries;
        }
        function getSortedValues(obj) {
            // [ getters[getter,value], properties[property,value] ]
            let all = listAll(obj);
            let properties = [];
            let getters = [];
            function skipProperty(name) {
                const skipPropertyNames = ['id', 'idURL'];
                return skipPropertyNames.contains(name);
            }
            for (let i = 0; i < all.length; i++) {
                if (all[i] == null) { continue; }
                if (skipProperty(all[i][0])) { continue; }
                if (typeof all[i][1].get === 'function') {
                    let getter = [all[i][0], obj[all[i][0]]];
                    getters.push(getter);
                }
                else if (all[i][1].enumerable && all[i][1].writable) {
                    let property = [all[i][0], obj[all[i][0]]];
                    properties.push(property);
                }
            }
            return [getters, properties];
        }
    }
    /** local reference for ID @type {string} @private */
    _id;
    /** local flag for first ID assignment @type {boolean} @private */
    _firstIDAssigned = false;

    /** 
     * Should {@linkcode onChange} callbacks be skipped 
     * when changing this element's {@linkcode id}? 
     * 
     * **Note**: this remains `true` until changed. For
     * a one-off skip, see {@linkcode skipNextOnChangeForID}. 
     * @type {boolean} */
    skipAllOnChangeForID = false;
    /** 
     * Should {@linkcode onChange} callbacks be skipped 
     * the next time element's {@linkcode id} changes? 
     * 
     * **Note**: this gets reset to `false` after the next ID 
     * change. For persistent skipping, see {@linkcode skipAllOnChangeForID}. 
     * @type {boolean} */
    skipNextOnChangeForID = false;
    /** Returns `true` if either {@linkcode skipAllOnChangeForID} or {@linkcode skipNextIDUpdate} is `true` @returns {boolean} */
    get #_shouldSkipIDUpdate() { return this.skipAllOnChangeForID || this.skipNextOnChangeForID; }

    /** The guaranteed-unique ID value for this svgElement, combining
     * {@linkcode svgInstanceNumber} and {@linkcode svgConstructor} @type {string} */
    get uniqueID() { return `__svgE[${this.svgInstanceNumber}]:${this.svgConstructor}`; }
    /** The guaranteed-unique instance ID assigned to every svgElement @returns {number} */
    get svgInstanceNumber() { return this[__svgElementInstance]; }
    /** The name of this SVG class constructor, eg {@linkcode svgHTMLAsset.constructor "svgHTMLAsset"} @returns {string} */
    get svgConstructor() { return this.constructor.name; }

    /**
     * Base class for all component elements of an SVG asset
     * @param {string} [id] Value for {@linkcode svgElement.id}. If omitted or blank, {@linkcode svgElement.id ID} will be set to {@linkcode svgElement.uniqueID}.
     */
    constructor(id = undefined) {
        // record this element's unique instance number
        Object.defineProperty(this, __svgElementInstance, { value: svgElement.#svgElementsCount, configurable: false, enumerable: true, writable: false });
        // set id 
        let skipAutoID = svg.config.IGNORE_AUTO_ID_CLASSES.contains(this.className);
        if (isBlank(id)) {
            if (!skipAutoID) {
                id = this.uniqueID;
            }
        }
        // preserve prevous skipNextIDUpdate, because this one's set interally 
        let prev = this.skipNextOnChangeForID;
        this.skipNextOnChangeForID = true;
        this.id = id;
        this.skipNextOnChangeForID = prev;
        // update SVG Element arrays 
        svgElement.#__filterElementsArray();
        svgElement.allSVGElements.push(this);
        svgElement.#svgElementsCount++;
    }

    /**
     * Set a callback for when a value in this {@link svgElement} has changed.
     * 
     * Can handle single {@link svg.onChange onChange} method assignments, or
     * {@link svg.onChange onChange[]} arrays (including nested arrays).
     * 
     * **NOTE:** convenience setter! Passes value to {@linkcode AddOnChangeCallback}. 
     * See {@linkcode onChangeCallbacks} for all callbacks, or {@linkcode hasOnChange} 
     * to check if any callback is added. This setter has no getter. 
     * @param {svg.onChange | svg.onChange[]} onChangeCallback {@link svg.onChange onChange} 
     * onChange method to call. Properties are: 
     * - `valueChanged:string` — The name of the value that was changed 
     * - `newValue:any` — The newly assigned value 
     * - `previousValue:any` — The old value, for reference  
     * - `changedElement?:changedElement` — The {@link svgElement} that was changed (default `undefined`)
     */
    set onChange(onChangeCallback) {
        this.AddOnChangeCallback(onChangeCallback);
    };

    /**
     * Set a callback for when a value in this {@link svgElement} has changed. 
     * 
     * Passing a `null` value will reset {@linkcode onChangeCallbacks} to `[]`, 
     * clearing all callbacks. Passing `undefined` will output a console warning.
     * 
     * Returns `true` if the callback was successfully added, including passing
     * a `null` callback to reset the onChange callbacks.
     * 
     * Can handle single {@link svg.onChange onChange} method assignments, or
     * {@link svg.onChange onChange[]} arrays (including nested arrays).
     * @param {svg.onChange | svg.onChange[]} onChangeCallback {@link svg.onChange onChange} 
     * onChange method to call. Properties are: 
     * - `valueChanged:string` — The name of the value that was changed 
     * - `newValue:any` — The newly assigned value 
     * - `previousValue:any` — The old value, for reference  
     * - `changedElement?:changedElement` — The {@link svgElement} that was changed (default `undefined`)
     * @returns {boolean}
     */
    AddOnChangeCallback(onChangeCallback) {
        // if setting null, reset methods 
        if (onChangeCallback == null) {
            if (onChangeCallback === undefined) {
                console.warn("Assigning undefined onChangeCallback. " +
                    "Will reset all onChangeCallbacks on this element, " +
                    "but set null - not undefined - to avoid this warning, " +
                    "in case of unintentional callback clearing.", this);
            }
            this.onChangeCallbacks = [];
            return true;
        }
        // ensure onChangeCallbacks array exsts 
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; }
        // check if adding array or individual methods 
        if (Array.isArray(onChangeCallback)) {
            let anyOnChangeAdded = false;
            for (let i = 0; i < onChangeCallback.length; i++) {
                if (onChangeCallback[i] == null) { continue; }
                if (Array.isArray(onChangeCallback[i])) {
                    // handle nested arrays 
                    if (this.AddOnChangeCallback(onChangeCallback[i])) {
                        anyOnChangeAdded = true;
                    }
                    continue;
                }
                // check if function - if so, add 
                if (typeof onChangeCallback[i] === 'function') {
                    // ensure not duplicate 
                    if (!this.onChangeCallbacks.contains(onChangeCallback[i])) {
                        this.onChangeCallbacks.push(onChangeCallback[i].bind(this));
                        anyOnChangeAdded = true;
                    }
                } else {
                    console.warn(`WARNING: can't add value ${onChangeCallback[i]} of invalid type ${typeof onChangeCallback[i]} to onChange callback array (via array), must be function`, onChangeCallback, this);
                }
            }
            return anyOnChangeAdded;
        } else if (typeof onChangeCallback === 'function') {
            // single onChangeCallback 
            if (!this.onChangeCallbacks.contains(onChangeCallback)) {
                this.onChangeCallbacks.push(onChangeCallback.bind(this));
            }
            return true;
        } else {
            console.warn(`WARNING: can't add value ${onChangeCallback} of invalid type ${typeof onChangeCallback} to onChange callback array, must be function`, this);
        }
        return false;
    }
    /**
     * Remove this callback from when a value in this {@link svgElement} has changed, if it's been added.
     * 
     * Returns `true` if the callback was successfully removed, `false` if it failed
     * to be removed. If callback wasn't found, returns {@linkcode returnIfNotFound}. 
     * @param {svg.onChange} onChangeCallback Callback function to remove 
     * @param {boolean} [returnIfNotFound=false] Value to return if the callback wasn't found. Default `false`
     */
    RemoveOnChangeCallback(onChangeCallback, returnIfNotFound = false) {
        if (onChangeCallback == null) { return false; }
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; return returnIfNotFound; }
        let i = this.GetOnChangeCallbackIndex(onChangeCallback);
        if (i == -1) { return returnIfNotFound; }
        this.onChangeCallbacks.removeAt(i);
        return true;
    }

    /**
     * Removes all {@linkcode onChangeCallbacks} from this element.
     * 
     * Returns the number of callbacks that were removed.
     * @returns {number}
     */
    RemoveAllOnChangeCallbacks() {
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; return 0; }
        if (this.onChangeCallbacks.length == 0) { return 0; }
        let n = this.onChangeCallbacks.length;
        this.onChangeCallbacks = [];
        return n;
    }

    /**
     * Checks if the given onChange callback is present on this element. 
     * @param {svg.onChange} onChangeCallback 
     * @returns {boolean}
     */
    HasOnChangeCallback(onChangeCallback) {
        if (onChangeCallback == null) { return false; }
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; return false; }
        return this.GetOnChangeCallbackIndex(onChangeCallback) >= 0;
    }

    /**
     * Checks if the given {@linkcode svg.onChange onChange} callback is 
     * present on this element, and if so, returns its index in the 
     * {@linkcode onChangeCallbacks} array. If not, returns `-1`.
     * @param {svg.onChange} onChangeCallback 
     * @returns {number}
     */
    GetOnChangeCallbackIndex(onChangeCallback) {
        if (onChangeCallback == null) { return -1; }
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; return -1; }
        for (let i = 0; i < this.onChangeCallbacks.length; i++) {
            if (this.onChangeCallbacks[i] === onChangeCallback) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Does this {@link svgElement} have any {@link svg.onChange onChange} callbacks in the {@linkcode onChangeCallbacks} array?
     * @returns {boolean}
     */
    get hasOnChange() { return this.onChangeCallbacks != null && this.onChangeCallbacks.length > 0; }

    /** 
     * Array of all {@link svg.onChange onChange} methods to call on ths {@link svgElement}, whenever a local change occurs.
     * 
     * **NOTE:** Changing this array or its values itself does NOT invoke a change.
     * @type {svg.onChange[]} 
     * */
    onChangeCallbacks = [];

    /** 
     * Should {@link svg.onChange onChange} events to this element 
     * bubble up to its {@link svgElement.parent parent}, if it has one?
     * @returns {boolean} */
    get bubbleOnChange() { return this.#_bubbleOnChange; }
    set bubbleOnChange(v) { let prev = this.#_bubbleOnChange; this.#_bubbleOnChange = v; this.changed('bubbleOnChange', v, prev); }
    /** @type {boolean} */
    #_bubbleOnChange = svg.defaults.BUBBLE_ONCHANGE;
    /**
     * 
     * Local changed callback that calls {@linkcode svg.onChange onChange} 
     * on both this element and, if it's defined and {@linkcode bubbleOnChange}
     * is `true`, its {@link parent}.
     * 
     * **Note:** This version of the method does *not* take 
     * {@linkcode svg.onChange changedElement} as a parameter, but rather 
     * automatically fills it in. All other parameters remain otherwise the same.
     * 
     * @param {string} valueChanged 
     * @param {any} newValue 
     * @param {any} previousValue 
     * @param  {...any} extraParameters 
     * @returns {void}
     * @protected
     */
    changed(valueChanged, newValue, previousValue, ...extraParameters) {
        if (this.suppressOnChange) { return; }
        this._invokeChange(valueChanged, newValue, previousValue, this, ...extraParameters);
    }

    /**
     * Callback for {@linkplain Array.prototype.onChange onChange} for local arrays. The change 
     * is propogated to this element's {@linkcode svgElement.onChangeCallbacks onChange} callbacks.
     * 
     * ---
     * **Note:** For resulting `svg.onChange` calls, the `type` 
     * is prefixed with the {@linkcode Array.prototype.name name} 
     * of the array, if assigned, or `"array"`, followed by `#`.
     * - Eg, `let myArray = []; myArray.push(1,2,3);` would 
     *   trigger an `svg.onChange` with a `type` of `"array#push"`.
     * - However, `let myNamedArray = []; myNamedArray.name = 
     *   "wow"; myNamedArray.push(1,2,3);` would trigger an 
     *   `svg.onChange` with a `type` of `"wow#push"`. 
     * - Functionally, this behaves identically to using
     *     {@linkcode _prefixOnChange}.
     * 
     * ---
     * **Note:** The `returnValue` is unshifted to the front of the `parameters` array, 
     * which is then supplied to `...extraParameters` in `svg.onChange`. So an `svg.onChange` 
     * triggered by modifying an array's `onChange` will always have an `extraParameters[0]` 
     * value corresponding to what was returned by the function called on the array.
     * - Eg, `push` returns the new length of the array, so `myArray = []; myArray.push(1,2,3);`
     * will provide an `extraParameters[0]` value of `3`.
     * ---
     * @param {string} type The name of the method used on the array, as a string. Eg, `"push"` for {@linkcode Array.prototype.push array.push()}. See {@linkcode onChange} description for a comprehensive list. 
     * @param {T[]} updatedArray The array object itself that was modified 
     * @param {T[]} previousArray A {@linkcode Array.prototype.clone clone} of the original array, before modification. **NOT** a deep clone - it's a new array, with intact original references.
     * @param {T} returnValue The value returned by the modified method. Eg, for `type = "pop"`, returns the array's now-removed last element, as per {@linkcode Array.prototype.pop array.pop()}.
     * @param {...T} [parameters=undefined] All parameter values supplied to the array in the invoked method. See {@linkcode onChange} description for a comprehensive list. 
     * @template T
     */
    arrayChanged(type, updatedArray, previousArray, returnValue, ...parameters) {
        if (updatedArray.suppressOnChange == true) { return; }
        if (updatedArray.hasOwnProperty('parent') && updatedArray['parent'] instanceof svgElement) {
            if (updatedArray['parent'].suppressOnChange) { return; }
            parameters.unshift(returnValue);
            let name = updatedArray.name == null ? `array#${type}` : `${updatedArray.name}#${type}`;
            updatedArray['parent'].changed?.(name, updatedArray, previousArray, ...parameters);
        }
    };

    /**
     * ***Do not use.*** 
     * 
     * Used internally to invoke a change in this {@link svgElement},
     * including changes bubbled up from subclasses.
     * @param {string} valueChanged The name of the value that was changed 
     * @param {any} newValue The newly assigned value 
     * @param {any} previousValue The old value, for reference  
     * @param {svgElement} [changedElement = undefined] The {@link svgElement} that was changed. If `undefined` (the default value), sends `this` (the {@link svgElement} itself)
     * @param {...any} [extraParameters] Any additional parameters passed into the onChange callback 
     * @returns {void}
     * @type {svg.onChange}
     * @private 
     */
    _invokeChange(valueChanged, newValue, previousValue, changedElement = undefined, ...extraParameters) {
        if (changedElement == null) { changedElement = this; }
        if (this.bubbleOnChange) {
            this.parent?._invokeChange(valueChanged, newValue, previousValue, changedElement, ...extraParameters);
        }
        if (this.onChangeCallbacks == null) { this.onChangeCallbacks = []; return; }
        for (let i = 0; i < this.onChangeCallbacks.length; i++) {
            if (typeof this.onChangeCallbacks[i] !== 'function') { continue; }
            // using call instead of just invoking to preserve `this` 
            if (!isBlank(this._prefixOnChange)) {
                if (!IsStringNameSafe(this._prefixOnChange, false, false)) {
                    console.warn(`WARNING: can't assign non-name-safe prefix ${this._prefixOnChange} to onChange valueChanged ${valueChanged}`, this);
                } else {
                    valueChanged = `${this._prefixOnChange}#${valueChanged}`;
                }
            }
            this.onChangeCallbacks[i]?.call(this,
                valueChanged,
                newValue,
                previousValue,
                changedElement,
                ...extraParameters);
        }
    }

    /**
     * Used internally to prevent multiple {@linkcode onChange} calls 
     * when modifying one property that itself modifies multiple times.
     * 
     * Eg, modifying {@link svg.gradient.angle svgGradient.angle} also 
     * modifies that gradient's {@link svg.gradient.x1 x1}, 
     * {@link svg.gradient.y1 y1}, {@link svg.gradient.x2 x2}, and 
     * {@link svg.gradient.y2 y2} properties. However, {@link onChange}
     * should only be invoked once, as only {@link svg.gradient.angle angle}
     * was modified.
     * - **Note:** Modifying this does NOT trigger `onChange` callback.
     * @type {boolean}
     */
    suppressOnChange = false;

    /** 
     * Used internally to prefix the `valueChanged` param
     * on any {@linkcode onChange} calls, followed by a `#`.
     * 
     * Eg, if `valueChanged` is `"color"` and `_prefixOnChange`
     * is `"myCoolPrefix"`, the `valueChanged` string passed
     * thru `onChange` will be `"myCoolPrefix#color"`. 
     * - **Note:** Must be name-safe, alphanumeric or underscore only.
     * - **Note:** Modifying this does NOT trigger `onChange` callback.
     * @type {string} */
    _prefixOnChange = null;

    /** 
     * get the HTML output of this element. 
     * 
     * **Note:** returns `""` on {@linkcode svgElement} - used only on subclasses, eg {@linkcode svgHTMLAsset}. */
    get html() { return ''; }
    /** 
     * get the data output of this element, typically to be collected into {@linkcode html}. 
     * 
     * **Note:** returns `""` on {@linkcode svgElement} - used only on subclasses, eg {@linkcode svgHTMLAsset}. */
    get data() { return ''; }

    /** Parse array of SVG data into HTML-attribute-style `name="value"` format, 
     * with spaces between attributes as needed. 
     * @param {([string, any?])[]|[string, any?]} data 2D array of properties, `[name,value]` (can also be a single property)
     * @returns {string} data formatted like `first="1" second="2" third="3"`
     * @example 
     * let myVar = 1;
     * let myVarName = 'first';
     * let array = [[myVarName,myVar], ['two',null], ['third',3], ['blank',''], [null,'null']];
     * let myData = ParseData(array);
     * console.log(myData); // Outputs string: first="1" third="3" blank="" */
    ParseData(data) {
        let d = isBlank(this.id) ? [] : [this.#ParseDatum('id', this.id)];
        // ensure a single data value is properly converted to array 
        if (data.length == 0) { return d.length == 0 ? '' : d[0]; }
        if ((data.length == 1 || data.length == 2) && !Array.isArray(data[0])) {
            if (data[0] == null && !Array.isArray(data[1])) { return d.length == 0 ? '' : d[0]; }
            if (typeof data[0] === 'string') {
                if (isBlank(data[0])) { return d.length == 0 ? '' : d[0]; }
                data = [data.length == 2 ? [data[0], data[1]] : [data[0]]];
            }
        }
        // iterate thru data contents 
        data.forEach(datum => {
            let out = this.#ParseDatum(datum[0], datum[1]);
            if (!isBlank(out)) { d.push(out); }
        });
        return d.join(' ');
    }

    /** Parse individual property data for use as an SVG attribute. Returns `''` if invalid.
     * 
     * **Note:** If `value` is an `object`, it will be parsed using `JSON.strngify` 
     * @param {string} name name of property. Can't be null or blank or whitespace
     * @param {any} value value of property. Can't be null, but CAN be blank or whitespace
     * @returns {string} datum formatted like `myName="myValue"`, or `''` if name is empty/null or value is null
     * @example
     * console.log(#ParseDatum('myNumber', 123));  // Output: 'myNumber="123"'
     * console.log(#ParseDatum('isBlank', ''));    // Output: 'isBlank=""'
     * console.log(#ParseDatum('isNull', null));   // Output: 'isNull=""'
     * console.log(#ParseDatum(null, 'nullName')); // Output: ''
     * */
    #ParseDatum(name, value) {
        return `${value == null || isBlank(name) ? '' :
            `${name}=${typeof value === 'object' ? JSON.stringify(value) : `"${value}`}"`}`;
    }

    /**
     * add indentation (`\t`) to the give html string, 
     * if {@link svg.config.HTML_INDENT HTML_INDENT} is true
     * @param {string} html input html string 
     * @param {number} indentCount number of indentations to add 
     * @returns original string with indentation
     */
    IndentHTML(html, indentCount = 1) {
        if (!svg.config.HTML_INDENT || isBlank(html)) { return html; }
        let indent = '';
        for (let i = 0; i < indentCount; i++) { indent += '\t'; }
        html = indent + html;
        if (svg.config.HTML_NEWLINE) {
            // check if ends with newline - if so, don't indent it
            let newlineEnd = html.endsWith('\n');
            if (newlineEnd) { html = html.slice(0, -1); }
            html = html.replaceAll('\n', '\n' + indent);
            if (newlineEnd) { html += '\n'; }
        }
        return html;
    }

    /** 
     * Takes a parameter and:
     * - If it's at all numerical, returns a sequential and 
     * alternating array of its numeric and non-numeric values, or
     * - If it's non-numeric (including `null`), returns itself 
     * @param {string|number|null} value Value to parse, eg `123`, `"50%"`, `"22.5px"`, `"fit-content"`, `"calc(5px + 10%)"`, etc
     * @param {string|number|null} [defaultValue = null] Optional backup value if the input value is `null` 
     * @returns {(string|number)[]|[string]|[number]|null}
     * @example 
     * DeconstructNumericParam(123);               // [123] 
     * DeconstructNumericParam("123");             // [123] 
     * DeconstructNumericParam(null, "50%");       // [50, "%"] 
     * DeconstructNumericParam("22.5px");          // [22.5, "px"] 
     * DeconstructNumericParam("12.34.56.78");     // [12.34, ".", 56.78] 
     * DeconstructNumericParam("fit-content");     // ["fit-content"]
     * DeconstructNumericParam("calc(5px + 10%)"); // ["calc(", 5, "px + ", 10, "%)"] 
     */
    DeconstructNumericParam(value, defaultValue = null) {
        if (value == null) {
            // value is null, return the defaultValue or just null 
            if (defaultValue == null) { return null; }
            return this.DeconstructNumericParam(defaultValue, null);
        }
        // flatten single-value array, or parse to string
        if (Array.isArray(value)) {
            if (value.length == 1) {
                if (typeof value[0] == 'number') {
                    // single-element number array, just return it
                    return [value[0]];
                }
                // flatten and attempt to parse
                value = value[0];
            }
            else {
                // multi-element array, convert to string 
                value = value.toString();
                if (value.startsWith('[')) { value = value.slice(1); }
                if (value.endsWith(']')) { value = value.slice(0, -1); }
            }
        }
        // iterate through value types 
        switch (typeof value) {
            case 'number':
                // number - simply return as-is in an array
                return [value];
            case 'string':
                // string - remove non-numeric chars 
                if (isBlank(value)) { return [value]; } // return value '' in array 
                if (StringContainsNumeric(value)) {
                    // yup, string contains numbers alright 
                    if (StringOnlyNumeric(value)) {
                        // ONLY numbers, convert to number, return in array 
                        return [StringToNumber(value)];
                    }
                    // split into alternating array 
                    return StringNumericDivider(value);
                }
                // non-numeric string, return itself in array
                return [value];
            case 'boolean':
                // boolean value, don't convert it to a 0 or 1, return it as string
                return [value ? 'true' : 'false'];
            default:
                // other type - attempt to coerce to number, or return as string
                const v = Number(value);
                if (v == null || typeof v != 'number' || !Number.isFinite(v)) {
                    return [String(value)]; // invalid number output, return as string 
                }
                return [v];
        }
    } // split '100px' param into [100, 'px'] array 

    /** 
     * Reconstructs a parameter deconstructed by {@link DeconstructNumericParam}
     * @param {([string | number, any?])[]|(string|number)[]|string|number} deconstructedParam Array of a deconstructed parameter  
     * @returns {string} Parameter, reassembled into an appropriate string 
     * @example 
     * ReconstructNumericParam([123]);                           // "123"
     * ReconstructNumericParam(["fit-content"]);                 // "fit-content"
     * ReconstructNumericParam([22.5, "px"]);                    // "22.5px"
     * ReconstructNumericParam(["calc(", 5, "px + ", 10, "%)"]); // "calc(5px + 10%)"
     */
    ReconstructNumericParam(deconstructedParam) {
        if (deconstructedParam == null) { return null; }
        // check if it's a string 
        switch (typeof deconstructedParam) {
            case 'number':
                return deconstructedParam.toMax();
            case 'string':
                // check if it's a string of an array of values 
                if (deconstructedParam.indexOf(',') == -1) {
                    // slice off curly brackets if needed 
                    if (deconstructedParam.startsWith('[') &&
                        deconstructedParam.endsWith(']')) {
                        return deconstructedParam.slice(1, -1);
                    }
                    return deconstructedParam;
                }
                // convert to array, split along commas, convert num strings to nums
                /** @type {(string|number)[]} */
                let dpArray = deconstructedParam.split(',');
                for (let i = 0; i < dpArray.length; i++) {
                    if (StringNumericOnly(dpArray[i])) {
                        dpArray[i] = StringToNumber(dpArray[i]);
                    }
                }
                return this.ReconstructNumericParam(dpArray);
        }
        if (!Array.isArray(deconstructedParam)) {
            console.warn("WARNING: can't reconstruct param that is neither string nor array, returning null", deconstructedParam, this);
            return null;
        }
        // rebuild parameters (aka why just using 'join' won't cut it)
        if (deconstructedParam.length == 0) { return ''; }
        let param = '';
        for (let i = 0; i < deconstructedParam.length; i++) {
            if (deconstructedParam[i] == null) { continue; }
            let dpi = deconstructedParam[i];
            switch (typeof dpi) {
                case 'number':
                    param += dpi.toMax();
                    break;
                case 'string':
                    param += dpi;
                    break;
                default:
                    console.warn(`WARNING: reconstruction param, index ${i} is ${typeof dpi}, should be number or string, parsing to string`, deconstructedParam, this);
                    param += String(dpi);
                    break;
            }
        }
        return param;
    } // rebuild decon param [100, 'px'] back into '100px'

    /**
     * Converts a string to a local URL reference, eg `"url(#myString)"`. 
     * Attempts to convert non-string values to string and format those. 
     * If string is null or empty, returns unmodified input value, eg `""`.
     * @param {string} str String to convert
     * @see {@link stringFromURL} — Extracts a string FROM a URL reference, eg `"myString"` from `"url(#myString)"` 
     * @returns {string}
     */
    stringToURL(str) {
        if (str == null) { return null; }
        if (typeof str != 'string') { return this.stringToURL(String(str)); }
        if (isBlank(str)) { return str; }
        if (this.isURL(str)) { return str; } // already a URL 
        if (str.startsWith('#')) { str = str.slice(1); } // remove to easily reassign below 
        if (!str.startsWith('url(')) { str = `url(#${str}`; } // url(#myString
        if (!str.endsWith(')')) { str = `${str})`; } // url(#myString)
        return str;
    }
    /**
     * Extract inner string from URL-formatted string, eg `"myString"` from `"url(#myString)"` 
     * @param {string} str String to process. If string is not URL formatted (or value is not a string), returns `str` unmodified 
     * @see {@link stringToURL} — Converts a string INTO a URL
     * @see {@link isURL} — Checks if input string is URL formatted or not 
     * @returns {string} 
     */
    stringFromURL(str) {
        if (!this.isURL(str, false, false)) { return str; }
        str = str.trim(); // "url(#myString)" 
        if (str.toLowerCase().startsWith('url')) {
            str = str.slice(3); // "(#myString)" 
            if (str.startsWith('(')) {
                str = str.slice(1); // "#myString)" 
                if (str.startsWith('#')) {
                    str = str.slice(1); // "myString)" 
                }
                if (str.endsWith(')')) {
                    str = str.slice(0, -1); // "myString" 
                }
            }
        }
        return str;
    }
    /** Checks if a given string is formatted as a local URL reference, eg `"url(#myString)"`
     * @param {string} str String to check 
     * @param {boolean} [checkEnd=true] Check end of string for `)`? Default `true
     * @param {boolean} [requireHash=true] Require `#` in `url(#`? Default `true` 
     * @returns {boolean}
     */
    isURL(str, checkEnd = true, requireHash = true) {
        if (!isStringNotBlank(str)) { return false; }
        str = str.toLowerCase();
        if (checkEnd) { if (!str.endsWith(')')) { return false; } }
        return requireHash ? str.startsWith('url(#') : str.startsWith('url(');
    }

    /**
     * gets this element's {@linkcode id ID} formatted as an
     * SVG-attribute URL: `url(#id)`
     */
    get idURL() {
        if (isBlank(this.id)) {
            console.warn("WARNING: can't get id URL from blank/null ID, returning null", this);
            return null;
        }
        return this.stringToURL(this.id);
    }

    /** Gets the name of this specific class constructor, eg `svgGradient` @returns {string} */
    get className() { return this.constructor?.name; }


    /** 
     * This svgElement's parent svgElement. Can be `null`.
     * @returns {svgElement} */
    get parent() { return this._parent; }
    set parent(v) {
        if (this.parent == v) { return; }
        let prev = this._parent;
        this._parent = v;
        if (!this._firstParentAssigned) {
            this._firstParentAssigned = true;
            if (svgConfig.ONCHANGE_ON_FIRST_PARENT_ASSIGNED) {
                this.changed('parent', v, prev);
            }
        } else {
            this.changed('parent', v, prev);
        }
    }
    /** 
     * Local reference to {@linkcode svgElement.parent parent} 
     * @type {svgElement} 
     * @private */
    _parent = null;
    /** 
     * local flag for first parent assignment, 
     * preventing unnecessary onChange calls 
     * @type {boolean}
     * @private */
    _firstParentAssigned = false;

    /**
     * Get the {@linkcode svgHTMLAsset} that is the root parent of this element.
     * 
     * Returns itself if `this` is an `svgHTMLAsset`, or `null` if it doesn't have one.
     * @returns {svgHTMLAsset|null}
     */
    get rootHTMLAsset() {
        if (this instanceof svgHTMLAsset) { return this; }
        if (this.parent != null) { return this.parent.rootHTMLAsset; }
        return null;
    }

    /**
     * Get the {@linkcode svgHTMLAsset} that is the root parent of this element, 
     * including any {@linkcode svgHTMLAsset} that it ITSELF is parented to.
     * 
     * Typically, you'll just want to use {@linkcode rootHTMLAsset}, 
     * unless you're doing very fancy SVG nesting stuff. In which case, cool! 
     * 
     * Returns itself if `this` is an `svgHTMLAsset` that does not have 
     * another `svgHTMLAsset` higher up its parentage, or `null` if there
     * is no `svgHTMLAsset` anywhere above this element's hierarchy.
     * @returns {svgHTMLAsset|null}
     */
    get rootHTMLAssetDeep() {
        if (this instanceof svgHTMLAsset) {
            if (this.parent != null) {
                let deep = this.parent.rootHTMLAssetDeep;
                return deep != null ? deep : this;
            }
            return this;
        }
        if (this.parent != null) { return this.parent.rootHTMLAsset; }
        return null;
    }

    /**
     * Returns the root {@linkcode svgElement} at the top of this 
     * element's {@linkcode svgElement.parent parent} hierarchy.
     * 
     * If this element has no parent, returns itself.
     * @returns {svgElement}
     */
    get rootParent() {
        if (this.parent != null) { return this.parent.rootParent; }
        return this;
    }
}

/** unique symbol value for svgElementInstance referencing */
const __svgElementInstance = Symbol('__svgElementInstance');

// #endregion
