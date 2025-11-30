import {
    svgElement,
    svgHTMLAsset,
    svgDefinition,
    svgShape,
    svgGradient,
    svgDefaults,
    svgViewBox
} from "./index";

/**
 * Does setting an {@linkcode svgElement.id svgElement's ID} to `null`
 * reset it to its {@linkcode svgElement.uniqueID uniqueID} value?
 * If `false`, `null` IDs are permitted. 
 * @type {boolean}
 */
export const SETTING_ELEMENT_ID_NULL_SETS_TO_UNIQUE = true;

/**
 * Are unique IDs on {@link svgElement svgElements} *required*? 
 * If `true`, already-used IDs will not be permitted. If `false`,
 * they will still produce a warning. IDs that are `null` are ignored.
 * @type {boolean}
 */
export const REQUIRE_UNIQUE_SVG_ELEMENT_IDS = true;

/**
 * Should arrays (such as {@linkcode svgHTMLAsset.shapes} ), when
 * set to `null`, change the set value to `[]`? If `false`,
 * sets array to `null` and returns out of the setter.
 */
export const ARRAY_SET_NULL_CREATES_EMPTY_ARRAY = true;

/**
 * Should {@link svgElement} HTML code contain 
 * `\n` newlines for each element?
 * @type {boolean} 
 */
export const HTML_NEWLINE = true;
/** 
 * Should {@link svgElement} HTML code be `\t` indented? 
 * @see {@linkcode HTML_NEWLINE} must also be `true`.
 * @type {boolean}
 * */
export const HTML_INDENT = true && HTML_NEWLINE;

/** 
 * Should {@linkcode svgDefinition} output a warning
 * during {@linkcode svgDefinition.html html} generation 
 * if it does not have an {@linkcode svgElement.id}?
 * @type {boolean}
 */
export const HTML_WARN_DEFS_NO_ID = true;
/** 
 * Should {@linkcode svgDefinition} output a warning
 * during {@linkcode svgDefinition.html html} generation 
 * if it doesn't have a {@linkcode svgDefinition.defType defType}?
 * 
 * **Note:** even if {@linkcode svgDefinition.subclassHandlesHTML}
 * is `true`, a missing `defType` on the parent svgDefinition will
 * still output this error. Consider passing `defType` through
 * the subclass's constructor `super()`, even if `id` is `null`.
 * @type {boolean}
 */
export const HTML_WARN_DEFS_NO_DEFTYPE = true;

/**
 * Should {@linkcode svgElement.onChange onChange} be called 
 * the first time an {@linkcode svgElement} has its 
 * {@linkcode svgElement.parent parent} value set?
 * @type {boolean}
 */
export const ONCHANGE_ON_FIRST_PARENT_ASSIGNED = true;

/**
 * Should a `null` value for {@linkcode svgViewBox}
 * in {@linkcode svgHTMLAsset} be allowed?
 */
export const ALLOW_NULL_VIEWBOX = false;

/**
 * A minimal amount to offset a value by where the 
 * value in its direct form - typically `0` or `1` - 
 * would cause issues.
 */
export const MINVALUE_OFFSET = 0.002;

/**
 * Should {@linkcode svgGradient.sharpness} be capped at at 
 * 1 - {@linkcode MINVALUE_OFFSET}?
 * 
 * If `false`, allows gradient sharpness to fully clamp between `0`
 * and `1`.
 * 
 * Capping has no affect on performance. Any non-zero/non-null value 
 * for {@linkcode svgGradient.sharpness} will have the same effect.
 * 
 * **Note:** A value of `1` can produce 
 * {@link https://en.wikipedia.org/wiki/Jaggies jaggies} when
 * `angle` is non-zero.
 */
export const GRADIENT_SHARPNESS_CAPPED = true;

/**
 * Should {@linkcode svgGradient.scale} 
 * be allowed to have negatives values? 
 * 
 * If `false, values below `0` will be 
 * clamped to `0`.
 */
export const GRADIENT_SCALE_ALLOW_NEGATIVE = true;

/**
 * Should {@linkcode svgGradient.scale} values of exactly 
 * `0` be offset by a tiny amount ({@linkcode MINVALUE_OFFSET}) 
 * during the gradient's HTML generation? 
 */
export const GRADIENT_SCALE_PREVENT_ZERO = true;

/**
 * Does setting {@linkcode svgHTMLAsset.gradient} to `null`
 * also set {@linkcode svgShape.fill} to `null` for any
 * {@link svgHTMLAsset.shapes shapes} on that
 * {@link svgHTMLAsset asset} using the existing gradient?
 */
export const GRADIENT_SET_NULL_SETS_FILL_NULL = true;

/**
 * Should {@linkcode svgDefaults.EnsureGradientDefaultColors}
 * force a single color array to add a second value?
 * @type {boolean}
 */
export const GRADIENT_DEFAULT_COLORARRAY_FORCE_TWO_VALUES = false;

/**
 * Class constructor names to NOT auto-add an ID to in {@link svgElement}.
 * 
 * If a class name is listed here, and an element's {@linkcode svgElement.id} 
 * is `null` or blank, and that element's {@linkcode svgElement.className} 
 * matches one of the class names listed here, its {@linkcode svgElement.id id} 
 * will NOT be assigned to `svgElement.#defaultID`.
 * @type {string[]}
 */
export const IGNORE_AUTO_ID_CLASSES = [
    // 'svgGradientStop'
];
