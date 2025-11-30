import { EnsureToNumber, GetCSSVariable, InverseLerp, isBlank, SetElementEnabled, StringNumericOnly, StringToNumber } from "../lilutils";
import * as ui from "../ui";
import { TitledComponent } from "./base";

const INITIAL_VALUE = 0;
const MIN_VALUE = 0;
const MAX_VALUE = 100;
const INCREMENT = 5;
const STEPS = 20;
const AS_PERCENTAGE = true;
const PERCENTAGE_MIN = 0;
const PERCENTAGE_MAX = 100;
const PREFIX = '';
const SUFFIX = '';
const INCREMENT_AS_STEPS = false;

const MIN_TICKMARKS = 4;
const MAX_TICKMARKS = 20;

const DISABLED_ALPHA = 0.69;
const DISABLED_GRAYSCALE = 0.69;

/**
 * Slider component with range input
 * @see https://codepen.io/nickyonge/pen/EaPWMRe
 * @see https://uiverse.io/nickyonge/evil-mole-95
 */
export class Slider extends TitledComponent {

    #input;
    #bg;
    #textIndicator;
    #tickmarksContainer;
    #tickmarks;

    /** 
     * If {@link disabled}, return `0` (`true`) or {@linkcode initialValue} (`false`)? Default `true`
     * @type {boolean} */
    disabledReturnsZero = true;

    get enabled() { return !this.disabled; }
    set enabled(v) { this.disabled = !v; }
    get disabled() { return this.#input.disabled; }
    set disabled(v) {
        // DPJS_TO_DO: make enable/disable a core part of BasicComponent
        // Issue URL: https://github.com/nickyonge/evto-web/issues/52
        this.#input.disabled = v;
        this.div.style.opacity = String(v ? DISABLED_ALPHA : 1);
        this.div.style.filter = v ? `grayscale(${DISABLED_GRAYSCALE})` : '';
        SetElementEnabled(this.div, !v);
        if (v) {
            ui.DisableContentSelection(this.div);
        } else {
            ui.AllowContentSelectionWithDefaultCursor(this.div);
        }
        this.#updateText(v);// require override if disabled 
    }

    get initialValue() { return this.#_initialValue; }
    set initialValue(v) { this.#_initialValue = v; }
    #_initialValue = INITIAL_VALUE;
    get minValue() { return this.#_minValue; }
    set minValue(v) { this.#_minValue = v; this.#recalculateIncrementAndSteps(); }
    #_minValue = MIN_VALUE;
    get maxValue() { return this.#_maxValue; }
    set maxValue(v) { this.#_maxValue = v; this.#recalculateIncrementAndSteps(); }
    #_maxValue = MAX_VALUE;

    get asPercentage() { return this.#_asPercentage; }
    set asPercentage(v) { this.#_asPercentage = v; this.#updateText(); }
    #_asPercentage = AS_PERCENTAGE;

    /** 
     * Minimum value of percentage text if {@linkcode asPercentage} is `true`. Default `0`.
     * - If {@linkcode percentageMin} is `0` and {@linkcode percentageMax} is `100`,
     * the slider value output will go from `0%` at a {@link valueNormalized normalized} 
     * value of `0`, to `100%` at a {@link valueNormalized normalized} value of `1`.
     * - If {@linkcode percentageMin} is `-50` and {@linkcode percentageMax} is `250`,
     * the slider value output will go from `-50%` at a {@link valueNormalized normalized} 
     * value of `0`, to `250%` at a {@link valueNormalized normalized} value of `1`.
     * @returns {number} */
    get percentageMin() { return this.#_percentageMin; }
    set percentageMin(v) { if (v == null || v === this.#_percentageMin) { return; } this.#_percentageMin = v; this.#updateText(); }
    /** @type {number} */
    #_percentageMin = PERCENTAGE_MIN;
    /** 
     * Maximum value of the percent output if {@linkcode asPercentage} is `true`. 
     * - If {@linkcode percentageMin} is `0` and {@linkcode percentageMax} is `100`,
     * the slider value output will go from `0%` at a {@link valueNormalized normalized} 
     * value of `0`, to `100%` at a {@link valueNormalized normalized} value of `1`.
     * - If {@linkcode percentageMin} is `-50` and {@linkcode percentageMax} is `250`,
     * the slider value output will go from `-50%` at a {@link valueNormalized normalized} 
     * value of `0`, to `250%` at a {@link valueNormalized normalized} value of `1`.
     * - Output value is rounded to the nearest integer.
     * ---
     * - **Note:** If using any {@linkcode uniqueValueOverrides}, those will still 
     * refer to the actual value in data, not the percentage value output. 
     * @returns {number} */
    get percentageMax() { return this.#_percentageMax; }
    set percentageMax(v) { if (v == null || v === this.#_percentageMax) { return; } this.#_percentageMax = v; this.#updateText(); }
    /** @type {number} */
    #_percentageMax = PERCENTAGE_MAX;

    get valuePrefix() { return this.#_valuePrefix; }
    set valuePrefix(v) { this.#_valuePrefix = v; this.#updateText(); }
    #_valuePrefix = PREFIX;
    get valueSuffix() { return this.#_valueSuffix; }
    set valueSuffix(v) { this.#_valueSuffix = v; this.#updateText(); }
    #_valueSuffix = SUFFIX;

    /** 
     * Array of `[number,string]` pairs to slider display output. 
     * 
     * If slider's current {@link value} is found as the first element in 
     * this array, use the second element as the display text.
     * 
     * **Note:** setter replaces all existing overrides. 
     * Consider using {@linkcode AddUniqueValueOverride} 
     * or {@linkcode AddUniqueValueOverrides}.
     * 
     * Use the `number` value `NaN` for disabled override. Eg
     * `[NaN,"Slider Off"]` will cause `"Slider Off"` to appear
     * if {@linkcode disabled} is `true`.
     * 
     * No values can be `null`. The `number` (value) number can
     * be `NaN`, and the `string` (override) value can be blank. 
     * @returns {Array<[number,string]>}
     */
    get uniqueValueOverrides() {
        if (this.#_uniqueValueOverrides == null) {
            this.#_uniqueValueOverrides = [];
        }
        return this.#_uniqueValueOverrides;
    }
    /** @param {Array<[number,string]>} newValues New values to assign. If `null` / empty array, {@link ClearUniqueValueOverrides clears} the {@linkcode uniqueValueOverrides} array. */
    set uniqueValueOverrides(newValues) {
        if (newValues == null || newValues.length == 0) { this.ClearUniqueValueOverrides(); return; }
        switch (newValues.length) {
            case 1:
                this.AddUniqueValueOverride(newValues[0]);
                break;
            default:
                this.AddUniqueValueOverrides(newValues);
                break;
        }
    }
    /** local property for {@linkcode uniqueValueOverrides} @type {Array<[number,string]>} */
    #_uniqueValueOverrides = [];
    /**
     * Add a `[number,string]` override to {@linkcode uniqueValueOverrides}.
     *  
     * If slider's current {@link value} is found as the first element in 
     * this array, use the second element as the display text.
     * 
     * Use the `number` value `NaN` for disabled override. Eg
     * `[NaN,"Slider Off"]` will cause `"Slider Off"` to appear
     * if {@linkcode disabled} is `true`.
     * 
     * If the value is already present in the array, its override
     * will be reassigned to whatever's given here. 
     * @param {number|[number,string]} value Either the `[number,string]` array containing the whole override, or just the `number`, with the `string` supplied in {@linkcode override}.
     * @param {string} [override] If `value` is a `number`, this will be used as the `string` text in the `[number,string]` override. If `value` is an array, this will be assigned to `value[1]`, taking priority **IF** it's non-null. Can't be `null`, can be blank.
     * @param {boolean} [autoUpdateText=true] Automatically call {@linkcode #updateText}? Default `true`
     * @returns {boolean} `true` if successfully added (or existing and successfully modified), `false` if failed
     */
    AddUniqueValueOverride(value, override, autoUpdateText = true) {
        if (value == null) { console.warn("WARNING: can't assign a UniqueValueOverride for null value (NaN is valid)", this); return false; }
        let isArray = Array.isArray(value);
        if (isArray) {
            // value is array 
            if (value[0] == null) {
                console.warn("WARNING: can't assign a UniqueValueOverride array with null [0] number value (NaN is valid)", this);
                return false;
            }
            if (override != null) {
                // override is not null, override the override in value (it makes sense i swear)
                value[1] = override;
            } else {
                // override is null, assign to unique value override value (see, totally understandable)
                override = value[1];
            }
            if (override == null) {
                // both array[1] and override param null 
                console.warn("WARNING: both the supplied array value[1] string AND override property are null, override text can't be null (blank is valid)", this);
                return false;
            }
        }
        else {
            // value is number 
            if (override == null) {
                console.warn(`WARNING: can't have a null override string (blank is valid) for uniqueValueOverride, value: ${value}`, this);
                return false;
            }
        }
        let i = this.GetUniqueValueOverrideIndex(value);
        if (i >= 0) {
            this.uniqueValueOverrides[i][1] = override;
            return true;
        }
        this.uniqueValueOverrides.push(isArray ? value : [value, override]);
        if (autoUpdateText) { this.#updateText(); }
        return true;
    }
    /**
     * Adds an array of unique value overrides
     * @param {Array<[number,string]>} valueOverrides 
     * @returns {boolean}
     */
    AddUniqueValueOverrides(valueOverrides) {
        if (valueOverrides == null) { return false; }
        let anyAdded = false;
        for (let i = 0; i < valueOverrides.length; i++) {
            if (valueOverrides[i] == null || !Array.isArray(valueOverrides[i]) || valueOverrides[i].length < 2) { continue; }
            if (this.AddUniqueValueOverride(valueOverrides[i][0], valueOverrides[i][1], false)) {
                anyAdded = true;
            }
        }
        this.#updateText();
        return anyAdded;
    }
    /**
     * Removes the given unique value override 
     * @param {number|[number,string?]} value Either the override itself, or the number it's linked to  
     * @returns {boolean} `true` if value was removed, `false` if not found / wasn't removed 
     */
    RemoveUniqueValueOverride(value) {
        let i = this.GetUniqueValueOverrideIndex(value);
        if (i >= 0) {
            return this.#_uniqueValueOverrides.splice(i, 1).length > 0;
        }
        return false;
    }
    /** Resets the {@linkcode uniqueValueOverrides} array to `[]`. @returns {void} */
    ClearUniqueValueOverrides() { this.#_uniqueValueOverrides = []; }
    /**
     * Gets the text of the unique value override 
     * associated with the current slider value. 
     * If none is assigned, returns `null`
     * @returns {string|null}
     */
    GetCurrentUniqueValueOverrideText() {
        if (this.#input == null) { return null; }
        return this.GetUniqueValueOverrideText(this.disabled ? NaN : this.#input.value);
    }
    /**
     * Gets the index within the {@linkcode uniqueValueOverrides} 
     * array of the override for the current slider value. 
     * If none is found, returns `-1`
     * @returns {number}
     */
    GetCurrentUniqueValueOverrideIndex() {
        if (this.#input == null) { return -1; }
        return this.GetUniqueValueOverrideIndex(this.disabled ? NaN : EnsureToNumber(this.#input.value));
    }
    /**
     * Gets the index within the {@linkcode uniqueValueOverrides} 
     * for the given override or its associated slider value number. 
     * Returns `-1` if the override isn't found.
     * @param {number|[number,string?]} value Either the override itself, or the number it's linked to 
     * @returns {number}
     */
    GetUniqueValueOverrideIndex(value) {
        if (value == null) return -1;
        if (Array.isArray(value)) { value = value[0]; }
        let checkNaN = Number.isNaN(value);
        for (let i = 0; i < this.uniqueValueOverrides.length; i++) {
            if (this.uniqueValueOverrides[i] == null || !Array.isArray(this.uniqueValueOverrides[i]) || this.uniqueValueOverrides[i][0] == null) { continue; }
            if (this.uniqueValueOverrides[i][0] == value) {
                return i;
            }
            if (checkNaN) {
                if (Number.isNaN(this.uniqueValueOverrides[i][0])) {
                    return i;
                }
            }
        }
        return -1;
    }
    /**
     * Gets the text of the the {@linkcode uniqueValueOverrides} 
     * for the given override or its associated slider value number. 
     * If none is assigned, returns `null`
     * @param {*} value 
     * @returns {string|null}
     */
    GetUniqueValueOverrideText(value) {
        let i = this.GetUniqueValueOverrideIndex(value);
        return i >= 0 ? this.uniqueValueOverrides[i][1] : null;
    }

    get steps() { return this.#_steps; }
    set steps(v) {
        this.#_steps = v;
        this.#recalculateIncrement();
    }
    #_steps = STEPS;

    get increment() { return this.#_increment; }
    set increment(v) {
        this.#_increment = v;
        this.#recalculateSteps();
    }
    #_increment = INCREMENT;

    #updateInput() {
        ui.AddElementAttributes(this.#input,
            ['min', 'max', 'step'],
            [String(this.minValue), String(this.maxValue), String(this.increment)]);
    }

    #recalculateIncrementAndSteps(regenerateTickmarks = true) {
        this.#recalculateIncrement(false);
        this.#recalculateSteps(false);
        if (regenerateTickmarks) { this.#generateTickMarks(); }
    }
    #recalculateIncrement(regenerateTickmarks = true) {
        this.#_increment = (this.maxValue - this.minValue) / this.steps;
        if (regenerateTickmarks) { this.#generateTickMarks(); }
    }
    #recalculateSteps(regenerateTickmarks = true) {
        this.#_steps = (this.maxValue - this.minValue) / this.increment;
        if (regenerateTickmarks) { this.#generateTickMarks(); }
    }

    #generateTickMarks(initialGeneration = false) {
        if (!initialGeneration && !this.hasBeenLoaded) {
            return;
        }
        // create tickmarks container
        if (this.#tickmarksContainer == null) {
            this.#tickmarksContainer = ui.CreateDivWithClass('stickmarks');
            this.#bg.appendChild(this.#tickmarksContainer);
        }
        // ensure tickmarks array is empty
        if (this.#tickmarks != null && this.#tickmarks.length > 0) {
            for (let i = 0; i < this.#tickmarks.length; i++) {
                this.#tickmarks[i]?.remove();
            }
        }
        this.#tickmarks = [];
        // add tickmarks 
        let steps = StringToNumber(this.steps).clamp(MIN_TICKMARKS, MAX_TICKMARKS);
        if (steps.isEven()) { steps++; }
        for (let i = 0; i < steps; i++) {
            let tickmark = ui.CreateElement('span');
            this.#tickmarks.push(tickmark);
            this.#tickmarksContainer.appendChild(tickmark);
        }
        // regen text if tickmarks are regenerated
        if (!initialGeneration) {
            this.#updateText();
        }
    }

    constructor(componentTitle, onChangeCallback, initialValue = INITIAL_VALUE,
        minValue = MIN_VALUE, maxValue = MAX_VALUE, asPercentage = AS_PERCENTAGE,
        increment = INCREMENT, incrementParamIsSteps = INCREMENT_AS_STEPS) {

        super(componentTitle);

        if (increment == 0 || !isFinite(increment)) {
            console.warn(`WARNING: increment value ${increment} is invalid, must be nonzero finite number, setting to 1`, this, increment);
            increment = 1;
        }

        ui.AddClassesToDOM(this.div, 'slider', 'container');

        initialValue = initialValue.clamp(minValue, maxValue);
        this.initialValue = initialValue;
        this.minValue = minValue;
        this.maxValue = maxValue;
        this.asPercentage = asPercentage;

        // define increment and steps 
        if (incrementParamIsSteps) {
            // increment value is steps
            this.steps = increment;
            this.increment = (maxValue - minValue) / increment;
        } else {
            // increment is increment 
            this.increment = increment;
            this.steps = (maxValue - minValue) / increment;
        }

        // create slider input 
        this.#input = ui.CreateInputWithID('range', this.uniqueComponentName, 'sinput');
        this.#updateInput(); // update (set) input attributes before initial value 
        this.value = this.initialValue; // ensure we set initial value before bg or slider-value 
        this.#bg = ui.CreateElementWithClass('span', 'sbg');
        ui.AddElementAttribute(this.#bg, 'value', this.initialValue);
        this.#bg.style.setProperty('--slider-value', this.valueAsPercentNormalized);

        // ensure input is tabbable (mobile fix)
        ui.MakeTabbable(this.#input);

        // generate text indicator
        this.#textIndicator = ui.CreateDivWithClass('stext');
        this.#updateText();
        this._titleElement.appendChild(this.#textIndicator);

        // generate tickmarks
        this.#generateTickMarks(true);

        // add callback event 
        this.#input.addEventListener('input', (event) => {
            this.#bg.style.setProperty('--slider-value', this.valueAsPercentNormalized);
            this.#updateText();
            if (onChangeCallback) {
                let target = /** @type {Element} */ (event.target);
                onChangeCallback(target.value, this);
            }
        });

        this.div.appendChild(this.#input);
        this.div.appendChild(this.#bg);

        this.addHelpIcon(componentTitle, false, false);

        // DPJS_TO_DO: slider.css vars move to vars.css
        // Issue URL: https://github.com/nickyonge/evto-web/issues/43
    }

    /** Gets the current slider value, normalized between `0` and `1` @returns {Number} */
    get valueNormalized() {
        if (this.#input == null) { return NaN; }
        let value = this.#input.value;
        let n = EnsureToNumber(value);
        if (n == null || !Number.isFinite(n)) {
            console.warn(`WARNING: couldn't parse slider value ${value} to number, can't create percentage`, this);
            return NaN;
        }
        // normalize to a value between min and max 
        let min = StringToNumber(this.minValue);
        let max = StringToNumber(this.maxValue);
        return InverseLerp(n, min, max);
    }
    /** Get the value as a percentage fixed between `0%` and `100%`. @returns {string} */
    get valueAsPercentNormalized() { return `${Math.round(this.valueNormalized * 100)}%`; }
    /** Get the value as a percentage between {@linkcode percentageMin} and {@linkcode percentageMax}. @returns {string} */
    get valueAsPercent() {
        let value = this.valueNormalized * (this.percentageMax - this.percentageMin);
        return `${Math.round(value + this.percentageMin)}%`;
    }

    /**
     * Return the slider's current value as a string, either as direct number (eg, `"50"`) or formatted (eg, `"50%"`). 
     * @param {boolean} [formatted=true] Format the value? See {@linkcode asPercentage}, {@linkcode valuePrefix}, and {@linkcode valueSuffix}
     * @returns {string}
     */
    valueAsString(formatted = true) {
        if (!this.#input) { return null; }
        let override = this.GetCurrentUniqueValueOverrideText();
        if (override != null) { return String(override); }
        if (!formatted) {
            if (this.disabled) {
                return this.disabledReturnsZero ? '0' : this.#input.value.toString();
            } else {
                return this.#input.value.toString();
            }
        }
        let value;
        if (this.disabled) {
            value = this.disabledReturnsZero ? '0' : this.initialValue;
        } else {
            value = this.#input.value;
            if (this.asPercentage) {
                value = this.valueAsPercent;
            }
        }
        return `${this.valuePrefix}${value}${this.valueSuffix}`;
    }

    #updateText(onlyIfUniqueOverrideFound = false) {
        if (this.#textIndicator == null) { return; }
        if (onlyIfUniqueOverrideFound && this.#input != null) {
            if (this.GetCurrentUniqueValueOverrideIndex() == -1) {
                return;
            }
        }
        this.#textIndicator.innerHTML = this.valueAsString();
    }

    /**
     * Gets/sets this slider's value number.
     * - Getter returns the value as a Number (for string, see {@link valueAsString})
     * - Setter can take string or number (or any type that can be parsed into a numeric value)
     *   - Setting to `null` will reset the value to {@linkcode initialValue}
     * @type {Number|string} can take a number, string, or other type that can be parsed to number
     * @returns {Number}
     */
    set value(v) {
        if (!this.#input) { return; }
        if (v == null) { v = this.initialValue; }
        switch (typeof v) {
            case 'string':
                if (isBlank(v)) {
                    v = this.initialValue;
                    break;
                }
                v = StringToNumber(v);
                break;
            case 'number':
                if (!Number.isFinite(v)) {
                    v = this.initialValue;
                    break;
                }
                v = v.clamp(this.minValue, this.maxValue);
                break;
            default:
                // other type - attempt to coerce to a number, or simply warn and return 
                const n = Number(v); // see note below 
                if (n == null || typeof n != 'number' || !Number.isFinite(n)) {
                    console.warn(`WARNING: faile/d to parse value ${v} of type "${typeof v}" to Number, can't set slider value`, this);  // see note
                    // note: changed "v" on Number(v) and the console.warn from "value" during TS refactoring. 
                    //       if it behaves weird, it's possible it was intended to be this.value - unlikely tho 
                    return;
                }
                v = n.clamp(this.minValue, this.maxValue);
                break;
        }
        this.#input.value = v;
        this.#input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    get value() {
        let v = this.valueAsString(false);
        if (!Number.isFinite(v)) { return null; }
        return StringToNumber(v);
    }
}

const halfMaxTickmarks = 100;// 1/2 max tickmarks to add for detecting middle tickmark 
export function GenerateCSS() {
    const style = document.createElement('style');
    let content = '';
    for (let i = 1; i <= 100; i++) {
        content += `.slider .stickmarks span:nth-child(${i}):nth-last-child(${i})${i == 100 ? ' {' : ','}\n`;
    }
    content += '    opacity: var(--slider-tickmark-opacity-middle);\n}\n';
    style.textContent = content;
    document.head.appendChild(style);
}
