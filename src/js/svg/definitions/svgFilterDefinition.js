import { EnsureToNumber, StringNumericOnly, StringOnlyNumeric } from "../../lilutils";
import { svgDefaults, svgElement } from "../index";
import { svgDefinition, svgXYWHDefinition } from "./index";

/**
 * Local class used to contain 
 */
class svgFilterDefBase extends svgXYWHDefinition {

    /** @typedef {null|'userSpaceOnUse '|'objectBoundingBox'} svgType_Filter_FilterUnits */
    /** @typedef {null|'userSpaceOnUse '|'objectBoundingBox'} svgType_Filter_PrimitiveUnits */
    /** @typedef {null|'auto'|'sRGB'|'linearRGB'} svgType_Filter_ColorInterpolationFilters */

    /**
     * The filterUnits attribute defines the coordinate system for the attributes 
     * {@linkcode x}, {@linkcode y}, {@linkcode width}, and {@linkcode height}.
     * - **Note:** `XYWH` values are stored in the parent {@linkcode svgXYWHDefinition} class. 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/filterUnits
     * @returns {svgType_Filter_FilterUnits} */
    get filterUnits() { return this.#_filterUnits; }
    set filterUnits(v) { if (v == this.#_filterUnits) { return; } let prev = this.#_filterUnits; this.#_filterUnits = v; this.changed('filterUnits', v, prev); }
    /** @type {svgType_Filter_FilterUnits} */
    #_filterUnits = svgDefaults.FILTER_FILTERUNITS;

    /**
     * The primitiveUnits attribute specifies the coordinate system 
     * for the various length values within the filter primitives and 
     * for the attributes that define the filter primitive subregion.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/primitiveUnits
     * @returns {svgType_Filter_PrimitiveUnits} */
    get primitiveUnits() { return this.#_primitiveUnits; }
    set primitiveUnits(v) { if (v == this.#_primitiveUnits) { return; } let prev = this.#_primitiveUnits; this.#_primitiveUnits = v; this.changed('primitiveUnits', v, prev); }
    /** @type {svgType_Filter_PrimitiveUnits} */
    #_primitiveUnits = svgDefaults.FILTER_PRIMITIVEUNITS;

    /**
     * The color-interpolation-filters attribute specifies the color 
     * space for imaging operations performed via filter effects.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/color-interpolation-filters
     * @returns {svgType_Filter_ColorInterpolationFilters} */
    get colorInterpolationFilters() { return this.#_colorInterpolationFilters; }
    set colorInterpolationFilters(v) { if (v == this.#_colorInterpolationFilters) { return; } let prev = this.#_colorInterpolationFilters; this.#_colorInterpolationFilters = v; this.changed('colorInterpolationFilters', v, prev); }
    /** @type {svgType_Filter_ColorInterpolationFilters} */
    #_colorInterpolationFilters = svgDefaults.FILTER_COLORINTERPOLATIONFILTERS;

    // not including `color-rendering` - at time of coding this, it's deprecated 
    // https://mdn2.netlify.app/en-us/docs/web/svg/attribute/color-rendering/ 
    // https://udn.realityripple.com/docs/Web/SVG/Attribute/color-rendering 

    /** Collects and returns all the data relevant to this asset, 
     * generally to be used in html to for the final output. */
    get data() {
        return [super.data,
        this.ParseData([
            ['filterUnits', this.filterUnits],
            ['primitiveUnits', this.primitiveUnits],
            ['color-interpolation-filters', this.colorInterpolationFilters],
        ])].join(' ');
    }
}

/**
 * Container for an {@linkcode svgDefinition} that's 
 * used as a `<filter>` element.
 */
export class svgFilterDefinition extends svgFilterDefBase {

    /**
     * Container for an {@linkcode svgDefinition} that's 
     * used as a `<filter>` element.
     * @param {string} [id=null] Unique identifier for this svgElement.  
     * 
     * Every svgElement must have a unique ID, but they 
     * will be automatically generated if not manually 
     * assigned in the constructor.
     */
    constructor(colorInterpolationFilters = null, id = null) {
        super(id, 'filter');
        this.colorInterpolationFilters = colorInterpolationFilters;
    }

    // not including filterRes - at time of coding this, it's deprecated 
    // https://udn.realityripple.com/docs/Web/SVG/Attribute/filterRes 
    // https://docs1.w3cub.com/svg/attribute/filterres/ 

}

/**
 * Primitive used as a base class for all SVG filter elements 
 */
class svgFilterPrimitive extends svgFilterDefBase {

    /** @typedef {string} FilterPrimitiveReference */
    /** @typedef {FilterPrimitiveReference|null} svgType_Filter_Result */

    /**
     * The `result` attribute defines the assigned name for this filter primitive. 
     * If supplied, then graphics that result from processing this filter primitive 
     * can be referenced by an {@linkcode in} attribute on a subsequent filter primitive 
     * within the same {@linkcode svgFilterDefinition} element. If no value is provided, 
     * the output will only be available for re-use as the implicit input into the next 
     * filter primitive, if it provides no value for its {@linkcode in} attribute.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/result
     * @returns {svgType_Filter_Result}
     */
    get result() { return this.#_result; }
    set result(v) { if (v == this.#_result) { return; } let prev = this.#_result; this.#_result = v; this.changed('result', v, prev); }
    /** @type {svgType_Filter_Result} */
    #_result = svgDefaults.FILTER_PRIMITIVE_RESULT;

    /**
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] Unique identifier for this svgElement. 
     * @param {`fe${string}`} [defType = null] Filter definition type. Must begin with prefix `"fe"`, eg `"feBlend"`. 
     */
    constructor(result, id = null, defType = null) {
        super(id, defType);
        this.result = result;
    }

    get data() {
        return [super.data, this.ParseData([
            ['result', this.result],
        ])].join(' ');
    }

}
/** 
 * Primitive used as a base class for all SVG filter elements 
 * that use the {@linkcode in} attribute. */
class svgFilterPrimitiveIn extends svgFilterPrimitive {

    /** @typedef {'SourceGraphic'|'SourceAlpha'|'BackgroundImage'|'BackgroundAlpha'|'FillPaint'|'StrokePaint'|FilterPrimitiveReference|null} svgType_Filter_In */

    /**
     * The `in` attribute identifies input for the given filter primitive.
     * 
     * You can only use this attribute with the following SVG elements:
     * - {@linkcode svgFilterFEBlend feBlend} 
     * - {@linkcode svgFilterFEColorMatrix feColorMatrix} 
     * - {@linkcode svgFilterFEComponentTransfer feComponentTransfer} 
     * - {@linkcode svgFilterFEComposite feComposite} 
     * - {@linkcode svgFilterFEConvolveMatrix feConvolveMatrix} 
     * - {@linkcode svgFilterFEDiffuseLighting feDiffuseLighting} 
     * - {@linkcode svgFilterFEDisplacementMap feDisplacementMap} 
     * - {@linkcode svgFilterFEDropShadow feDropShadow} 
     * - {@linkcode svgFilterFEGaussianBlur feGaussianBlur} 
     * - {@linkcode svgFilterFEMergeNode feMergeNode} 
     * - {@linkcode svgFilterFEMorphology feMorphology} 
     * - {@linkcode svgFilterFEOffset feOffset} 
     * - {@linkcode svgFilterFESpecularLighting feSpecularLighting} 
     * - {@linkcode svgFilterFETile feTile} 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/in
     * @returns {svgType_Filter_In}
     */
    get in() { return this.#_in; }
    set in(v) { if (v == this.#_in) { return; } let prev = this.#_in; this.#_in = v; this.changed('in', v, prev); }
    /** @type {svgType_Filter_In} */
    #_in = svgDefaults.FILTER_PRIMITIVE_IN;

    /**
     * @param {svgType_Filter_In} [input = null]
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] Unique identifier for this svgElement. 
     * @param {`fe${string}`} [defType = null] Filter definition type. Must begin with prefix `"fe"`, eg `"feBlend"`. 
     */
    constructor(input = null, result = null, id = null, defType = null) {
        super(result, id, defType);
        this.in = input;
    }

    get data() {
        return [super.data, this.ParseData([
            ['in', this.in],
        ])].join(' ');
    }
}
/** Primitive used as a base class for all SVG filter elements that use the {@linkcode in} and {@linkcode in2} attributes. */
class svgFilterPrimitiveIn2 extends svgFilterPrimitiveIn {

    /** @typedef {'SourceGraphic'|'SourceAlpha'|'BackgroundImage'|'BackgroundAlpha'|'FillPaint'|'StrokePaint'|FilterPrimitiveReference|null} svgType_Filter_In2 */

    /**
     * The `in2` attribute identifies the second input for the given filter primitive. 
     * It works exactly like the {@linkcode in} attribute.
     * 
     * You can only use this attribute with the following SVG elements:
     * - {@linkcode svgFilterFEBlend feBlend} 
     * - {@linkcode svgFilterFEComposite feComposite} 
     * - {@linkcode svgFilterFEDisplacementMap feDisplacementMap} 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/in2
     * @returns {svgType_Filter_In2}
     */
    get in2() { return this.#_in2; }
    set in2(v) { if (v == this.#_in2) { return; } let prev = this.#_in2; this.#_in2 = v; this.changed('in2', v, prev); }
    /** @type {svgType_Filter_In2} */
    #_in2 = svgDefaults.FILTER_PRIMITIVE_IN2;

    /**
     * @param {svgType_Filter_In} [input = null]
     * @param {svgType_Filter_In2} [in2 = null]
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] Unique identifier for this svgElement. 
     * @param {`fe${string}`} [defType = null] Filter definition type. Must begin with prefix `"fe"`, eg `"feBlend"`. 
     */
    constructor(input = null, in2 = null, result = null, id = null, defType = null) {
        super(input, result, id, defType);
        this.in2 = in2;
    }

    get data() {
        return [super.data, this.ParseData([
            ['in2', this.in2],
        ])].join(' ');
    }

}

/** The `<feBlend>` SVG filter primitive composes two objects together ruled by a certain blending mode. 
 * This is similar to what is known from image editing software when blending two layers. 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feBlend */
export class svgFilterFEBlend extends svgFilterPrimitiveIn2 {

    /** The mode attribute defines the blending mode.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/mode
     * @returns {BlendMode} */
    get mode() { return this.#_mode; }
    set mode(v) { if (v == this.#_mode) { return; } let prev = this.#_mode; this.#_mode = v; this.changed('mode', v, prev); }
    /** @type {BlendMode} */
    #_mode = svgDefaults.FILTER_PRIMITIVE_BLEND_MODE;

    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_In2} [in2 = null] 
     * @param {BlendMode} [mode = null] The mode attribute defines the blending mode.
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null]
     */
    constructor(input = null, in2 = null, mode = null, result = null, id = null) {
        super(input, in2, result, id, 'feBlend'); this.mode = mode;
    }
    get data() {
        return [super.data, this.ParseData(['mode', this.mode])].join(' ');
    }
}
/** The `<feColorMatrix>` SVG filter element changes colors based on a transformation matrix. 
 * Every pixel's color value `[R,G,B,A]` is matrix multiplied by a 5 by 5 color matrix to create new color `[R',G',B',A']`.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feColorMatrix */
export class svgFilterFEColorMatrix extends svgFilterPrimitiveIn {
    /** @typedef {'matrix'|'saturate'|'hueRotate'|'luminanceToAlpha'|null} svgType_Filter_ColorMatrix_Type */
    /** @returns {svgType_Filter_ColorMatrix_Type} */
    get type() { return this.#_type; }
    set type(v) { if (v == this.#_type) { return; } let prev = this.#_type; this.#_type = v; this.changed('type', v, prev); }
    /** @type {svgType_Filter_ColorMatrix_Type} */
    #_type;
    /** @typedef {cssNumberListOfNumbers} svgType_Filter_ColorMatrix_Values 20 numbers making a 5x4 numbers: 5 columns = x*R,x*G,x*B,x*A,x+Shift, 4 rows = RGBA channels */
    /** @returns {svgType_Filter_ColorMatrix_Values} */
    get values() { return this.#_values; }
    set values(v) { if (v == this.#_values) { return; } let prev = this.#_values; this.#_values = v; this.changed('values', v, prev); }
    /** @type {svgType_Filter_ColorMatrix_Values} */
    #_values;
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_ColorMatrix_Type} [type = null] 
     * @param {svgType_Filter_ColorMatrix_Values} [values = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, type = null, values = null, result = null, id = null) {
        super(input, result, id, 'feColorMatrix');
        this.type = type;
        this.values = values;
    }
    get data() {
        return [super.data, this.ParseData([
            ['type', this.type],
            ['values', this.values],
        ])].join(' ');
    }
}
/** The `<feComponentTransfer>` SVG filter primitive performs color-component-wise remapping of data for each pixel. 
 * It allows operations like brightness adjustment, contrast adjustment, color balance or thresholding.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComponentTransfer */
export class svgFilterFEComponentTransfer extends svgFilterPrimitiveIn {
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] Unique identifier for this svgElement. 
     * @param {`fe${string}`} [defType] Filter definition type. Must begin with prefix `"fe"`, eg `"feComponentTransfer"`. 
     */
    constructor(input = null, result = null, id = null, defType = 'feComponentTransfer') {
        super(input, result, id, defType);
    }
}
/** The `<feComposite>` SVG filter primitive performs the combination of two input images pixel-wise in image space.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feComposite */
export class svgFilterFEComposite extends svgFilterPrimitiveIn2 {
    /** @typedef {number} svgType_Filter_Composite_K k1, k2, k3, k4 */
    /** @returns {svgType_Filter_Composite_K} */
    get k1() { return this.#_k1; }
    set k1(v) { if (v == this.#_k1) { return; } let prev = this.#_k1; this.#_k1 = v; this.changed('k1', v, prev); }
    /** @type {svgType_Filter_Composite_K} */
    #_k1;
    /** @returns {svgType_Filter_Composite_K} */
    get k2() { return this.#_k2; }
    set k2(v) { if (v == this.#_k2) { return; } let prev = this.#_k2; this.#_k2 = v; this.changed('k2', v, prev); }
    /** @type {svgType_Filter_Composite_K} */
    #_k2;
    /** @returns {svgType_Filter_Composite_K} */
    get k3() { return this.#_k3; }
    set k3(v) { if (v == this.#_k3) { return; } let prev = this.#_k3; this.#_k3 = v; this.changed('k3', v, prev); }
    /** @type {svgType_Filter_Composite_K} */
    #_k3;
    /** @returns {svgType_Filter_Composite_K} */
    get k4() { return this.#_k4; }
    set k4(v) { if (v == this.#_k4) { return; } let prev = this.#_k4; this.#_k4 = v; this.changed('k4', v, prev); }
    /** @type {svgType_Filter_Composite_K} */
    #_k4;
    /** @typedef {'over'|'in'|'out'|'atop'|'xor'|'lighter'|'arithmetic'|null} svgType_Filter_Composite_Operator The compositing operation that is to be performed. Default `over` */
    /** @returns {svgType_Filter_Composite_Operator} */
    get operator() { return this.#_operator; }
    set operator(v) { if (v == this.#_operator) { return; } let prev = this.#_operator; this.#_operator = v; this.changed('operator', v, prev); }
    /** @type {svgType_Filter_Composite_Operator} */
    #_operator;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_In} [in2 = null] 
     * @param {svgType_Filter_Composite_Operator} [operator = null] 
     * @param {svgType_Filter_Composite_K} [k1 = null] 
     * @param {svgType_Filter_Composite_K} [k2 = null] 
     * @param {svgType_Filter_Composite_K} [k3 = null] 
     * @param {svgType_Filter_Composite_K} [k4 = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, in2 = null, operator = null, k1 = null, k2 = null, k3 = null, k4 = null, result = null, id = null) {
        super(input, in2, result, id, 'feComposite');
        this.operator = operator;
        this.k1 = k1;
        this.k2 = k2;
        this.k3 = k3;
        this.k4 = k4;
    }
    get data() {
        return [super.data, this.ParseData([
            ['operator', this.operator],
            ['k1', this.k1],
            ['k2', this.k2],
            ['k3', this.k3],
            ['k4', this.k4],
        ])].join(' ');
    }
}
/** The `<feConvolveMatrix>` SVG filter primitive applies a matrix convolution filter effect.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feConvolveMatrix */
export class svgFilterFEConvolveMatrix extends svgFilterPrimitiveIn {
    /** @typedef {cssIntegerOptionalInteger} svgType_Filter_ConvolveMatrix_Order Must be one or two integers greater than zero */
    /** @returns {svgType_Filter_ConvolveMatrix_Order} */
    get order() { return this.#_order; }
    set order(v) { if (v == this.#_order) { return; } let prev = this.#_order; this.#_order = v; this.changed('order', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_Order} */
    #_order;
    /** @typedef {number[]} svgType_Filter_ConvolveMatrix_KernelMatrix */
    /** @returns {svgType_Filter_ConvolveMatrix_KernelMatrix} */
    get kernelMatrix() { return this.#_kernelMatrix; }
    set kernelMatrix(v) { if (v == this.#_kernelMatrix) { return; } let prev = this.#_kernelMatrix; this.#_kernelMatrix = v; this.changed('kernelMatrix', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_KernelMatrix} */
    #_kernelMatrix;
    /** @typedef {number} svgType_Filter_ConvolveMatrix_Divisor */
    /** @returns {svgType_Filter_ConvolveMatrix_Divisor} */
    get divisor() { return this.#_divisor; }
    set divisor(v) { if (v == this.#_divisor) { return; } let prev = this.#_divisor; this.#_divisor = v; this.changed('divisor', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_Divisor} */
    #_divisor;
    /** @typedef {number} svgType_Filter_ConvolveMatrix_Bias */
    /** @returns {svgType_Filter_ConvolveMatrix_Bias} */
    get bias() { return this.#_bias; }
    set bias(v) { if (v == this.#_bias) { return; } let prev = this.#_bias; this.#_bias = v; this.changed('bias', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_Bias} */
    #_bias;
    /** @typedef {integer} svgType_Filter_ConvolveMatrix_TargetX Integer */
    /** @returns {svgType_Filter_ConvolveMatrix_TargetX} */
    get targetX() { return this.#_targetX; }
    set targetX(v) { if (v == this.#_targetX) { return; } let prev = this.#_targetX; this.#_targetX = v; this.changed('targetX', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_TargetX} */
    #_targetX;
    /** @typedef {integer} svgType_Filter_ConvolveMatrix_TargetY Integer */
    /** @returns {svgType_Filter_ConvolveMatrix_TargetY} */
    get targetY() { return this.#_targetY; }
    set targetY(v) { if (v == this.#_targetY) { return; } let prev = this.#_targetY; this.#_targetY = v; this.changed('targetY', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_TargetY} */
    #_targetY;
    /** @typedef {'duplicate'|'wrap'|'none'} svgType_Filter_ConvolveMatrix_EdgeMode */
    /** @returns {svgType_Filter_ConvolveMatrix_EdgeMode} */
    get edgeMode() { return this.#_edgeMode; }
    set edgeMode(v) { if (v == this.#_edgeMode) { return; } let prev = this.#_edgeMode; this.#_edgeMode = v; this.changed('edgeMode', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_EdgeMode} */
    #_edgeMode;
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_ConvolveMatrix_KernelUnitLength */
    /** @returns {svgType_Filter_ConvolveMatrix_KernelUnitLength} */
    get kernelUnitLength() { return this.#_kernelUnitLength; }
    set kernelUnitLength(v) { if (v == this.#_kernelUnitLength) { return; } let prev = this.#_kernelUnitLength; this.#_kernelUnitLength = v; this.changed('kernelUnitLength', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_KernelUnitLength} */
    #_kernelUnitLength;
    /** @typedef {boolean} svgType_Filter_ConvolveMatrix_PreserveAlpha */
    /** @returns {svgType_Filter_ConvolveMatrix_PreserveAlpha} */
    get preserveAlpha() { return this.#_preserveAlpha; }
    set preserveAlpha(v) { if (v == this.#_preserveAlpha) { return; } let prev = this.#_preserveAlpha; this.#_preserveAlpha = v; this.changed('preserveAlpha', v, prev); }
    /** @type {svgType_Filter_ConvolveMatrix_PreserveAlpha} */
    #_preserveAlpha;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_ConvolveMatrix_Order} [order = null] 
     * @param {svgType_Filter_ConvolveMatrix_KernelMatrix} [kernelMatrix = null] 
     * @param {svgType_Filter_ConvolveMatrix_Divisor} [divisor = null] 
     * @param {svgType_Filter_ConvolveMatrix_Bias} [bias = null] 
     * @param {svgType_Filter_ConvolveMatrix_TargetX} [targetX = null] 
     * @param {svgType_Filter_ConvolveMatrix_TargetY} [targetY = null] 
     * @param {svgType_Filter_ConvolveMatrix_EdgeMode} [edgeMode = null] 
     * @param {svgType_Filter_ConvolveMatrix_KernelUnitLength} [kernelUnitLength = null] 
     * @param {svgType_Filter_ConvolveMatrix_PreserveAlpha} [preserveAlpha = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, order = null, kernelMatrix = null, divisor = null, bias = null, targetX = null, targetY = null, edgeMode = null, kernelUnitLength = null, preserveAlpha = null, result = null, id = null) {
        super(input, result, id, 'feConvolveMatrix');
        this.order = order;
        this.kernelMatrix = kernelMatrix;
        this.divisor = divisor;
        this.bias = bias;
        this.targetX = targetX;
        this.targetY = targetY;
        this.edgeMode = edgeMode;
        this.kernelUnitLength = kernelUnitLength;
        this.preserveAlpha = preserveAlpha;
    }
    get data() {
        return [super.data, this.ParseData([
            ['order', this.order],
            ['kernelMatrix', this.kernelMatrix],
            ['divisor', this.divisor],
            ['bias', this.bias],
            ['targetX', this.targetX],
            ['targetY', this.targetY],
            ['edgeMode', this.edgeMode],
            ['kernelUnitLength', this.kernelUnitLength],
            ['preserveAlpha', this.preserveAlpha],
        ])].join(' ');
    }
}
/** The `<feDiffuseLighting>` SVG filter primitive lights an image using the alpha channel as a bump map.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDiffuseLighting */
export class svgFilterFEDiffuseLighting extends svgFilterPrimitiveIn {
    /** @typedef {number} svgType_Filter_DiffuseLighting_LightingColor lighting-color */
    /** @returns {svgType_Filter_DiffuseLighting_LightingColor} */
    get lightingColor() { return this.#_lightingColor; }
    set lightingColor(v) { if (v == this.#_lightingColor) { return; } let prev = this.#_lightingColor; this.#_lightingColor = v; this.changed('lightingColor', v, prev); }
    /** @type {svgType_Filter_DiffuseLighting_LightingColor} */
    #_lightingColor;
    /** @typedef {number} svgType_Filter_DiffuseLighting_SurfaceScale */
    /** @returns {svgType_Filter_DiffuseLighting_SurfaceScale} */
    get surfaceScale() { return this.#_surfaceScale; }
    set surfaceScale(v) { if (v == this.#_surfaceScale) { return; } let prev = this.#_surfaceScale; this.#_surfaceScale = v; this.changed('surfaceScale', v, prev); }
    /** @type {svgType_Filter_DiffuseLighting_SurfaceScale} */
    #_surfaceScale;
    /** @typedef {number} svgType_Filter_DiffuseLighting_DiffuseConstant */
    /** @returns {svgType_Filter_DiffuseLighting_DiffuseConstant} */
    get diffuseConstant() { return this.#_diffuseConstant; }
    set diffuseConstant(v) { if (v == this.#_diffuseConstant) { return; } let prev = this.#_diffuseConstant; this.#_diffuseConstant = v; this.changed('diffuseConstant', v, prev); }
    /** @type {svgType_Filter_DiffuseLighting_DiffuseConstant} */
    #_diffuseConstant;
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_DiffuseLighting_KernelUnitLength */
    /** @returns {svgType_Filter_DiffuseLighting_KernelUnitLength} */
    get kernelUnitLength() { return this.#_kernelUnitLength; }
    set kernelUnitLength(v) { if (v == this.#_kernelUnitLength) { return; } let prev = this.#_kernelUnitLength; this.#_kernelUnitLength = v; this.changed('kernelUnitLength', v, prev); }
    /** @type {svgType_Filter_DiffuseLighting_KernelUnitLength} */
    #_kernelUnitLength;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_DiffuseLighting_LightingColor} [lightingColor = null] 
     * @param {svgType_Filter_DiffuseLighting_SurfaceScale} [surfaceScale = null] 
     * @param {svgType_Filter_DiffuseLighting_DiffuseConstant} [diffuseConstant = null] 
     * @param {svgType_Filter_DiffuseLighting_KernelUnitLength} [kernelUnitLength = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, lightingColor = null, surfaceScale = null, diffuseConstant = null, kernelUnitLength = null, result = null, id = null) {
        super(input, result, id, 'feDiffuseLighting');
        this.lightingColor = lightingColor;
        this.surfaceScale = surfaceScale;
        this.diffuseConstant = diffuseConstant;
        this.kernelUnitLength = kernelUnitLength;
    }
    get data() {
        return [super.data, this.ParseData([
            ['lighting-color', this.lightingColor],
            ['surfaceScale', this.surfaceScale],
            ['diffuseConstant', this.diffuseConstant],
            ['kernelUnitLength', this.kernelUnitLength],
        ])].join(' ');
    }
}
/** The `<feDisplacementMap>` SVG filter primitive uses the pixel values from the image from {@linkcode in2} 
 * to spatially displace the image from {@linkcode in}.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDisplacementMap */
export class svgFilterFEDisplacementMap extends svgFilterPrimitiveIn2 {
    /** @typedef {number} svgType_Filter_DisplacementMap_Scale */
    /** @returns {svgType_Filter_DisplacementMap_Scale} */
    get scale() { return this.#_scale; }
    set scale(v) { if (v == this.#_scale) { return; } let prev = this.#_scale; this.#_scale = v; this.changed('scale', v, prev); }
    /** @type {svgType_Filter_DisplacementMap_Scale} */
    #_scale;
    /** @typedef {cssRGBA} svgType_Filter_DisplacementMap_XChannelSelector */
    /** @returns {svgType_Filter_DisplacementMap_XChannelSelector} */
    get xChannelSelector() { return this.#_xChannelSelector; }
    set xChannelSelector(v) { if (v == this.#_xChannelSelector) { return; } let prev = this.#_xChannelSelector; this.#_xChannelSelector = v; this.changed('xChannelSelector', v, prev); }
    /** @type {svgType_Filter_DisplacementMap_XChannelSelector} */
    #_xChannelSelector;
    /** @typedef {cssRGBA} svgType_Filter_DisplacementMap_YChannelSelector */
    /** @returns {svgType_Filter_DisplacementMap_YChannelSelector} */
    get yChannelSelector() { return this.#_yChannelSelector; }
    set yChannelSelector(v) { if (v == this.#_yChannelSelector) { return; } let prev = this.#_yChannelSelector; this.#_yChannelSelector = v; this.changed('yChannelSelector', v, prev); }
    /** @type {svgType_Filter_DisplacementMap_YChannelSelector} */
    #_yChannelSelector;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_In} [in2 = null] 
     * @param {svgType_Filter_DisplacementMap_Scale} [scale = null] 
     * @param {svgType_Filter_DisplacementMap_XChannelSelector} [xChannelSelector = null] 
     * @param {svgType_Filter_DisplacementMap_YChannelSelector} [yChannelSelector = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, in2 = null, scale = null, xChannelSelector = null, yChannelSelector = null, result = null, id = null) {
        super(input, in2, result, id, 'feDisplacementMap');
        this.scale = scale;
        this.xChannelSelector = xChannelSelector;
        this.yChannelSelector = yChannelSelector;
    }
    get data() {
        return [super.data, this.ParseData([
            ['scale', this.scale],
            ['xChannelSelector', this.xChannelSelector],
            ['yChannelSelector', this.yChannelSelector],
        ])].join(' ');
    }
}
/** The `<feDistantLight>` SVG element defines a distant light source that can be used within a lighting filter primitive: 
 * {@linkcode svgFilterFEDiffuseLighting feDiffuseLighting} or {@linkcode svgFilterFESpecularLighting feSpecularLighting}. 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDistantLight */
export class svgFilterFEDistantLight extends svgFilterPrimitive {
    /** @typedef {number} svgType_Filter_DistantLight_Azimuth */
    /** @returns {svgType_Filter_DistantLight_Azimuth} */
    get azimuth() { return this.#_azimuth; }
    set azimuth(v) { if (v == this.#_azimuth) { return; } let prev = this.#_azimuth; this.#_azimuth = v; this.changed('azimuth', v, prev); }
    /** @type {svgType_Filter_DistantLight_Azimuth} */
    #_azimuth;
    /** @typedef {number} svgType_Filter_DistantLight_Elevation */
    /** @returns {svgType_Filter_DistantLight_Elevation} */
    get elevation() { return this.#_elevation; }
    set elevation(v) { if (v == this.#_elevation) { return; } let prev = this.#_elevation; this.#_elevation = v; this.changed('elevation', v, prev); }
    /** @type {svgType_Filter_DistantLight_Elevation} */
    #_elevation;
    /** 
     * @param {svgType_Filter_DistantLight_Azimuth} [azimuth = null] 
     * @param {svgType_Filter_DistantLight_Elevation} [elevation = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(azimuth = null, elevation = null, result = null, id = null) {
        super(result, id, 'feDistantLight');
        this.azimuth = azimuth;
        this.elevation = elevation;
    }
    get data() {
        return [super.data, this.ParseData([
            ['azimuth', this.azimuth],
            ['elevation', this.elevation],
        ])].join(' ');
    }
}
/** The `<feDropShadow>` SVG filter primitive creates a drop shadow of the input image.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feDropShadow */
export class svgFilterFEDropShadow extends svgFilterPrimitiveIn {
    /** @typedef {number} svgType_Filter_DropShadow_DX */
    /** @returns {svgType_Filter_DropShadow_DX} */
    get dx() { return this.#_dx; }
    set dx(v) { if (v == this.#_dx) { return; } let prev = this.#_dx; this.#_dx = v; this.changed('dx', v, prev); }
    /** @type {svgType_Filter_DropShadow_DX} */
    #_dx;
    /** @typedef {number} svgType_Filter_DropShadow_DY */
    /** @returns {svgType_Filter_DropShadow_DY} */
    get dy() { return this.#_dy; }
    set dy(v) { if (v == this.#_dy) { return; } let prev = this.#_dy; this.#_dy = v; this.changed('dy', v, prev); }
    /** @type {svgType_Filter_DropShadow_DY} */
    #_dy;
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_DropShadow_StdDeviation */
    /** @returns {svgType_Filter_DropShadow_StdDeviation} */
    get stdDeviation() { return this.#_stdDeviation; }
    set stdDeviation(v) { if (v == this.#_stdDeviation) { return; } let prev = this.#_stdDeviation; this.#_stdDeviation = v; this.changed('stdDeviation', v, prev); }
    /** @type {svgType_Filter_DropShadow_StdDeviation} */
    #_stdDeviation;
    /** @typedef {color} svgType_Filter_DropShadow_FloodColor flood-color, can be used on DropShadow */
    /** @returns {svgType_Filter_DropShadow_FloodColor} */
    get floodColor() { return this.#_floodColor; }
    set floodColor(v) { if (v == this.#_floodColor) { return; } let prev = this.#_floodColor; this.#_floodColor = v; this.changed('floodColor', v, prev); }
    /** @type {svgType_Filter_DropShadow_FloodColor} */
    #_floodColor;
    /** @typedef {number} svgType_Filter_DropShadow_FloodOpacity flood-opacity, can be used on DropShadow */
    /** @returns {svgType_Filter_DropShadow_FloodOpacity} */
    get floodOpacity() { return this.#_floodOpacity; }
    set floodOpacity(v) { if (v == this.#_floodOpacity) { return; } let prev = this.#_floodOpacity; this.#_floodOpacity = v; this.changed('floodOpacity', v, prev); }
    /** @type {svgType_Filter_DropShadow_FloodOpacity} */
    #_floodOpacity;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_DropShadow_DX} [dx = null] 
     * @param {svgType_Filter_DropShadow_DY} [dy = null] 
     * @param {svgType_Filter_DropShadow_StdDeviation} [stdDeviation = null] 
     * @param {svgType_Filter_DropShadow_FloodColor} [floodColor = null] 
     * @param {svgType_Filter_DropShadow_FloodOpacity} [floodOpacity = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, dx = null, dy = null, stdDeviation = null, floodColor = null, floodOpacity = null, result = null, id = null) {
        super(input, result, id, 'feDropShadow');
        this.dx = dx;
        this.dy = dy;
        this.stdDeviation = stdDeviation;
        this.floodColor = floodColor;
        this.floodOpacity = floodOpacity;
    }
    get data() {
        return [super.data, this.ParseData([
            ['dx', this.dx],
            ['dy', this.dy],
            ['stdDeviation', this.stdDeviation],
            ['flood-color', this.floodColor],
            ['flood-opacity', this.floodOpacity],
        ])].join(' ');
    }
}
/** The `<feFlood>` SVG filter primitive fills the filter subregion.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFlood */
export class svgFilterFEFlood extends svgFilterPrimitive {
    /** @typedef {color} svgType_Filter_Flood_FloodColor flood-color */
    /** @returns {svgType_Filter_Flood_FloodColor} */
    get floodColor() { return this.#_floodColor; }
    set floodColor(v) { if (v == this.#_floodColor) { return; } let prev = this.#_floodColor; this.#_floodColor = v; this.changed('floodColor', v, prev); }
    /** @type {svgType_Filter_Flood_FloodColor} */
    #_floodColor;
    /** @typedef {number} svgType_Filter_Flood_FloodOpacity flood-opacity */
    /** @returns {svgType_Filter_Flood_FloodOpacity} */
    get floodOpacity() { return this.#_floodOpacity; }
    set floodOpacity(v) { if (v == this.#_floodOpacity) { return; } let prev = this.#_floodOpacity; this.#_floodOpacity = v; this.changed('floodOpacity', v, prev); }
    /** @type {svgType_Filter_Flood_FloodOpacity} */
    #_floodOpacity;
    /** 
     * @param {svgType_Filter_Flood_FloodColor} [floodColor = null] 
     * @param {svgType_Filter_Flood_FloodOpacity} [floodOpacity = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(floodColor = null, floodOpacity = null, result = null, id = null) {
        super(result, id, 'feFlood');
        this.floodColor = floodColor;
        this.floodOpacity = floodOpacity;
    }
    get data() {
        return [super.data, this.ParseData([
            ['flood-color', this.floodColor],
            ['flood-opacity', this.floodOpacity],
        ])].join(' ');
    }
}
/**
 * Parent class for {@linkcode svgFilterFEFuncA}, {@linkcode svgFilterFEFuncB}, 
 * {@linkcode svgFilterFEFuncG}, and {@linkcode svgFilterFEFuncR}. */
class svgFilterFEFunction extends svgFilterFEComponentTransfer {
    // For static properties info, see:
    // https://developer.mozilla.org/en-US/docs/Web/API/SVGComponentTransferFunctionElement#static_properties
    /** @typedef {'identity'|'table'|'discrete'|'linear'|'gamma'} svgType_Filter_Function_Type */
    /** @returns {svgType_Filter_Function_Type} */
    get type() { return this.#_type; }
    set type(v) { if (v == this.#_type) { return; } let prev = this.#_type; this.#_type = v; this.changed('type', v, prev); }
    /** @type {svgType_Filter_Function_Type} */
    #_type;
    /** @typedef {cssNumberListOfNumbers} svgType_Filter_Function_TableValues list of numbers between `0` and `1` */
    /** @returns {svgType_Filter_Function_TableValues} */
    get tableValues() { return this.#_tableValues; }
    set tableValues(v) { if (v == this.#_tableValues) { return; } let prev = this.#_tableValues; this.#_tableValues = v; this.changed('tableValues', v, prev); }
    /** @type {svgType_Filter_Function_TableValues} */
    #_tableValues;
    /** @typedef {number} svgType_Filter_Function_Slope */
    /** @returns {svgType_Filter_Function_Slope} */
    get slope() { return this.#_slope; }
    set slope(v) { if (v == this.#_slope) { return; } let prev = this.#_slope; this.#_slope = v; this.changed('slope', v, prev); }
    /** @type {svgType_Filter_Function_Slope} */
    #_slope;
    /** @typedef {number} svgType_Filter_Function_Intercept */
    /** @returns {svgType_Filter_Function_Intercept} */
    get intercept() { return this.#_intercept; }
    set intercept(v) { if (v == this.#_intercept) { return; } let prev = this.#_intercept; this.#_intercept = v; this.changed('intercept', v, prev); }
    /** @type {svgType_Filter_Function_Intercept} */
    #_intercept;
    /** @typedef {number} svgType_Filter_Function_Amplitude */
    /** @returns {svgType_Filter_Function_Amplitude} */
    get amplitude() { return this.#_amplitude; }
    set amplitude(v) { if (v == this.#_amplitude) { return; } let prev = this.#_amplitude; this.#_amplitude = v; this.changed('amplitude', v, prev); }
    /** @type {svgType_Filter_Function_Amplitude} */
    #_amplitude;
    /** @typedef {number} svgType_Filter_Function_Exponent */
    /** @returns {svgType_Filter_Function_Exponent} */
    get exponent() { return this.#_exponent; }
    set exponent(v) { if (v == this.#_exponent) { return; } let prev = this.#_exponent; this.#_exponent = v; this.changed('exponent', v, prev); }
    /** @type {svgType_Filter_Function_Exponent} */
    #_exponent;
    /** @typedef {number} svgType_Filter_Function_Offset */
    /** @returns {svgType_Filter_Function_Offset} */
    get offset() { return this.#_offset; }
    set offset(v) { if (v == this.#_offset) { return; } let prev = this.#_offset; this.#_offset = v; this.changed('offset', v, prev); }
    /** @type {svgType_Filter_Function_Offset} */
    #_offset;
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Function_Type} [type = null] 
     * @param {svgType_Filter_Function_TableValues} [tableValues = null] 
     * @param {svgType_Filter_Function_Slope} [slope = null] 
     * @param {svgType_Filter_Function_Intercept} [intercept = null] 
     * @param {svgType_Filter_Function_Amplitude} [amplitude = null] 
     * @param {svgType_Filter_Function_Exponent} [exponent = null] 
     * @param {svgType_Filter_Function_Offset} [offset = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     * @param {`feFunc${'A'|'B'|'G'|'R'}`} defType 
     */
    constructor(input = null, type = null, tableValues = null, slope = null, intercept = null, amplitude = null, exponent = null, offset = null, result = null, id = null, defType = null) {
        super(input, result, id, defType);
        this.type = type;
        this.tableValues = tableValues;
        this.slope = slope;
        this.intercept = intercept;
        this.amplitude = amplitude;
        this.exponent = exponent;
        this.offset = offset;
    }
    get data() {
        return [super.data, this.ParseData([
            ['type', this.type],
            ['tableValues', this.tableValues],
            ['slope', this.slope],
            ['intercept', this.intercept],
            ['amplitude', this.amplitude],
            ['exponent', this.exponent],
            ['offset', this.offset],
        ])].join(' ');
    }
}
/** The `<feFuncA>` SVG filter primitive defines the transfer function for the *alpha* component of the 
 * input graphic of its parent {@linkcode svgFilterFEComponentTransfer feComponentTransfer} element.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncA */
export class svgFilterFEFuncA extends svgFilterFEFunction {
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Function_Type} [type = null] 
     * @param {svgType_Filter_Function_TableValues} [tableValues = null] 
     * @param {svgType_Filter_Function_Slope} [slope = null] 
     * @param {svgType_Filter_Function_Intercept} [intercept = null] 
     * @param {svgType_Filter_Function_Amplitude} [amplitude = null] 
     * @param {svgType_Filter_Function_Exponent} [exponent = null] 
     * @param {svgType_Filter_Function_Offset} [offset = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, type = null, tableValues = null, slope = null, intercept = null, amplitude = null, exponent = null, offset = null, result = null, id = null) {
        super(input, type, tableValues, slope, intercept, amplitude, exponent, offset, result, id, 'feFuncA');
    }
}
/** The `<feFuncA>` SVG filter primitive defines the transfer function for the *blue* component of the 
 * input graphic of its parent {@linkcode svgFilterFEComponentTransfer feComponentTransfer} element.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB */
export class svgFilterFEFuncB extends svgFilterFEFunction {
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Function_Type} [type = null] 
     * @param {svgType_Filter_Function_TableValues} [tableValues = null] 
     * @param {svgType_Filter_Function_Slope} [slope = null] 
     * @param {svgType_Filter_Function_Intercept} [intercept = null] 
     * @param {svgType_Filter_Function_Amplitude} [amplitude = null] 
     * @param {svgType_Filter_Function_Exponent} [exponent = null] 
     * @param {svgType_Filter_Function_Offset} [offset = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, type = null, tableValues = null, slope = null, intercept = null, amplitude = null, exponent = null, offset = null, result = null, id = null) {
        super(input, type, tableValues, slope, intercept, amplitude, exponent, offset, result, id, 'feFuncB');
    }
}
/** The `<feFuncA>` SVG filter primitive defines the transfer function for the *green* component of the 
 * input graphic of its parent {@linkcode svgFilterFEComponentTransfer feComponentTransfer} element.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncB */
export class svgFilterFEFuncG extends svgFilterFEFunction {
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Function_Type} [type = null] 
     * @param {svgType_Filter_Function_TableValues} [tableValues = null] 
     * @param {svgType_Filter_Function_Slope} [slope = null] 
     * @param {svgType_Filter_Function_Intercept} [intercept = null] 
     * @param {svgType_Filter_Function_Amplitude} [amplitude = null] 
     * @param {svgType_Filter_Function_Exponent} [exponent = null] 
     * @param {svgType_Filter_Function_Offset} [offset = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, type = null, tableValues = null, slope = null, intercept = null, amplitude = null, exponent = null, offset = null, result = null, id = null) {
        super(input, type, tableValues, slope, intercept, amplitude, exponent, offset, result, id, 'feFuncG');
    }
}
/** The `<feFuncA>` SVG filter primitive defines the transfer function for the *red* component of the 
 * input graphic of its parent {@linkcode svgFilterFEComponentTransfer feComponentTransfer} element.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feFuncR */
export class svgFilterFEFuncR extends svgFilterFEFunction {
    /**
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Function_Type} [type = null] 
     * @param {svgType_Filter_Function_TableValues} [tableValues = null] 
     * @param {svgType_Filter_Function_Slope} [slope = null] 
     * @param {svgType_Filter_Function_Intercept} [intercept = null] 
     * @param {svgType_Filter_Function_Amplitude} [amplitude = null] 
     * @param {svgType_Filter_Function_Exponent} [exponent = null] 
     * @param {svgType_Filter_Function_Offset} [offset = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, type = null, tableValues = null, slope = null, intercept = null, amplitude = null, exponent = null, offset = null, result = null, id = null) {
        super(input, type, tableValues, slope, intercept, amplitude, exponent, offset, result, id, 'feFuncR');
    }
}
/** The `<feGaussianBlur>` SVG filter primitive blurs the input image by the amount specified in 
 * {@linkcode stdDeviation}, which defines the bell-curve.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feGaussianBlur */
export class svgFilterFEGaussianBlur extends svgFilterPrimitiveIn {
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_GaussianBlur_StdDeviation */
    get stdDeviation() { return this.#_stdDeviation; }
    set stdDeviation(v) { if (v == this.#_stdDeviation) { return; } let prev = this.#_stdDeviation; this.#_stdDeviation = v; this.changed('stdDeviation', v, prev); }
    /** @type {svgType_Filter_GaussianBlur_StdDeviation} */
    #_stdDeviation = null;
    /** @typedef {'duplicate'|'wrap'|'none'} svgType_Filter_GaussianBlur_EdgeMode */
    /** @returns {svgType_Filter_GaussianBlur_EdgeMode} */
    get edgeMode() { return this.#_edgeMode; }
    set edgeMode(v) { if (v == this.#_edgeMode) { return; } let prev = this.#_edgeMode; this.#_edgeMode = v; this.changed('edgeMode', v, prev); }
    /** @type {svgType_Filter_GaussianBlur_EdgeMode} */
    #_edgeMode;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_GaussianBlur_StdDeviation} [stdDeviation = null] 
     * @param {svgType_Filter_GaussianBlur_EdgeMode} [edgeMode = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, stdDeviation = null, edgeMode = null, result = null, id = null) {
        super(input, result, id, 'feGaussianBlur');
        this.stdDeviation = stdDeviation;
        this.edgeMode = edgeMode;
    }
    get data() {
        return [super.data, this.ParseData([
            ['stdDeviation', this.stdDeviation],
            ['edgeMode', this.edgeMode],
        ])].join(' ');
    }
}
/** The `<feImage>` SVG filter primitive fetches image data from an external source and provides 
 * the pixel data as output (meaning if the external source is an SVG image, it is rasterized.)
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feImage */
export class svgFilterFEImage extends svgFilterPrimitive {
    /** @typedef {cssCrossorigin} svgType_Filter_Image_Crossorigin */
    /** @returns {svgType_Filter_Image_Crossorigin} */
    get crossorigin() { return this.#_crossorigin; }
    set crossorigin(v) { if (v == this.#_crossorigin) { return; } let prev = this.#_crossorigin; this.#_crossorigin = v; this.changed('crossorigin', v, prev); }
    /** @type {svgType_Filter_Image_Crossorigin} */
    #_crossorigin;
    /** @typedef {cssPreserveAspectRatio} svgType_Filter_Image_PreserveAspectRatio */
    /** @returns {svgType_Filter_Image_PreserveAspectRatio} */
    get preserveAspectRatio() { return this.#_preserveAspectRatio; }
    set preserveAspectRatio(v) { if (v == this.#_preserveAspectRatio) { return; } let prev = this.#_preserveAspectRatio; this.#_preserveAspectRatio = v; this.changed('preserveAspectRatio', v, prev); }
    /** @type {svgType_Filter_Image_PreserveAspectRatio} */
    #_preserveAspectRatio;
    /** @typedef {string} svgType_Filter_Image_Href */
    /** @returns {svgType_Filter_Image_Href} */
    get href() { return this.#_href; }
    set href(v) { if (v == this.#_href) { return; } let prev = this.#_href; this.#_href = v; this.changed('href', v, prev); }
    /** @type {svgType_Filter_Image_Href} */
    #_href;
    /** 
     * @param {svgType_Filter_Image_Href} [href = null] 
     * @param {svgType_Filter_Image_PreserveAspectRatio} [preserveAspectRatio = null] 
     * @param {svgType_Filter_Image_Crossorigin} [crossorigin = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(href = null, preserveAspectRatio = null, crossorigin = null, result = null, id = null) {
        super(result, id, 'feImage');
        this.href = href;
        this.preserveAspectRatio = preserveAspectRatio;
        this.crossorigin = crossorigin;
    }
    get data() {
        return [super.data, this.ParseData([
            ['href', this.href],
            ['preserveAspectRatio', this.preserveAspectRatio],
            ['crossorigin', this.crossorigin],
        ])].join(' ');
    }

    // not including fetchpriority - at time of coding this, it's labeled as experimental / non-standard
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/fetchpriority 

    // not including xlink:href - at time of coding this, it's deprecated 
    // https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/xlink:href 
}
/** The `<feMerge>` SVG element allows filter effects to be applied concurrently instead of sequentially.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMerge */
export class svgFilterFEMerge extends svgFilterPrimitive {
    /** @typedef {svgType_Filter_Merge_MergeNodes[]} svgType_Filter_Merge_MergeNodes */
    /** @returns {svgType_Filter_Merge_MergeNodes} */
    get mergeNodes() { return this.#_mergeNodes; }
    set mergeNodes(v) { if (v == this.#_mergeNodes) { return; } let prev = this.#_mergeNodes; this.#_mergeNodes = v; this.changed('mergeNodes', v, prev); }
    /** @type {svgType_Filter_Merge_MergeNodes} */
    #_mergeNodes;
    /** 
     * @param {svgType_Filter_Merge_MergeNodes} [mergeNodes = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(mergeNodes = null, result = null, id = null) {
        super(result, id, 'feMerge');
        this.mergeNodes = mergeNodes;
    }
    get html() {
        if (this.mergeNodes != null && this.mergeNodes.length > 0) {
            // preserve suppressOnChange states and enable 
            let prevSuppress = this.suppressOnChange;
            let prevSuppressArray = this.subDefinitions.suppressOnChange;
            this.suppressOnChange = true;
            this.subDefinitions.suppressOnChange = true;
            // clone array before adding 
            let subs = this.subDefinitions.clone();
            // add new elements to array 
            this.subDefinitions.push(...this.mergeNodes);
            // generate HTML with new elements 
            let h = super.html;
            // reset original elements 
            this.subDefinitions = subs;
            // reset suppressOnChange states 
            this.suppressOnChange = prevSuppress;
            this.subDefinitions.suppressOnChange = prevSuppressArray;
            // return html
            return h;
        }
        // no mergeNodes present, just get html 
        return super.html;
    }
}
/** 
 * The `<feMergeNode>` SVG takes the result of another filter to be processed by its parent {@linkcode svgFilterFEMerge feMerge}.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMergeNode */
export class svgFilterFEMergeNode extends svgFilterPrimitiveIn {
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, result = null, id = null) {
        super(input, result, id, 'feMergeNode');
    }
}
/** The `<feMorphology>` SVG filter primitive is used to erode or dilate the input image.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feMorphology */
export class svgFilterFEMorphology extends svgFilterPrimitiveIn {
    /** @typedef {'erode'|'dilate'|null} svgType_Filter_Morphology_Operator Defines whether to erode (i.e., thin) or dilate (fatten) the source graphic. Default `erode` */
    /** @returns {svgType_Filter_Morphology_Operator} */
    get operator() { return this.#_operator; }
    set operator(v) { if (v == this.#_operator) { return; } let prev = this.#_operator; this.#_operator = v; this.changed('operator', v, prev); }
    /** @type {svgType_Filter_Morphology_Operator} */
    #_operator;
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_Morphology_Radius */
    /** @returns {svgType_Filter_Morphology_Radius} */
    get radius() { return this.#_radius; }
    set radius(v) { if (v == this.#_radius) { return; } let prev = this.#_radius; this.#_radius = v; this.changed('radius', v, prev); }
    /** @type {svgType_Filter_Morphology_Radius} */
    #_radius;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Morphology_Operator} [operator = null] 
     * @param {svgType_Filter_Morphology_Radius} [radius = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, operator = null, radius = null, result = null, id = null) {
        super(input, result, id, 'feMorphology');
        this.operator = operator;
        this.radius = radius;
    }
    get data() {
        return [super.data, this.ParseData([
            ['operator', this.operator],
            ['radius', this.radius],
        ])].join(' ');
    }
}
/** The `<feOffset>` SVG filter primitive enables offsetting an input image relative to its current position.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feOffset */
export class svgFilterFEOffset extends svgFilterPrimitiveIn {
    /** @typedef {number} svgType_Filter_Offset_DX */
    /** @returns {svgType_Filter_Offset_DX} */
    get dx() { return this.#_dx; }
    set dx(v) { if (v == this.#_dx) { return; } let prev = this.#_dx; this.#_dx = v; this.changed('dx', v, prev); }
    /** @type {svgType_Filter_Offset_DX} */
    #_dx;
    /** @typedef {number} svgType_Filter_Offset_DY */
    /** @returns {svgType_Filter_Offset_DY} */
    get dy() { return this.#_dy; }
    set dy(v) { if (v == this.#_dy) { return; } let prev = this.#_dy; this.#_dy = v; this.changed('dy', v, prev); }
    /** @type {svgType_Filter_Offset_DY} */
    #_dy;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Offset_DX} [dx = null] 
     * @param {svgType_Filter_Offset_DY} [dy = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, dx = null, dy = null, result = null, id = null) {
        super(input, result, id, 'feOffset');
        this.dx = dx;
        this.dy = dy;
    }
    get data() {
        return [super.data, this.ParseData([
            ['dx', this.dx],
            ['dy', this.dy],
        ])].join(' ');
    }
}
/** The `<fePointLight>` SVG element defines a light source which allows to create a point light effect. It can be used within a 
 * lighting filter primitive: {@linkcode svgFilterFEDiffuseLighting feDiffuseLighting} or {@linkcode svgFilterFESpecularLighting feSpecularLighting}. 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/fePointLight */
export class svgFilterFEPointLight extends svgFilterPrimitive {
    /** 
     * **Note:** This {@linkcode x} value is overridden in `fePointLight`, 
     * and can be either a `number` or {@linkcode cssLengthPercentage}. 
     * 
     * Because JS subclasses cannot widen the types of parent 
     * class properties, a {@linkcode cssLengthPercentage} cannot 
     * be assigned to `x` directly. 
     * - Setter assigns value to {@linkcode pointLightX}.
     *   - A numerical value assigned to {@linkcode pointLightX} 
     * will be converted to a {@linkcode percentage} on output.
     * - Getter returns the numerical portion of the stored 
     * {@linkcode pointLightX} value, eg `"10px"` returns `10`.
     *   - **Note:** If there is any non-numeric data in that 
     * value, *it will be lost*. This also outputs a warning.  
     * Strongly recommended to use {@linkcode pointLightX}.
     * @returns {number} */
    get x() {
        let value = this.pointLightX;
        if (value == null) { return null; }
        if (StringOnlyNumeric(value)) { return Number(value); }
        let num = EnsureToNumber(StringNumericOnly(value));
        console.warn(`WARNING: Converting X ${value} to number ${num}, loss of data incurred! Use pointLightX instead!`, this);
        return num;
    }
    /** @param {number} v `number` only. Converted to {@linkcode percentage}. Recommended to use {@linkcode pointLightX}. */
    set x(v) { this.pointLightX = /** @type {`${number}%`} */ (`${v}%`); }
    /** 
     * **Note:** This {@linkcode y} value is overridden in `fePointLight`, 
     * and can be either a `number` or {@linkcode cssLengthPercentage}. 
     * 
     * Because JS subclasses cannot widen the types of parent 
     * class properties, a {@linkcode cssLengthPercentage} cannot 
     * be assigned to `y` directly. 
     * - Setter assigns value to {@linkcode pointLightY}.
     *   - A numerical value assigned to {@linkcode pointLightY} 
     * will be converted to a {@linkcode percentage} on output.
     * - Getter returns the numerical portion of the stored 
     * {@linkcode pointLightY} value, eg `"10px"` returns `10`.
     *   - **Note:** If there is any non-numeric data in that 
     * value, *it will be lost*. This also outputs a warning.  
     * Strongly recommended to use {@linkcode pointLightY}.
     * @returns {number} */
    get y() {
        let value = this.pointLightY;
        if (value == null) { return null; }
        if (StringOnlyNumeric(value)) { return Number(value); }
        let num = EnsureToNumber(StringNumericOnly(value));
        console.warn(`WARNING: Converting Y ${value} to number ${num}, loss of data incurred! Use pointLightY instead!`, this);
        return num;
    }
    /** @param {number} v `number` only. Converted to {@linkcode percentage}. Recommended to use {@linkcode pointLightY}. */
    set y(v) { this.pointLightY = /** @type {`${number}%`} */ (`${v}%`); }
    /** @typedef {number} svgType_Filter_PointLight_Z */
    /** @returns {svgType_Filter_PointLight_Z} */
    get z() { return this.#_z; }
    set z(v) { if (v == this.#_z) { return; } let prev = this.#_z; this.#_z = v; this.changed('z', v, prev); }
    /** @type {svgType_Filter_PointLight_Z} */
    #_z;
    /** @typedef {cssLengthPercentage} svgType_Filter_PointLight_X */
    /** @returns {svgType_Filter_PointLight_X} */
    get pointLightX() { return this.#_pointLightX; }
    set pointLightX(v) { if (v == this.#_pointLightX) { return; } let prev = this.#_pointLightX; this.#_pointLightX = v; this.changed('pointLightX', v, prev); }
    /** @type {svgType_Filter_PointLight_X} */
    #_pointLightX;
    /** @typedef {cssLengthPercentage} svgType_Filter_PointLight_Y */
    /** @returns {svgType_Filter_PointLight_Y} */
    get pointLightY() { return this.#_pointLightY; }
    set pointLightY(v) { if (v == this.#_pointLightY) { return; } let prev = this.#_pointLightY; this.#_pointLightY = v; this.changed('pointLightY', v, prev); }
    /** @type {svgType_Filter_PointLight_Y} */
    #_pointLightY;
    /** Convenience / naming consistency. Gets/sets {@linkcode z} @returns {svgType_Filter_PointLight_Z} */
    get pointLightZ() { return this.z; }
    set pointLightZ(v) { this.z = v; }
    /** 
     * @param {svgType_Filter_PointLight_X} [x = null] 
     * @param {svgType_Filter_PointLight_Y} [y = null] 
     * @param {svgType_Filter_PointLight_Z} [z = nul[l] = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(x = null, y = null, z = null, result = null, id = null) {
        super(result, id, 'fePointLight');
        this.pointLightX = x;
        this.pointLightY = y;
        this.pointLightZ = z;
        // prevent xy from being included in XYWH export 
        this.includeXYWHInData = /** @type {xywhInclusion} */ ('widthHeight');
    }
    get data() {
        return [super.data, this.ParseData([
            ['pointLightX', this.pointLightX],
            ['pointLightY', this.pointLightY],
            ['pointLightZ', this.pointLightZ],
        ])].join(' ');
    }
}
/** The `<feSpecularLighting>` SVG filter primitive lights a source graphic using the alpha channel as a bump map. 
 * The resulting image is an RGBA image based on the light color.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpecularLighting */
export class svgFilterFESpecularLighting extends svgFilterPrimitiveIn {
    /** @typedef {number} svgType_Filter_SpecularLighting_LightingColor lighting-color */
    /** @returns {svgType_Filter_SpecularLighting_LightingColor} */
    get lightingColor() { return this.#_lightingColor; }
    set lightingColor(v) { if (v == this.#_lightingColor) { return; } let prev = this.#_lightingColor; this.#_lightingColor = v; this.changed('lightingColor', v, prev); }
    /** @type {svgType_Filter_SpecularLighting_LightingColor} */
    #_lightingColor;
    /** @typedef {number} svgType_Filter_SpecularLighting_SurfaceScale */
    /** @returns {svgType_Filter_SpecularLighting_SurfaceScale} */
    get surfaceScale() { return this.#_surfaceScale; }
    set surfaceScale(v) { if (v == this.#_surfaceScale) { return; } let prev = this.#_surfaceScale; this.#_surfaceScale = v; this.changed('surfaceScale', v, prev); }
    /** @type {svgType_Filter_SpecularLighting_SurfaceScale} */
    #_surfaceScale;
    /** @typedef {number} svgType_Filter_SpecularLighting_SpecularConstant */
    /** @returns {svgType_Filter_SpecularLighting_SpecularConstant} */
    get specularConstant() { return this.#_specularConstant; }
    set specularConstant(v) { if (v == this.#_specularConstant) { return; } let prev = this.#_specularConstant; this.#_specularConstant = v; this.changed('specularConstant', v, prev); }
    /** @type {svgType_Filter_SpecularLighting_SpecularConstant} */
    #_specularConstant;
    /** @typedef {number} svgType_Filter_SpecularLighting_SpecularExponent */
    /** @returns {svgType_Filter_SpecularLighting_SpecularExponent} */
    get specularExponent() { return this.#_specularExponent; }
    set specularExponent(v) { if (v == this.#_specularExponent) { return; } let prev = this.#_specularExponent; this.#_specularExponent = v; this.changed('specularExponent', v, prev); }
    /** @type {svgType_Filter_SpecularLighting_SpecularExponent} */
    #_specularExponent;
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_SpecularLighting_KernelUnitLength */
    /** @returns {svgType_Filter_SpecularLighting_KernelUnitLength} */
    get kernelUnitLength() { return this.#_kernelUnitLength; }
    set kernelUnitLength(v) { if (v == this.#_kernelUnitLength) { return; } let prev = this.#_kernelUnitLength; this.#_kernelUnitLength = v; this.changed('kernelUnitLength', v, prev); }
    /** @type {svgType_Filter_SpecularLighting_KernelUnitLength} */
    #_kernelUnitLength;
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_SpecularLighting_LightingColor} [lightingColor = null] 
     * @param {svgType_Filter_SpecularLighting_SurfaceScale} [surfaceScale = null] 
     * @param {svgType_Filter_SpecularLighting_SpecularConstant} [specularConstant = null] 
     * @param {svgType_Filter_SpecularLighting_SpecularExponent} [specularExponent = null] 
     * @param {svgType_Filter_SpecularLighting_KernelUnitLength} [kernelUnitLength = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, lightingColor = null, surfaceScale = null, specularConstant = null, specularExponent = null, kernelUnitLength = null, result = null, id = null) {
        super(input, result, id, 'feSpecularLighting');
        this.lightingColor = lightingColor;
        this.surfaceScale = surfaceScale;
        this.specularConstant = specularConstant;
        this.specularExponent = specularExponent;
        this.kernelUnitLength = kernelUnitLength;
    }
    get data() {
        return [super.data, this.ParseData([
            ['lighting-color', this.lightingColor],
            ['surfaceScale', this.surfaceScale],
            ['specularConstant', this.specularConstant],
            ['specularExponent', this.specularExponent],
            ['kernelUnitLength', this.kernelUnitLength],
        ])].join(' ');
    }
}
/** The `<feSpotLight>` SVG element defines a light source that can be used to create a spotlight effect. It is used within a 
 * lighting filter primitive: {@linkcode svgFilterFEDiffuseLighting feDiffuseLighting} or {@linkcode svgFilterFESpecularLighting feSpecularLighting}. 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feSpotLight */
export class svgFilterFESpotlight extends svgFilterPrimitive {
    /** @typedef {number} svgType_Filter_Spotlight_X */
    /** @returns {svgType_Filter_Spotlight_X} */
    get x() { return this.#_x; }
    set x(v) { if (v == this.#_x) { return; } let prev = this.#_x; this.#_x = v; this.changed('x', v, prev); }
    /** @type {svgType_Filter_Spotlight_X} */
    #_x;
    /** @typedef {number} svgType_Filter_Spotlight_Y */
    /** @returns {svgType_Filter_Spotlight_Y} */
    get y() { return this.#_y; }
    set y(v) { if (v == this.#_y) { return; } let prev = this.#_y; this.#_y = v; this.changed('y', v, prev); }
    /** @type {svgType_Filter_Spotlight_Y} */
    #_y;
    /** @typedef {number} svgType_Filter_Spotlight_Z */
    /** @returns {svgType_Filter_Spotlight_Z} */
    get z() { return this.#_z; }
    set z(v) { if (v == this.#_z) { return; } let prev = this.#_z; this.#_z = v; this.changed('z', v, prev); }
    /** @type {svgType_Filter_Spotlight_Z} */
    #_z;
    /** Convenience / naming consistency. Gets/sets to {@linkcode x} @returns {svgType_Filter_Spotlight_X} */
    get spotlightX() { return this.x; }
    set spotlightX(v) { this.x = v; }
    /** Convenience / naming consistency. Gets/sets to {@linkcode y} @returns {svgType_Filter_Spotlight_Y} */
    get spotlightY() { return this.y; }
    set spotlightY(v) { this.y = v; }
    /** Convenience / naming consistency. Gets/sets {@linkcode z} @returns {svgType_Filter_Spotlight_Z} */
    get spotlightZ() { return this.z; }
    set spotlightZ(v) { this.z = v; }
    /** @typedef {number} svgType_Filter_Spotlight_PointsAtX */
    /** @returns {svgType_Filter_Spotlight_PointsAtX} */
    get pointsAtX() { return this.#_pointsAtX; }
    set pointsAtX(v) { if (v == this.#_pointsAtX) { return; } let prev = this.#_pointsAtX; this.#_pointsAtX = v; this.changed('pointsAtX', v, prev); }
    /** @type {svgType_Filter_Spotlight_PointsAtX} */
    #_pointsAtX;
    /** @typedef {number} svgType_Filter_Spotlight_PointsAtY */
    /** @returns {svgType_Filter_Spotlight_PointsAtY} */
    get pointsAtY() { return this.#_pointsAtY; }
    set pointsAtY(v) { if (v == this.#_pointsAtY) { return; } let prev = this.#_pointsAtY; this.#_pointsAtY = v; this.changed('pointsAtY', v, prev); }
    /** @type {svgType_Filter_Spotlight_PointsAtY} */
    #_pointsAtY;
    /** @typedef {number} svgType_Filter_Spotlight_PointsAtZ */
    /** @returns {svgType_Filter_Spotlight_PointsAtZ} */
    get pointsAtZ() { return this.#_pointsAtZ; }
    set pointsAtZ(v) { if (v == this.#_pointsAtZ) { return; } let prev = this.#_pointsAtZ; this.#_pointsAtZ = v; this.changed('pointsAtZ', v, prev); }
    /** @type {svgType_Filter_Spotlight_PointsAtZ} */
    #_pointsAtZ;
    /** @typedef {number} svgType_Filter_Spotlight_LimitingConeAngle */
    /** @returns {svgType_Filter_Spotlight_LimitingConeAngle} */
    get limitingConeAngle() { return this.#_limitingConeAngle; }
    set limitingConeAngle(v) { if (v == this.#_limitingConeAngle) { return; } let prev = this.#_limitingConeAngle; this.#_limitingConeAngle = v; this.changed('limitingConeAngle', v, prev); }
    /** @type {svgType_Filter_Spotlight_LimitingConeAngle} */
    #_limitingConeAngle;
    /** @typedef {number} svgType_Filter_Spotlight_SpecularExponent */
    /** @returns {svgType_Filter_Spotlight_SpecularExponent} */
    get specularExponent() { return this.#_specularExponent; }
    set specularExponent(v) { if (v == this.#_specularExponent) { return; } let prev = this.#_specularExponent; this.#_specularExponent = v; this.changed('specularExponent', v, prev); }
    /** @type {svgType_Filter_Spotlight_SpecularExponent} */
    #_specularExponent;
    /** 
     * @param {svgType_Filter_Spotlight_X} [x = null] 
     * @param {svgType_Filter_Spotlight_Y} [y = null] 
     * @param {svgType_Filter_Spotlight_Z} [z = null] 
     * @param {svgType_Filter_Spotlight_PointsAtX} [pointsAtX = null] 
     * @param {svgType_Filter_Spotlight_PointsAtY} [pointsAtY = null] 
     * @param {svgType_Filter_Spotlight_PointsAtZ} [pointsAtZ = null] 
     * @param {svgType_Filter_Spotlight_LimitingConeAngle} [specularExponent = null] 
     * @param {svgType_Filter_Spotlight_LimitingConeAngle} [limitingConeAngle = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(x = null, y = null, z = null, pointsAtX = null, pointsAtY = null, pointsAtZ = null, specularExponent = null, limitingConeAngle = null, result = null, id = null) {
        super(result, id, 'feSpotlight');
        this.x = x;
        this.y = y;
        this.z = z;
        this.pointsAtX = pointsAtX;
        this.pointsAtY = pointsAtY;
        this.pointsAtZ = pointsAtZ;
        this.specularExponent = specularExponent;
        this.limitingConeAngle = limitingConeAngle;
    }
    get data() {
        return [super.data, this.ParseData([
            ['x', this.x],
            ['y', this.y],
            ['z', this.z],
            ['pointsAtX', this.pointsAtX],
            ['pointsAtY', this.pointsAtY],
            ['pointsAtZ', this.pointsAtZ],
            ['specularExponent', this.specularExponent],
            ['limitingConeAngle', this.limitingConeAngle],
        ])].join(' ');
    }
}
/** The `<feTile>` SVG filter primitive allows to fill a target rectangle with a repeated, tiled pattern of an input image. 
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTile */
export class svgFilterFETile extends svgFilterPrimitiveIn {
    /** 
     * @param {svgType_Filter_In} [input = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(input = null, result = null, id = null) {
        super(input, result, id, 'feTile');
    }
}
/** The `<feTurbulence>` SVG filter primitive creates an image using the Perlin turbulence function. 
 * It allows the synthesis of artificial textures like clouds or marble.
 * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/feTurbulence */
export class svgFilterFETurbulence extends svgFilterPrimitive {
    /** @typedef {cssNumberOptionalNumber} svgType_Filter_Turbulence_BaseFrequency */
    /** @returns {svgType_Filter_Turbulence_BaseFrequency} */
    get baseFrequency() { return this.#_baseFrequency; }
    set baseFrequency(v) { if (v == this.#_baseFrequency) { return; } let prev = this.#_baseFrequency; this.#_baseFrequency = v; this.changed('baseFrequency', v, prev); }
    /** @type {svgType_Filter_Turbulence_BaseFrequency} */
    #_baseFrequency;
    /** @typedef {integer} svgType_Filter_Turbulence_NumOctaves must be integer */
    /** @returns {svgType_Filter_Turbulence_NumOctaves} */
    get numOctaves() { return this.#_numOctaves; }
    set numOctaves(v) { if (v == this.#_numOctaves) { return; } let prev = this.#_numOctaves; this.#_numOctaves = v; this.changed('numOctaves', v, prev); }
    /** @type {svgType_Filter_Turbulence_NumOctaves} */
    #_numOctaves;
    /** @typedef {number} svgType_Filter_Turbulence_Seed Can be number, but gets rounded down to integer */
    /** @returns {svgType_Filter_Turbulence_Seed} */
    get seed() { return this.#_seed; }
    set seed(v) { if (v == this.#_seed) { return; } let prev = this.#_seed; this.#_seed = v; this.changed('seed', v, prev); }
    /** @type {svgType_Filter_Turbulence_Seed} */
    #_seed;
    /** @typedef {'noStitch'|'stitch'} svgType_Filter_Turbulence_StitchTiles */
    /** @returns {svgType_Filter_Turbulence_StitchTiles} */
    get stitchTiles() { return this.#_stitchTiles; }
    set stitchTiles(v) { if (v == this.#_stitchTiles) { return; } let prev = this.#_stitchTiles; this.#_stitchTiles = v; this.changed('stitchTiles', v, prev); }
    /** @type {svgType_Filter_Turbulence_StitchTiles} */
    #_stitchTiles;
    /** @typedef {'fractalNoise'|'turbulence'} svgType_Filter_Turbulence_Type */
    /** @returns {svgType_Filter_Turbulence_Type} */
    get type() { return this.#_type; }
    set type(v) { if (v == this.#_type) { return; } let prev = this.#_type; this.#_type = v; this.changed('type', v, prev); }
    /** @type {svgType_Filter_Turbulence_Type} */
    #_type;
    /** 
     * @param {svgType_Filter_Turbulence_BaseFrequency} [baseFrequency = null] 
     * @param {svgType_Filter_Turbulence_NumOctaves} [numOctaves = null] 
     * @param {svgType_Filter_Turbulence_Seed} [seed = null] 
     * @param {svgType_Filter_Turbulence_StitchTiles} [stitchTiles = null] 
     * @param {svgType_Filter_Turbulence_Type} [type = null] 
     * @param {svgType_Filter_Result} [result = null] 
     * @param {string} [id = null] 
     */
    constructor(baseFrequency = null, numOctaves = null, seed = null, stitchTiles = null, type = null, result = null, id = null) {
        super(result, id, 'feTurbulence');
        this.baseFrequency = baseFrequency;
        this.numOctaves = numOctaves;
        this.seed = seed;
        this.stitchTiles = stitchTiles;
        this.type = type;
    }
    get data() {
        return [super.data, this.ParseData([
            ['baseFrequency', this.baseFrequency],
            ['numOctaves', this.numOctaves],
            ['seed', this.seed],
            ['stitchTiles', this.stitchTiles],
            ['type', this.type],
        ])].join(' ');
    }
}
