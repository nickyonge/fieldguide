import { arePoints, EnsureToNumber, InverseLerp, isBlank, isPoint, Lerp, RotatePointsAroundPivot, StringContainsNumeric, StringNumericDivider, StringOnlyNumeric, StringToNumber, toPoint } from '../lilutils';
import * as svg from './index';
import { svgDefaults, svgElement, svgConfig } from './index';

/** Class representing an SVG defined linear or radial gradient */
export class svgGradient extends svg.definition {

    /**
     * Templates for gradient arrays 
     * @readonly
     * @enum {string[]}
     */
    static templates = {
        bw: ['black', 'white'],
        rainbow: ['red', 'orange', 'yellow', 'green', 'blue', 'purple'],
        lightrainbow: ['lightcoral', 'sandybrown', 'moccasin', 'lightgreen', 'paleturquoise', 'plum'],
        softrainbow: ['indianred', 'coral', 'khaki', 'mediumseagreen', 'cornflowerblue', 'mediumpurple'],
        trans: ['skyblue', 'white', 'pink', 'white', 'skyblue'],
    };

    /** if true, html outputs `radialGradient`; if false, `linearGradient` 
     * @see {@linkcode svg.gradient.gradientType svgGradient.gradientType} local bool-to-string conversion 
     * @see {@linkcode svgGradient.GetGradientTypeFrom} static bool-to-string conversion 
     * @return {boolean} */
    get isRadial() { return this.#_isRadial; }
    set isRadial(v) { let prev = this.#_isRadial; this.#_isRadial = v; this.changed('isRadial', v, prev); }
    /** @type {boolean} */
    #_isRadial = svg.defaults.GRADIENT_ISRADIAL;

    /** 
     * How sharp is the gradient? If 0, fully smooth. If 1, completely sharp. 
     * 
     * Clamped between `0` and `1`*.
     * 
     * **\*:** If 
     * {@linkcode svgConfig.GRADIENT_SHARPNESS_CAPPED} is `true`, max value is 
     * {@linkcode svgConfig.MINVALUE_OFFSET 1 - MINVALUE_OFFSET}, not `1`.
     * 
     * **Note:** If you wan't a visually sharp gradient, but are using a 
     * non-zero {@linkcode angle}, a sharpness of `1` will produce 
     * {@link https://en.wikipedia.org/wiki/Jaggies jaggies}. In almost all 
     * cases, it's preferable to use a max sharpness of 
     * {@linkcode svgConfig.MINVALUE_OFFSET 1 - MINVALUE_OFFSET}. This is done 
     * automatically by enabling the {@linkcode svg.config svgConfig} flag 
     * {@linkcode svg.config.GRADIENT_SHARPNESS_CAPPED GRADIENT_SHARPNESS_CAPPED}.
     * @returns {number} */
    get sharpness() { return this.#_sharpness; }
    set sharpness(v) { let prev = this.#_sharpness; this.#_sharpness = v; this.changed('sharpness', v, prev); }
    /** @type {number} */
    #_sharpness = svg.defaults.GRADIENT_SHARPNESS;

    /** If `true, mirrors the gradient's {@link svgGradientStop stops}. Default `false` @returns {boolean} */
    get mirror() { return this.#_mirror; }
    set mirror(v) { let prev = this.#_mirror; this.#_mirror = v; this.changed('mirror', v, prev); }
    /** @type {boolean} */
    #_mirror = svg.defaults.GRADIENT_MIRROR;

    /** Get/set the scale, a multiplier for the gradient offsets. 
     * Must be greater than or equal to `0`. Can't be `null` or 
     * negative. If `null`, value will be set to 
     * {@linkcode svgDefaults.GRADIENT_SCALE}. If negative, value 
     * will be clamped to `0`.
     * @returns {number} */
    get scale() { return this.#_scale; }
    set scale(v) {
        if (v == null) { v = svgDefaults.GRADIENT_SCALE; }
        if (v < 0 && !svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE) {
            console.warn(`WARNING: scale can't be negative while svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE is false, can't set scale to ${v}, clamping to 0`, this);
            v = 0;
        }
        let prev = this.#_scale; this.#_scale = v; this.changed('scale', v, prev);
    }
    /** @type {number} */
    #_scale = svg.defaults.GRADIENT_SCALE;
    /** 
     * Gets the absolute value of {@linkcode scale}. 
     * Used for ensuring scale values are positive 
     * for applying to offset values.
     * @private @returns {number} */
    get scaleAbsolute() {
        if (this.scale == null) {
            console.warn(`WARNING: scale is null, can't get absolute scale, returning default scale value ${svgDefaults.GRADIENT_SCALE}`, this);
            return svgDefaults.GRADIENT_SCALE;
        }
        return Math.abs(this.scale);
    }
    /** 
     * Is {@linkcode scale} negative? Used for temporary mirroring for negative scale values. 
     * If {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE} is `false`, this will always return `false`. 
     * @private @returns {boolean} */
    get isScaleNegative() { return svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE && this.scale != null && this.scale < 0; }
    /** 
     * What is the virtual "pivot" point of this gradient scaling? 
     * Typically `0` to `100`, relative to the overall width of the 
     * gradient, but can be any non-null value.
     * 
     * This determines "where" on the gradient scaling will scale 
     * relative to. Eg, on a smooth red-left-to-blue-right gradient, 
     * if pivot is `0`, increasing scale beyond `1` will make the 
     * red section appear to grow rightwards. If the pivot were 
     * `100`, increasing the scale would make the blue section grow
     * leftwards, as it is scaling up relative to 100% the width of 
     * the gradient - the rightmost edge. A pivot of `50` would 
     * make both red and blue edges retreat away from the middle, 
     * causing the gradient to become overall more purple. 
     * 
     * **Note:** Even if {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}
     * is `false`, this value can still be negative. 
     * @returns {number} */
    get scalePivot() { return this.#_scalePivot; }
    set scalePivot(v) { let prev = this.#_scalePivot; this.#_scalePivot = v; this.changed('scalePivot', v, prev); }
    #_scalePivot = svgDefaults.GRADIENT_SCALEPIVOT;

    /** angle, in degrees, a linear gradient should be rotated by. Does not affect radial gradients. 
     * 
     * **NOTE:** also affects xy12 properties, but only invokes {@link svg.element.onChange onChange} once, for property `angle`. 
     * @returns {number} */
    get angle() { return this.#_angle; }
    set angle(v) { let prev = this.#_angle; this.#_angle = v; this.changed('angle', v, prev); }
    /** @type {number} */
    #_angle = svg.defaults.GRADIENT_ANGLE;
    /**
     * Pivot XY {@link isPoint point} around which angle values will be rotated. 
     * 
     * Point is normalized `0` to `100`, so a value of `x:50,y:50` will 
     * @see {@link isPoint} XY point object reference
     * @see {@linkcode svg.defaults.GRADIENT_ANGLEPIVOTPOINT GRADIENT_ANGLEPIVOTPOINT}
     * @returns {{x:number, y:number}}
     */
    get anglePivotPoint() { return this.#_anglePivotPoint; }
    set anglePivotPoint(v) { let prev = this.#_anglePivotPoint; this.#_anglePivotPoint = v; this.changed('anglePivotPoint', v, prev); }
    /** @type {{x:number, y:number}} */
    #_anglePivotPoint = svg.defaults.GRADIENT_ANGLEPIVOTPOINT;

    /**
     * Gradient offset. Shifts the {@link svgGradientStop.offset offsets} 
     * of all the {@linkcode svgGradientStop} values in {@linkcode stops}.
     * 
     * Default `0`. Typically between `-100` and `100`.
     * @returns {number} */
    get offset() { return this.#_offset; }
    set offset(v) { let prev = this.#_offset; this.#_offset = v; this.changed('offset', v, prev); }
    /** @type {number} */
    #_offset = svg.defaults.GRADIENT_OFFSET;


    /** Overall opacity for this gradient. 
     * Multiplied to the opacity of each {@link svgGradientStop} in {@link stops}.
     * Should typically be between values 0-1, `null` is considered 1. 
     * 
     * **Note:** `number` only, don't use `string` percentages, eg `50%`
     * @returns {number} */
    get opacity() { return this.#_opacity; }
    set opacity(v) { let prev = this.#_opacity; this.#_opacity = v; this.changed('opacity', v, prev); }
    /** @type {number} */
    #_opacity = svg.defaults.GRADIENT_OPACITY;

    /** First X-coordinate for drawing an SVG element that requires more than one coordinate.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/x1
     * @returns {string|number} */
    get x1() { return this.#_x1; }
    set x1(v) { let prev = this.#_x1; this.#_x1 = v; this.changed('x1', v, prev); }
    /** @type {string|number} */
    #_x1 = svg.defaults.GRADIENT_X1;
    /** First Y-coordinate for drawing an SVG element that requires more than one coordinate.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/y1
     * @returns {string|number} */
    get y1() { return this.#_y1; }
    set y1(v) { let prev = this.#_y1; this.#_y1 = v; this.changed('y1', v, prev); }
    /** @type {string|number} */
    #_y1 = svg.defaults.GRADIENT_Y1;
    /** Second X-coordinate for drawing an SVG element that requires more than one coordinate.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/x2
     * @returns {string|number} */
    get x2() { return this.#_x2; }
    set x2(v) { let prev = this.#_x2; this.#_x2 = v; this.changed('x2', v, prev); }
    /** @type {string|number} */
    #_x2 = svg.defaults.GRADIENT_X2;
    /** Second Y-coordinate for drawing an SVG element that requires more than one coordinate.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/y2
     * @returns {string|number} */
    get y2() { return this.#_y2; }
    /** @returns {string|number} */
    set y2(v) { let prev = this.#_y2; this.#_y2 = v; this.changed('y2', v, prev); }
    /** @type {string|number} */
    #_y2 = svg.defaults.GRADIENT_Y2;

    /** convenience getter. returns {@linkcode x1} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_X1_SCALEDEFAULT}  */
    get #x1Default() { return this.x1 == null ? svgDefaults.GRADIENT_X1_SCALEDEFAULT : this.x1; }
    /** convenience getter. returns {@linkcode y1} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_Y1_SCALEDEFAULT}  */
    get #y1Default() { return this.y1 == null ? svgDefaults.GRADIENT_Y1_SCALEDEFAULT : this.y1; }
    /** convenience getter. returns {@linkcode x2} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_X2_SCALEDEFAULT}  */
    get #x2Default() { return this.x2 == null ? svgDefaults.GRADIENT_X2_SCALEDEFAULT : this.x2; }
    /** convenience getter. returns {@linkcode y2} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_Y2_SCALEDEFAULT}  */
    get #y2Default() { return this.y2 == null ? svgDefaults.GRADIENT_Y2_SCALEDEFAULT : this.y2; }

    /** convenience getter. returns {@linkcode fx} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_FX_SCALEDEFAULT}  */
    get #fxDefault() { return this.fx == null ? svgDefaults.GRADIENT_FX_SCALEDEFAULT : this.fx; }
    /** convenience getter. returns {@linkcode fy} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_FY_SCALEDEFAULT}  */
    get #fyDefault() { return this.fy == null ? svgDefaults.GRADIENT_FY_SCALEDEFAULT : this.fy; }
    /** convenience getter. returns {@linkcode cx} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_CX_SCALEDEFAULT}  */
    get #cxDefault() { return this.cx == null ? svgDefaults.GRADIENT_CX_SCALEDEFAULT : this.cx; }
    /** convenience getter. returns {@linkcode cy} if non-null; otherwise returns {@linkcode svgDefaults.GRADIENT_CY_SCALEDEFAULT}  */
    get #cyDefault() { return this.cy == null ? svgDefaults.GRADIENT_CY_SCALEDEFAULT : this.cy; }

    /** array for gradient stops @type {svgGradientStop[]} */
    get stops() {
        if (this.#_stops == null) { this.stops = []; }
        return this.#_stops;
    }
    set stops(v) {
        let prev = this.#_stops;
        if (v == null) {
            if (svg.config.ARRAY_SET_NULL_CREATES_EMPTY_ARRAY) {
                v = [];
            } else {
                this.#_stops = null;
                this.changed('stops', v, prev);
                return;
            }
        }
        this.#_stops = v;
        this.#_stops.name = 'stops';
        this.#_stops['parent'] = this;
        this.#_stops.onChange = this.arrayChanged;
        v.forEach(stop => { stop.parent = this; });
        this.changed('stops', v, prev);
    }
    /** @type {svgGradientStop[]} */
    #_stops;



    /** 
     * `radialGradient` only, X coord at gradient start circle @see {@linkcode isRadial}
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fx
     * @returns {string|number} */
    get fx() { return this.#_fx; }
    set fx(v) { let prev = this.#_fx; this.#_fx = v; this.changed('fx', v, prev); }
    /** @type {string|number} */
    #_fx = svg.defaults.GRADIENT_FX;
    /** 
     * `radialGradient` only, Y coord at gradient start circle @see {@linkcode isRadial}
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fx
     * @returns {string|number} */
    get fy() { return this.#_fy; }
    set fy(v) { let prev = this.#_fy; this.#_fy = v; this.changed('fy', v, prev); }
    /** @type {string|number} */
    #_fy = svg.defaults.GRADIENT_FY;
    /** 
     * `radialGradient` only, X coord at gradient end circle @see {@linkcode isRadial}
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/cx
     * @returns {string|number} */
    get cx() { return this.#_cx; }
    set cx(v) { let prev = this.#_cx; this.#_cx = v; this.changed('cx', v, prev); }
    /** @type {string|number} */
    #_cx = svg.defaults.GRADIENT_CX;
    /** 
     * `radialGradient` only, Y coord at gradient end circle @see {@linkcode isRadial}
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/cy
     * @returns {string|number} */
    get cy() { return this.#_cy; }
    /** @returns {string|number} */
    set cy(v) { let prev = this.#_cy; this.#_cy = v; this.changed('cy', v, prev); }
    /** @type {string|number} */
    #_cy = svg.defaults.GRADIENT_CY;

    /** radial-only, radius at start of the gradient @returns {number|string} */
    get fr() { return this.#_fr; }
    set fr(v) { let prev = this.#_fr; this.#_fr = v; this.changed('fr', v, prev); }
    /** @type {number|string} */
    #_fr = svg.defaults.GRADIENT_FR;
    /** radial-only, radius at end of the gradient @returns {number|string} */
    get r() { return this.#_r; }
    set r(v) { let prev = this.#_r; this.#_r = v; this.changed('r', v, prev); }
    /** @type {number|string} */
    #_r = svg.defaults.GRADIENT_R;

    /** The `gradientUnits` attribute defines the coordinate system 
     * used for attributes specified on the gradient elements. 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/gradientUnits
     * @returns {string} */
    get gradientUnits() { return this.#_gradientUnits; }
    set gradientUnits(v) { let prev = this.#_gradientUnits; this.#_gradientUnits = v; this.changed('gradientUnits', v, prev); }
    /** @type {string} */
    #_gradientUnits = svg.defaults.GRADIENT_UNITS;
    /** The `gradientTransform` attribute contains the definition 
     * of an optional additional transformation from the gradient 
     * coordinate system onto the target coordinate system 
     * (i.e., `userSpaceOnUse` or `objectBoundingBox`). 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/gradientTransform
     * @returns {string}
     * */
    get gradientTransform() { return this.#_gradientTransform; }
    set gradientTransform(v) { let prev = this.#_gradientTransform; this.#_gradientTransform = v; this.changed('gradientTransform', v, prev); }
    /** @type {string} */
    #_gradientTransform = svg.defaults.GRADIENT_TRANSFORM;
    get spreadMethod() { return this.#_spreadMethod; }
    set spreadMethod(v) { let prev = this.#_spreadMethod; this.#_spreadMethod = v; this.changed('spreadMethod', v, prev); }
    #_spreadMethod = svg.defaults.GRADIENT_SPREADMETHOD;
    get href() { return this.#_href; }
    set href(v) { let prev = this.#_href; this.#_href = v; this.changed('href', v, prev); }
    #_href = svg.defaults.GRADIENT_HREF;

    /**
     * 
     * @param {boolean|string|spreadString} [isRadialOrColors] 
     * Value that can either be a boolean to set {@linkcode svgGradient.isRadial isRadial},
     * or a string/spread params string array representing this gradient's colors. 
     * 
     * If not a boolean, any colors are also combined with the following `colors` spread param.
     * The default value of {@linkcode svgDefaults.GRADIENT_ISRADIAL} is used for 
     * {@linkcode svgGradient.isRadial isRadial}.
     * @param  {spreadString} [colors] Spread params string array of colors used for this gradient.
     * 
     * Optional. If no colors are set, {@linkcode svgDefaults.EnsureGradientDefaultColors} 
     * is called to ensure default gradient colors are used. 
     */
    constructor(isRadialOrColors, ...colors) {
        if (colors == null) { colors = []; }
        let isRadial;
        if (typeof isRadialOrColors === 'boolean') {
            isRadial = isRadialOrColors;
        } else {
            isRadial = svg.defaults.GRADIENT_ISRADIAL;
            if (isRadialOrColors != null) {
                if (typeof isRadialOrColors === 'string') {
                    colors = [isRadialOrColors, ...colors.flattenSpread()];
                } else {
                    colors = [...isRadialOrColors.flattenSpread(), ...colors.flattenSpread()];
                }
            }
        }
        super(null, svgGradient.GetGradientTypeFrom(isRadial));
        this.isRadial = isRadial;
        colors = svg.defaults.EnsureGradientDefaultColors(...colors);
        this.SetStops(...colors);
    }
    /**
     * Original {@linkcode svgGradient.constructor} that also assigns the ID, 
     * and has isRadial as a fully separate parameter
     * @param {string} [id = undefined] Unique identifier for this element (see {@linkcode svgElement.id}). If blank/omitted, sets to {@linkcode svgElement.uniqueID}. 
     * @param {boolean} [isRadial] Is this a radial or linear gradient? Can be changed later.  
     * @param  {spreadString} [colors] Spread params string array of colors used for this gradient.
     * 
     * Optional. If no colors are set, {@linkcode svgDefaults.EnsureGradientDefaultColors} 
     * is called to ensure default gradient colors are used. 
     * @returns {svgGradient}
     */
    static fullParams(id = undefined, isRadial = svg.defaults.GRADIENT_ISRADIAL, ...colors) {
        let svg = new svgGradient(isRadial, ...colors);
        svg.id = id;
        return svg;
    }

    /**
     * Scale the given numeric/representative value by 
     * this gradient's {@linkcode scale} property. Preserves 
     * non-numeric text, eg with `scale=2`, `10px` becomes `20px`.
     * 
     * For a linear gradient, multiplies the {@linkcode x1}, 
     * {@linkcode y1}, {@linkcode x2}, and {@linkcode y2} values. 
     * 
     * For a radial gradient, multiplies the {@linkcode r}
     * and {@linkcode fr} values.
     * @param {number|string} value value to scale
     * @param {number|string} [defaultValue = null] default value if scaling is unsuccessful (will also attempt to scale this value) 
     * @param {string} [handleNegative=HandleNegative.Auto] How should negative scaling be handled? If {@linkcode HandleNegative.Auto Auto} (default), defers to {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}.
     * @returns {number|string|null}
     */
    ScaleValue(value, defaultValue = null, handleNegative = HandleNegative.Auto) {
        // TODO: replace duplicate code in ScaleValue with DeconstructNumericParam and process there
        // Issue URL: https://github.com/nickyonge/evto-web/issues/50
        // no need to scale if scale is 1
        if (this.scale == 1) { return value; }
        else if (this.scale < 0 && (handleNegative == HandleNegative.ForcePrevent || (handleNegative != HandleNegative.ForceAllow && !svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE))) {
            // negative values are invalid, error 
            console.error(`ERROR: scale cannot be negative, current value is ${this.scale}, can't scale value ${value}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, returning defaultValue: ${defaultValue}`, this);
            return defaultValue;
        }
        if (value == null) {
            // value is null, return the scaled defaultValue or just null 
            if (defaultValue == null) { return null; }
            return this.ScaleValue(defaultValue, null, handleNegative);
        }
        let initialValue = value;
        let scale = this.scale;

        if (scale < 0) {
            // handle negative values 
            switch (handleNegative) {
                case HandleNegative.Absolute:
                case HandleNegative.AbsoluteScale:
                    scale = Math.abs(scale);
                    break;
                case HandleNegative.Floor:
                case HandleNegative.FloorScale:
                    scale = 0;
                    break;
            }
        }

        switch (typeof value) {
            case 'number':
                // number - simply multiply and return 
                value = this.#CalculateScale(value, scale, handleNegative, defaultValue, initialValue);
                if (typeof value === 'number') { value = value.toMax(); }
                return value;
            case 'string':
                // string - remove non-numeric chars 
                if (isBlank(value)) { return value; } // return value '' as-is
                if (StringContainsNumeric(value)) {
                    // yup, string contains numbers alright 
                    if (StringOnlyNumeric(value)) {
                        // ONLY numbers, convert to number, multiply, return
                        let sNumber = StringToNumber(value);
                        value = this.#CalculateScale(sNumber, scale, handleNegative, defaultValue, initialValue);
                        if (typeof value === 'number') { value = value.toMax(); }
                        return value;
                    }
                    // split into alternating array 
                    let a = StringNumericDivider(value);
                    value = '';
                    for (let i = 0; i < a.length; i++) {
                        if (a[i] == null) { continue; }
                        switch (typeof a[i]) {
                            case 'string':
                                value += a[i];
                                break;
                            case 'number':
                                let aNumber = /** @type {number} */ (a[i]);
                                let aScale = this.#CalculateScale(aNumber, scale, handleNegative, defaultValue, initialValue);
                                if (typeof aScale === 'number') {
                                    value += aScale.toMax();
                                } else {
                                    // not a number, some other value was returned, probably null or defaultValue, just return it 
                                    return aScale;
                                }
                                break;
                        }
                    }
                }
                // done - either string contained no numbers, or if it did, they've been scaled  
                break;
            case 'boolean':
                // boolean value, don't convert it to a 0 or 1, just return it
                return value;
            default:
                // other type - attempt to coerce to number, and return as string
                const v = Number(value);
                if (v == null || typeof v != 'number' || !Number.isFinite(v)) {
                    return value; // invalid number output 
                }
                value = this.#CalculateScale(v, scale, handleNegative, defaultValue, initialValue);
                if (typeof value === 'number') { value = value.toMax(); }
        }
        console.log("returning value: " + value);
        return value;
    }

    /**
     * Calculate the scale value, using both 
     * {@linkcode scale} and {@linkcode scalePivot}
     * @param {number} value 
     * @param {number} scale 
     * @param {string} handleNegative 
     * @param {number|string} defaultValue 
     * @param {number|string} initialValue 
     * @returns {number|string}
     */
    #CalculateScale(value, scale, handleNegative, defaultValue, initialValue) {
        let pivot = this.scalePivot;
        let diff = value - pivot;
        if (scale == 0 && svgConfig.GRADIENT_SCALE_PREVENT_ZERO) {
            scale = svgConfig.MINVALUE_OFFSET;
        }
        diff *= (scale - 1);
        value = value + diff;

        // final check to handle post-calculation negative values 
        if (typeof value === 'number' && value < 0) {
            if (handleNegative == HandleNegative.ForcePrevent || (handleNegative != HandleNegative.ForceAllow && !svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE)) {
                if (HandleNegative.ForcePrevent) {
                    // force prevented 
                    console.error(`ERROR: scale cannot be negative, post-calculation value is ${value}, orig value: ${initialValue}, local scale: ${scale}, this.scale: ${this.scale}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, negPostCalcProtocol: ${NegativeScalePostCalculationProtocol}, returning defaultValue: ${defaultValue}`, this);
                    return defaultValue;
                } else {
                    // svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE is false, defer to NegativeScalePostCalculationProtocol 
                    switch (NegativeScalePostCalculationProtocol) {
                        case 'allow':
                            // allowed! do nothing, move onto HandleNegative calc 
                            break;
                        case 'absolute':
                            return Math.abs(value);
                        case 'defaultValue':
                            return defaultValue;
                        case 'error':
                            console.error(`ERROR: scale cannot be negative, post-calculation value is ${value}, orig value: ${initialValue}, local scale: ${scale}, this.scale: ${this.scale}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, negPostCalcProtocol: ${NegativeScalePostCalculationProtocol}, returning defaultValue: ${defaultValue}`, this);
                            return defaultValue;
                        case 'null':
                            return null;
                        case 'warning':
                            console.warn(`WARNING: scale cannot be negative, post-calculation value is ${value}, orig value: ${initialValue}, local scale: ${scale}, this.scale: ${this.scale}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, negPostCalcProtocol: ${NegativeScalePostCalculationProtocol}, returning defaultValue: ${defaultValue}`, this);
                            return defaultValue;
                        case 'zero':
                            return 0;
                        case undefined:
                        case null:
                        default:
                            let errorLine1 = `invalid NegativeScalePostCalculationProtocol value ${NegativeScalePostCalculationProtocol}, error handling negative scale calc result, see next error`;
                            let errorLine2 = `scale cannot be negative, post-calculation value is ${value}, orig value: ${initialValue}, local scale: ${scale}, this.scale: ${this.scale}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, negPostCalcProtocol: ${NegativeScalePostCalculationProtocol}, returning defaultValue: ${defaultValue}`;
                            throw new Error(`ERROR: ${errorLine1}\n${errorLine2}\nthis: ${this}`);
                    }
                }
            }
            switch (handleNegative) {
                case HandleNegative.Auto:
                case HandleNegative.ForceAllow:
                    // allow, all good (if Auto, it would've been caught in the if statement above)
                    break;
                case HandleNegative.ForcePrevent:
                    console.error(`ERROR: scale cannot be negative, post-calculation value is ${value}, orig value: ${initialValue}, local scale: ${scale}, this.scale: ${this.scale}, config flag: ${svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE}, handleNegative: ${handleNegative}, returning defaultValue: ${defaultValue}`, this);
                    return defaultValue;
                case HandleNegative.Floor:
                case HandleNegative.FloorResult:
                    value = 0;
                    break;
                case HandleNegative.Absolute:
                case HandleNegative.AbsoluteResult:
                    value = Math.abs(value);
                    break;
            }
        }
        return value;
    }

    /**
     * Gets the string tag associated with this gradient's type, 
     * either `"radialGradient"` or `"linearGradient"`.
     * @see {@linkcode svgGradient.isRadial} Flag that determines the returned type 
     * @returns {string}
     */
    get gradientType() { return svgGradient.GetGradientTypeFrom(this.isRadial); }
    /**
     * Gets the string tag associated with this gradient type, 
     * either `"radialGradient"` or `"linearGradient"`
     * @param {boolean} isRadial Local `isRadial` ref. Also see {@linkcode svgGradient.prototype.isRadial svgGradient.isRadial}
     * @returns {string}
     */
    static GetGradientTypeFrom(isRadial) { return isRadial ? 'radialGradient' : 'linearGradient'; }


    get html() {
        // collect data, generate base gradient element 
        let d = this.data;
        let newGradient = `<${this.gradientType}${isBlank(d) ? '' : ` ${d}`}>`;
        if (svg.config.HTML_NEWLINE) { newGradient += '\n'; }
        // preserve all suppressOnChange states 
        let prevThisSuppress = this.suppressOnChange;
        this.suppressOnChange = true;
        // iterate through stops 
        if (this.stops != null && this.stops.length > 0) {
            let prevArraySuppress = this.stops.suppressOnChange;
            this.stops.suppressOnChange = true;
            let sharpIncrement = 0;
            // apply mirroring, reverse stops array 
            let mirror = this.mirror;
            // check for negative scale, if so, mirror again 
            if (this.scale !== 1 && svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE && this.isScaleNegative) {
                mirror = !mirror;
            }
            if (mirror) {
                this.stops = this.stops.reverse();
            }
            // apply iterated stops 
            let sharpness = EnsureToNumber(this.sharpness).clamp(0, svg.config.GRADIENT_SHARPNESS_CAPPED ?
                (1 - svgConfig.MINVALUE_OFFSET) : 1);
            for (let i = 0; i < this.stops.length; i++) {
                if (this.stops[i] == null) { continue; }
                let prevStopSuppress = this.stops[i].suppressOnChange;
                this.stops[i].suppressOnChange = true;
                // check for auto offset calculation, changing 'auto' to a linearly-assigned % based on array size 
                if (sharpness > 0) {
                    let initialOffset = this.stops[i].offset;
                    // sharp gradient - add 1 to entire length, duplicate non-edge gradients, offset the offsets 
                    let newStop = svgGradientStop.Clone(this.stops[i]);

                    let currentOffset = (sharpIncrement / this.stops.length) * 100;
                    sharpIncrement++;
                    let newOffset = (sharpIncrement / this.stops.length) * 100;
                    if (sharpness < 1) {
                        let smoothOffset = (i / (this.stops.length - 1)) * 100;
                        currentOffset = Lerp(smoothOffset, currentOffset, sharpness);
                        newOffset = Lerp(smoothOffset, newOffset, sharpness);
                    }
                    this.stops[i].offset = `${currentOffset.toMax()}%`;
                    newStop.offset = `${newOffset.toMax()}%`;
                    // collect HTML, account for subsequent stops 
                    if (i > 0) {
                        this.stops[i].checkPrevStop(this.stops[i - 1]);
                    }
                    this.stops[i].checkNextStop(newStop);
                    let h1 = this.stops[i].html;
                    newStop.checkPrevStop(this.stops[i]);
                    if (i < this.stops.length - 1) {
                        newStop.checkNextStop(this.stops[i + 1]);
                    }
                    let h2 = newStop.html;
                    if (!isBlank(h1)) {
                        if (svg.config.HTML_INDENT) { newGradient += '\t'; }
                        newGradient += h1;
                        if (svg.config.HTML_NEWLINE) { newGradient += '\n'; }
                    }
                    if (!isBlank(h2)) {
                        if (svg.config.HTML_INDENT) { newGradient += '\t'; }
                        newGradient += h2;
                        if (svg.config.HTML_NEWLINE) { newGradient += '\n'; }
                    }
                    this.stops[i].offset = initialOffset;
                } else {
                    // non-sharp gradient
                    let autoOffset = false;
                    if (typeof this.stops[i].offset == 'string') {
                        let offset = /** @type {string} */ (this.stops[i].offset);
                        autoOffset = offset.toLowerCase().trim() == 'auto';
                    }
                    if (autoOffset) {
                        // smooth gradient 
                        let offset = (i / (this.stops.length - 1)) * 100;
                        this.stops[i].offset = `${offset.toMax()}%`;
                    }
                    // collect HTML 
                    if (i > 0) {
                        this.stops[i].checkPrevStop(this.stops[i - 1]);
                    }
                    if (i < this.stops.length - 1) {
                        this.stops[i].checkNextStop(this.stops[i + 1]);
                    }
                    let h = this.stops[i].html;
                    // ensure offset value is reset 
                    if (autoOffset) {
                        this.stops[i].offset = 'auto';
                    }
                    if (!isBlank(h)) {
                        if (svg.config.HTML_INDENT) { newGradient += '\t'; }
                        newGradient += h;
                        if (svg.config.HTML_NEWLINE) { newGradient += '\n'; }
                    }
                }
                this.stops[i].suppressOnChange = prevStopSuppress;
            }
            // undo mirroring 
            if (mirror) {
                this.stops = this.stops.reverse();
            }
            this.stops.suppressOnChange = prevArraySuppress;
        }
        this.suppressOnChange = prevThisSuppress;
        // done! return new gradient html 
        return `${newGradient}</${this.gradientType}>`;
    }

    get data() {
        // process angle (must be done before collecting data)
        const ProcessAngle = () => {
            if (this.isRadial || this.angle == 0) { return false; } // skip, not modifying the angle
            // determine if all x1/2 y1/2 coords are valid 
            let deX1 = this.DeconstructNumericParam(this.x1, svg.defaults.GRADIENT_X1_SCALEDEFAULT);
            let deY1 = this.DeconstructNumericParam(this.y1, svg.defaults.GRADIENT_Y1_SCALEDEFAULT);
            let deX2 = this.DeconstructNumericParam(this.x2, svg.defaults.GRADIENT_X2_SCALEDEFAULT);
            let deY2 = this.DeconstructNumericParam(this.y2, svg.defaults.GRADIENT_Y2_SCALEDEFAULT);
            // determine if all coordinates are the same type and non-null
            if (deX1 == null || deY1 == null || deX2 == null || deY2 == null) { return false; } // at least one param is null 
            if (deX1.length != deY1.length || deX1.length != deX2.length || deX2.length != deY2.length) { return false; }
            let numberIndices = []; // store indices of all numbers found 
            for (let i = 0; i < deX1.length; i++) {
                if (typeof deX1[i] != typeof deY1[i] || typeof deX1[i] != typeof deX2[i] || typeof deX2[i] != typeof deY2[i]) { return false; } // data type mismatch
                // all string values must match 
                switch (typeof deX1[i]) {
                    case 'string':
                        if (deX1[i] != deY1[i] || deX1[i] != deX2[i] || deX2[i] != deY2[i]) { return false; } // unit type mismatch
                        break;
                    case 'number':
                        numberIndices.push(i);
                        break;
                    default:
                        console.warn(`WARNING: non-number, non-string, type: ${typeof deX1[i]} issue with DeconstructNumericParam? ignoring`, deX1, this);
                        continue;
                }
            }
            if (numberIndices.length == 0) { return false; } // no numbers to calculate
            // NOW do calculations, so we don't calculate a bunch of numbers before finding out half are % and half are px 
            for (let i = 0; i < numberIndices.length; i++) {
                let n = numberIndices[i];
                let nx1 = /** @type {number} */ (deX1[n]);
                let ny1 = /** @type {number} */ (deY1[n]);
                let nx2 = /** @type {number} */ (deX2[n]);
                let ny2 = /** @type {number} */ (deY2[n]);
                let xy1 = toPoint(nx1, ny1);
                let xy2 = toPoint(nx2, ny2);
                // TODO:  svgGradient non-x50y50 anglePivotPoint + negative scale + rotation = buggy 
                // Issue URL: https://github.com/nickyonge/evto-web/issues/72
                // rotate around pivot
                let rotated = RotatePointsAroundPivot([xy1, xy2], this.anglePivotPoint, this.angle);
                // reassign points
                xy1 = rotated[0];
                xy2 = rotated[1];
                deX1[n] = xy1.x;
                deY1[n] = xy1.y;
                deX2[n] = xy2.x;
                deY2[n] = xy2.y;
            }
            let xyArray = [
                this.ReconstructNumericParam(deX1),
                this.ReconstructNumericParam(deY1),
                this.ReconstructNumericParam(deX2),
                this.ReconstructNumericParam(deY2)];
            this.xy12 = xyArray;
            return true;
        };

        this.suppressOnChange = true;
        let xyOrig = this.xy12;
        let useAngle = ProcessAngle();
        this.suppressOnChange = false;

        // collect data 
        let d;
        if (this.isRadial) {
            d = this.ParseData([
                // radial gradient 
                ['fx', this.ScaleValue(this.fx, svg.defaults.GRADIENT_FX_SCALEDEFAULT)],
                ['fy', this.ScaleValue(this.fy, svg.defaults.GRADIENT_FY_SCALEDEFAULT)],
                ['cx', this.ScaleValue(this.cx, svg.defaults.GRADIENT_CX_SCALEDEFAULT)],
                ['cy', this.ScaleValue(this.cy, svg.defaults.GRADIENT_CY_SCALEDEFAULT)],
                ['fr', this.ScaleValue(this.fr, svg.defaults.GRADIENT_FR_SCALEDEFAULT, HandleNegative.Floor)],
                ['r', this.ScaleValue(this.r, svg.defaults.GRADIENT_R_SCALEDEFAULT)],
                ['gradientUnits', this.gradientUnits],
                ['gradientTransform', this.gradientTransform],
                ['spreadMethod', this.spreadMethod],
                ['href', this.href]]);
        } else {
            d = this.ParseData([
                // linear gradient 
                ['x1', this.ScaleValue(this.x1, svg.defaults.GRADIENT_X1_SCALEDEFAULT)],
                ['y1', this.ScaleValue(this.y1, svg.defaults.GRADIENT_Y1_SCALEDEFAULT)],
                ['x2', this.ScaleValue(this.x2, svg.defaults.GRADIENT_X2_SCALEDEFAULT)],
                ['y2', this.ScaleValue(this.y2, svg.defaults.GRADIENT_Y2_SCALEDEFAULT)],
                ['gradientUnits', this.gradientUnits],
                ['gradientTransform', this.gradientTransform],
                ['spreadMethod', this.spreadMethod],
                ['href', this.href]]);
        }

        // undo angle 
        if (useAngle) {
            this.suppressOnChange = true;
            this.xy12 = xyOrig;
            this.suppressOnChange = false;
        }

        // done, return data 
        return d;
    }

    /**
     * get/set X1/2 and Y1/2 values (or FX/Y and CX/Y on radial gradient).
     * - Get: returns four-value array, `[x1, y1, x2, y2]` (values are either `number` or `string`) 
     * - Set: set by one of the following: 
     *   - number `[x1, y1, x2, y2]`
     *   - comma-split string `"x1,x2,y1,y2"`
     *   - XY {@link toPoint point} objects array `[{x:x1,y:y1},{x:x2,y:y2}]`
     * 
     * **NOTE:** `null` setter values are accepted 
     * @returns {[number|string,number|string,number|string,number|string]}
     */
    get xy12() { return [this.x1, this.y1, this.x2, this.y2]; }
    /** @param {*} values should be a string, array of numbers, or array of XY points */
    set xy12(values) {
        if (values == null) { this.x1 = null; this.y1 = null; this.x2 = null; this.y2 = null; }
        if (Array.isArray(values)) {
            if (values.length == 0) { this.xy12 = null; }// no values, reset all
            // check values in order
            if (values.length >= 2 && arePoints(values[0], values[1])) {
                this.xy12 = [values[0].x, values[0].y, values[1].x, values[1].y];
                return;
            }
            if (values.length < 4) { values.length = 4; }
            for (let i = 0; i < values.length; i++) {
                // direct null assignment, don't wanna screw around with undefined
                if (values[i] == null) { values[i] = null; }
                if (isPoint(values[i])) {
                    values[i + 1] = values[i].y;
                    values[i] = values[i].x;
                    i++;
                    continue;
                }
            }
            this.x1 = values[0];
            this.y1 = values[1];
            this.x2 = values[2];
            this.y2 = values[3];
        } else if (typeof values == 'string') {
            if (values.indexOf(',') >= 0) {
                this.xy12 = values.split(',');
                return;
            }
            console.warn(`WARNING: couldn't set xy12 to values: ${values}`, this);
            return;
        }
    }

    /** string output for X1/2 and Y1/2 values (or FX/Y and CX/Y on radial gradient) @returns {string} */
    get xy12String() {
        if (this.isRadial) { return this.fcxyString; }
        return `x1:${this.x1},y1:${this.y1},x2:${this.x2},y2:${this.y2}`;
    }
    /** string output for FX/Y and CX/Y values (or X1/2 and Y1/2 on linear gradient) @returns {string} */
    get fcxyString() {
        if (!this.isRadial) { return this.xy12String; }
        return `fx:${this.fx},fy:${this.fy},cx:${this.cx},cy:${this.cy}`;
    }

    /** string output for X1/2 and Y1/2 values (or FX/Y and CX/Y on radial gradient) with local default backups if `null` @returns {string} */
    get #xy12Default() {
        if (this.isRadial) { return this.#fcxyDefault; }
        return `x1:${this.#x1Default},y1:${this.#y1Default},x2:${this.#x2Default},y2:${this.#y2Default}`;
    }
    /** string output for FX/Y and CX/Y values (or X1/2 and Y1/2 on linear gradient) with local default backups if `null` @returns {string} */
    get #fcxyDefault() {
        if (!this.isRadial) { return this.#xy12Default; }
        return `fx:${this.#fxDefault},fy:${this.#fyDefault},cx:${this.#cxDefault},cy:${this.#cyDefault}`;
    }

    AddStop(stop) {
        if (stop == null) { return stop; }
        let prev = this.stops;
        this.stops.push(stop);
        stop.parent = this;
        if (!this.stops.hasOwnProperty('onChange')) {
            this.changed('stops#push', this.stops, prev);
        }
        return stop;
    }
    AddNewStop(color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) {
        let prev = this.stops;
        let stop = new svgGradientStop(color, opacity, offset);
        this.stops.push(stop);
        stop.parent = this;
        if (!this.stops.hasOwnProperty('onChange')) {
            this.changed('stops#push', this.stops, prev);
        }
        return stop;
    }

    SetStops(...stops) {
        this.stops = svgGradientStop.GenerateStops(...stops);
    }
    SetStop(index, stop) {
        return this.#setStop(index, stop);
    }
    SetNewStop(index, color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) {
        let stop = this.GetStop(index);
        if (stop == null) {
            stop = new svgGradientStop(color, opacity, offset);
            return this.#setStop(index, stop);
        }
        stop.color = color;
        stop.opacity = opacity;
        stop.offset = offset;
        return stop;
    }
    #setStop(index, stop) {
        // local reference to avoid recursion errors =_=
        if (index == -1) {
            for (let i = 0; i < this.stops.length; i++) {
                this.SetStop(i, stop);
            }
            return stop;
        }
        else if (index < -1) { return stop; }
        let prev = this.stops;
        if (this.stops.length < index + 1) { this.stops.length = index + 1; }
        this.stops[index] = stop;
        stop.parent = this;
        this.changed('stops#index', this.stops, prev);
        return stop;
    }

    GetStop(index) {
        if (index < 0 || index >= this.stops.length) { return null; }
        return this.stops[index];
    }

    InsertStop(index, stop) {
        return this.#insertStop(index, stop);
    }
    InsertNewStop(index, color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) {
        let stop = new svgGradientStop(color, opacity, offset);
        return this.#insertStop(index, stop);
    }
    #insertStop(index, stop) {
        // local reference to avoid recursion errors =_=
        if (index == -1) {
            for (let i = 0; i < this.stops.length; i++) {
                this.SetStop(i, stop);
            }
            return stop;
        }
        else if (index < -1) { return stop; }
        let prev = this.stops;
        if (this.stops.length < index + 1) {
            this.stops.length = index + 1;
            this.stops[index] = stop;
            stop.parent = this;
            this.changed('stops#index', this.stops, prev);
        } else {
            this.stops.splice(index, 0, stop);
            stop.parent = this;
            if (!this.stops.hasOwnProperty('onChange')) {
                this.changed('stops#splice', this.stops, prev);
            }
        }
        return stop;
    }

    // alt spellings for convenience 
    AddColor(color) { return this.AddStop(color); }
    AddNewColor(color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) { return this.AddNewStop(color, opacity, offset); }
    SetColors(...colors) { this.SetStops(...colors); }
    SetColor(index, color) { return this.SetStop(index, color); }
    SetNewColor(index, color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) { return this.SetNewStop(index, color, opacity, offset); }
    GetColor(index) { return this.GetStop(index); }
    InsertColor(index, stop) { return this.InsertStop(index, stop); }
    InsertNewColor(index, color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) { return this.InsertNewStop(index, color, opacity, offset); }
}

/** 
 * If {@linkcode svgConfig.GRADIENT_ALLOW_NEGATIVE_SCALE} is `false` 
 * but the value calculated in {@linkcode svgGradient.ScaleValue} 
 * returns a negative output, how should that be handled? 
 * - **Note:** If using `"allow"`, the result will still be subject 
 * to the following {@linkcode HandleNegative} calculation. 
 * - **Note:** If you want to return `null`, use the string `"null"`. 
 * If this property is `null` or `undefined`, those are invalid and 
 * will throw their own error. 
 * @type {'error'|'warning'|'allow'|'defaultValue'|'zero'|'absolute'|'null'} */
const NegativeScalePostCalculationProtocol = 'zero';

/** How should negative scale be handled in {@linkcode ScaleValue}? */
const HandleNegative = Object.freeze({
    /** Auto, defer to {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE} (default) */
    Auto: 'auto',
    /** Force allow, even if {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE} is `false` */
    ForceAllow: 'forceAllow',
    /** 
     * Force prevent, even if {@linkcode svgConfig.GRADIENT_SCALE_ALLOW_NEGATIVE} is `true`.  
     * Note that this will output an error and return `null` in {@linkcode ScaleValue} if 
     * {@linkcode svgGradient.scale} is negative. However, if a value calculated by scale 
     * results in a negative output, this will STILL output an error. If you want to avoid 
     * an error output altogether, use {@linkcode HandleNegative.Floor} or 
     * {@linkcode HandleNegative.Absolute}. */
    ForcePrevent: 'forcePrevent',
    /** 
     * Prevent, instead of disallowing, clamps both negative {@linkcode svgGradient.scale} 
     * and to {@linkcode ScaleValue} calculated result to `0` */
    Floor: 'floor',
    /** Prevent, instead of disallowing, clamps negative {@linkcode svgGradient.scale} to `0` */
    FloorScale: 'floor',
    /** Prevent, instead of disallowing, clamps negative {@linkcode ScaleValue} calculated result to `0` */
    FloorResult: 'floor',
    /** 
     * Prevent, instead of disallowing, uses both absolute {@linkcode svgGradient.scale} value 
     * and returns absolute {@linkcode ScaleValue} calculated result */
    Absolute: 'absolute',
    /** Prevent, instead of disallowing, uses absolute {@linkcode svgGradient.scale} value */
    AbsoluteScale: 'absolute',
    /** Prevent, instead of disallowing, returns absolute {@linkcode ScaleValue} calculated result */
    AbsoluteResult: 'absolute',
});

// TODO: properly implement prev/next svgGradientStop checks 
// Issue URL: https://github.com/nickyonge/evto-web/issues/75
/** skip prev/next stop checks, they're a deferred WIP */
const SKIP_PREVNEXT_STOP_CHECKS = true;


class svgGradientStop extends svg.element {
    /** @returns {string} */
    get color() { return this.#_color; }
    set color(v) { let prev = this.#_color; this.#_color = v; this.changed('color', v, prev); }
    /** @type {string} */
    #_color = svg.defaults.GRADIENT_STOP_COLOR;
    /** 
     * Get/set opacity of this gradient stop. Should be between 0-1. Null = 1.
     * Multiplied with the {@link parent} gradient {@link svgGradient.opacity opacity}, if its value is assigned. 
     * 
     * **Note:** `number` only, don't use `string` percentages, eg `50%`
     * @see {@linkcode opacityInherited this.opacityInherited} for opacity value that also accounts for parent opacity.
     * @returns {number} */
    get opacity() { return this.#_opacity; }
    set opacity(v) { let prev = this.#_opacity; this.#_opacity = v; this.changed('opacity', v, prev); }
    /** @type {number} */
    #_opacity = svg.defaults.GRADIENT_STOP_OPACITY;
    /** @returns {number|string} */
    get offset() { return this.#_offset; }
    set offset(v) { let prev = this.#_offset; this.#_offset = v; this.changed('offset', v, prev); }
    /** @type {number|string} */
    #_offset = svg.defaults.GRADIENT_STOP_OFFSET;

    /**
     * Defines a color and its position to use on a gradient.
     * @param {string} color 
     * @param {number} opacity 
     * @param {number|string} offset 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/stop
     */
    constructor(color = svg.defaults.GRADIENT_STOP_COLOR, opacity = svg.defaults.GRADIENT_STOP_OPACITY, offset = svg.defaults.GRADIENT_STOP_OFFSET) {
        super();
        this.color = color;
        this.opacity = opacity;
        this.offset = offset;
    }
    get html() { return `<stop ${this.data} />`; }
    get data() {
        // calculate offset, if necessary 
        let offset = this.offset;
        if (offset != null && this.parent != null && this.parent instanceof svgGradient && this.parent.offset != null) {
            // offset is non-zero, add to this offset 
            let parentOffset = EnsureToNumber(this.parent.offset);
            let params = this.DeconstructNumericParam(this.offset);
            for (let i = 0; i < params.length; i++) {
                if (params[i] == null) { continue; }
                if (typeof params[i] === 'number') {
                    // TODO: upscale entire svgGradient to allow offsets beyond 0/100, for corners of rotated gradients 
                    // Issue URL: https://github.com/nickyonge/evto-web/issues/73
                    let value = EnsureToNumber(params[i]);
                    value = value + parentOffset;
                    params[i] = value;
                }
            }
            offset = this.ReconstructNumericParam(params);
        }
        return this.ParseData([
            ['stop-color', this.color],
            ['stop-opacity', this.opacityInherited],
            ['offset', offset]
        ]);
    }

    /**
     * Accommodates the previous stop in the array, given the 0 - 100 
     * SVG-enforced clamping of gradient stop {@linkcode offset}. 
     * 
     * Should be called immediately before calling {@linkcode html} 
     * or {@linkcode data}, because color the modification will be 
     * applied and then reset in {@linkcode data}. 
     * 
     * If this stop's {@linkcode offset} is > `100` and the prev stop's
     * is < `100`, lerp this offset's color by the delta between this
     * offset, the previous offset, and where `0` lies between. This 
     * "simulates" the gradient stop being further out than it is. 
     * 
     * **Note:** If the gradient uses non-rectangular borders or 
     * is rotated at all, the gradient color beyond the edge of 
     * the gradient will also be affected, causing the far corners 
     * of the gradient to appear closer in color to the center. 
     * @param {svgGradientStop} prevStop The previous stop in the array 
     */
    checkPrevStop(prevStop) {
        if (SKIP_PREVNEXT_STOP_CHECKS) { return; }

        // note: .offset value can be 'auto' which has to be figured out too 
        console.log("checking prev... offset: " + this.offset + ", prevOff: " + prevStop?.offset);
        if (prevStop == null) { return; }
        let offset = EnsureToNumber(this.offset);
        if (offset <= 100) { return; }
        let prevOffset = EnsureToNumber(prevStop.offset);
        if (prevOffset >= 100) { return; }
        // passed conditional checks 
        let lerp = Lerp(offset, prevOffset, InverseLerp(prevOffset, offset, 100));
        console.log("lerp: " + lerp + ", prevOffset: " + prevOffset + ", offset: " + offset);
        
        throw new Error(`Not Yet Implemented, prev gradient stop for blending`);
    }
    /**
     * Accommodates the next stop in the array, given the 0 - 100 
     * SVG-enforced clamping of gradient stop {@linkcode offset}. 
     * 
     * Should be called immediately before calling {@linkcode html} 
     * or {@linkcode data}, because color the modification will be 
     * applied and then reset in {@linkcode data}. 
     * 
     * If this stop's {@linkcode offset} is < `0` and the next stop's
     * is > `0`, lerp this offset's color by the delta between this
     * offset, the next offset, and where `0` lies between. This 
     * "simulates" the gradient stop being further out than it is.
     * 
     * **Note:** If the gradient uses non-rectangular borders or 
     * is rotated at all, the gradient color beyond the edge of 
     * the gradient will also be affected, causing the far corners 
     * of the gradient to appear closer in color to the center.
     * @param {svgGradientStop} nextStop The next stop in the array 
     */
    checkNextStop(nextStop) {
        if (SKIP_PREVNEXT_STOP_CHECKS) { return; }
        if (nextStop == null) return;

        throw new Error(`Not Yet Implemented, next gradient stop for blending`);
    }

    /**
     * Gets this stop's opacity, and also multiplies it by the 
     * {@link parent} gradient {@link svgGradient.opacity opacity},
     * as needed. 
     * 
     * Returns `null` if the opacity value is exactly 1, because
     * 1 is the implied default value. This will return `null` even if 
     * opacity value is assigned to 1, and even as a result of the parent
     * opacity calculation. (Eg, if stop opacity is 0.5 and parent 
     * opacity is 2, the result will be 1, and this will return `null`.)
     * @returns {number}
     */
    get opacityInherited() {
        function calculateInheritedOpacity(opacity, parentOpacity) {
            if (parentOpacity == null || parentOpacity == 1 ||
                (typeof parentOpacity)?.toLowerCase() !== 'number') { return opacity; }
            if (opacity == null && (typeof parentOpacity)?.toLowerCase() === 'number') { return parentOpacity; }
            return opacity * parentOpacity;
        }
        let opacity = this.opacity;
        if (this.parent != null && this.parent instanceof svgGradient) {
            opacity = calculateInheritedOpacity(opacity, this.parent.opacity);
        }
        return opacity === 1 ? null : opacity;
    }

    /**
     * Converts an array of colours (and optionally opacities and offsets) to an array of 
     * {@link svgGradientStop svgGradientStops}. If offsets aren't provided, linearly assigns
     * it based on the length of the supplied array.
     * @see {@link GenerateStop}
     * @param {spreadValue} colors 
     * Array of 1-3 values representing `[color,opacity,offset]`. Arrays and strings can
     * be intertwined, eg `[string,[string,number],string]`. Solo strings are colors.
     * Both `opacity` or `offset` are optional, and if omitted or null, are not assigned 
     * as `<stop>` attributes and instead skipped.
     * @returns {svgGradientStop[]} Array of {@link svgGradientStop} classes
     * @example gradientStops = svgGradientStop.GenerateStops('skyblue','pink','white','pink','skyblue');
     */
    static GenerateStops(...colors) {
        if (colors == null) { return []; }
        // colors = colors.flat(); // actually don't flatten, ...colors can contain strings alongside 2d arrays // // convert to proper array 
        let stops = [];
        // TODO: re-use existing stops instead of generating new ones where possible
        // Issue URL: https://github.com/nickyonge/evto-web/issues/56
        // detect and flatten nested array 
        // colors = colors.flattenSpread(); // flattenSpread might work but also might screw with array nesting, dw for now 
        let failsafe = 999;
        while (colors.length == 1 && Array.isArray(colors[0])) {
            colors = colors.flat();
            failsafe--;
            if (failsafe <= 0) { console.error("ERROR: should NOT have been able to hit this, investigate", colors, this); break; }
        }
        for (let i = 0; i < colors.length; i++) {
            if (colors[i] == null) { continue; }
            let newStop;
            if (Array.isArray(colors[i])) {
                // array
                newStop = new svgGradientStop();
                switch (colors[i].length) {
                    case 0:
                        // empty array, continue
                        continue;
                    default:
                    case 3:
                        newStop.offset = colors[i][2];
                    case 2:
                        newStop.opacity = colors[i][1];
                    case 1:
                        if (colors[i][0] == null || typeof colors[i][0] == 'string') {
                            newStop.color = colors[i][0];
                        } else {
                            console.warn(`invalid color type ${typeof colors[i][0]}, value ${colors[i][0]}, must be string or null, using default color`);
                            newStop.color = svg.defaults.GRADIENT_STOP_COLOR;
                        }
                        break;
                }
            } else if (typeof colors[i] == 'string') {
                // string only, use as color
                newStop = new svgGradientStop(colors[i]);
            } else if (colors[i] instanceof svgGradientStop) {
                // it IS a gradient stop already, just add it to the array
                newStop = colors[i];
            } else {
                // invalid type
                console.warn(`invalid type ${typeof colors[i]}, must be string/array/svgGradientStop (null is skipped), can't create svgGradientStop`);
                continue;
            }
            stops.push(newStop);
        }
        return stops;
    }

    /**
     * Creates a shallow clone of the given svgGradientStop.
     * 
     * - **Note:** Only clones {@linkcode color}, {@linkcode opacity},
     * and {@linkcode offset}, and optionally {@linkcode svgGradientStop.parent parent}. 
     * Does not clone any other properties such as ID or `onChange` callbacks. 
     * @param {svgGradientStop} stop gradient stop to clone 
     * @param {boolean} [cloneParentage=true] also clone initial stop's {@linkcode parent} value? Default `true` 
     * @param {boolean} [bubbleOnChange=false] value to set the {@linkcode bubbleOnChange} property to. Can prevent overflow errors. Default `false` 
     * @returns {svgGradientStop|null} cloned stop, or null if given stop is null
     */
    static Clone(stop, cloneParentage = true, bubbleOnChange = false) {
        if (stop == null) { return null; }
        let newStop = new svgGradientStop(stop.color, stop.opacity, stop.offset);
        newStop.bubbleOnChange = bubbleOnChange;
        if (cloneParentage) {
            newStop.parent = stop.parent;
        }
        return newStop;
    }
}
