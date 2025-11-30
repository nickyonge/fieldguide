import { svgDefaults, svgElement, svgHTMLAsset, svgViewBox, svgRect, svgGradient, svgConfig } from "../index";
import { svgDefinition } from "./index";

// other SVG definitions (elements)
// see: https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element

// #region XYWH Def 

/** Should a warning be output when trying to set XYWH on an 
 * {@linkcode svgXYWHDefinition} that has its 
 * {@linkcode svgXYWHDefinition.matchViewboxXYWH matchViewboxXYWH}
 * value set to `true`? Default `true` */
const WARNING_SET_XYWH_ON_XYWH_MATCHED_DEF = true;

/**
 * Container for an {@linkcode svgDefinition} that has
 * `x`, `y`, `width`, and `height` (XYWH) properties 
 */
export class svgXYWHDefinition extends svgDefinition {

    /** 
     * Should this definition's {@linkcode x}, {@linkcode y}, 
     * {@linkcode width}, and {@linkcode height} values match that 
     * of the {@linkcode svgViewBox viewbox} on the parent {@linkcode svgHTMLAsset}?
     * @returns {boolean} */
    get matchViewboxXYWH() { return this.#_matchViewboxXYWH; }
    set matchViewboxXYWH(v) {
        let prev = this.#_matchViewboxXYWH; this.#_matchViewboxXYWH = v; this.changed('matchViewboxXYWH', v, prev);
        if (v) { this._updateXYWH(); }
    }
    /** @type {boolean} */
    #_matchViewboxXYWH = svgDefaults.XYWHDEF_MATCHVIEWBOX;

    /**
     * Should this definition's {@linkcode x}, {@linkcode y}, 
     * {@linkcode width}, and {@linkcode height} values be 
     * included while exporting this def's {@linkcode html}? 
     * 
     * If value is a boolean, it's straightfoward - all (`true`) or none (`false`). 
     * 
     * If value is `null`, same as `false`. 
     * 
     * If value is a string (case sensitive), corresponding output is: 
     * - `"xyOnly"`: only `x` and `y` 
     * - `"whOnly"` / `"widthHeight"` / `"widthHeightOnly"`: only `width` and `height` 
     * - `"xywh"` / `"all"`: `x`, `y`, `width`, and `height` (same as `true`) 
     *   - Any subset of these characters will use only the 
     *     assocaited values. Eg, `"yh"` will use `y` and `height`. 
     * - `"x"`, `"y"`, `"w"` / `"width"`, or `"h"`/`"height"`: only that value 
     * - `"none"` / `""`: no values, same as `false` 
     * @returns {xywhInclusion} */
    get includeXYWHInData() { return this.#_includeXYWHInData; }
    /** @param {xywhInclusion} v */
    set includeXYWHInData(v) { let prev = this.#_includeXYWHInData; this.#_includeXYWHInData = v; this.changed('includeXYWHInData', v, prev); }
    /** @type {xywhInclusion} */
    #_includeXYWHInData = svgDefaults.XYWHDEF_INCLUDEXYWHNDATA;

    /** Get the `x` value of this definition. If {@linkcode matchViewboxXYWH} is `true`, this has no affect, as the value wll be read from a parent {@linkcode svgViewBox} (if one exists). @returns {number} */
    get x() { return this.#_x; }
    set x(v) {
        if (this.matchViewboxXYWH && this.rootHTMLAsset != null) {
            if (WARNING_SET_XYWH_ON_XYWH_MATCHED_DEF) { console.warn(`WARNING: Can't set X to ${v} on svgXYWHDefinition with matchViewboxXYWH enabled.`, this); }
            return;
        }
        let prev = this.#_x; this.#_x = v; this.changed('x', v, prev);
    }
    /** @type {number} */
    #_x = svgDefaults.X;
    /** Get the `y` value of this definition. If {@linkcode matchViewboxXYWH} is `true`, this has no affect, as the value wll be read from a parent {@linkcode svgViewBox} (if one exists). @returns {number} */
    get y() { return this.#_y; }
    set y(v) {
        if (this.matchViewboxXYWH && this.rootHTMLAsset != null) {
            if (WARNING_SET_XYWH_ON_XYWH_MATCHED_DEF) { console.warn(`WARNING: Can't set Y to ${v} on svgXYWHDefinition with matchViewboxXYWH enabled.`, this); }
            return;
        }
        let prev = this.#_y; this.#_y = v; this.changed('y', v, prev);
    }
    /** @type {number} */
    #_y = svgDefaults.Y;
    /** Get the `width` value of this definition. If {@linkcode matchViewboxXYWH} is `true`, this has no affect, as the value wll be read from a parent {@linkcode svgViewBox} (if one exists). @returns {number} */
    get width() { return this.#_width; }
    set width(v) {
        if (this.matchViewboxXYWH && this.rootHTMLAsset != null) {
            if (WARNING_SET_XYWH_ON_XYWH_MATCHED_DEF) { console.warn(`WARNING: Can't set WIDTH to ${v} on svgXYWHDefinition with matchViewboxXYWH enabled.`, this); }
            return;
        }
        let prev = this.#_width; this.#_width = v; this.changed('width', v, prev);
    }
    /** @type {number} */
    #_width = svgDefaults.WIDTH;
    /** Get the `height` value of this definition. If {@linkcode matchViewboxXYWH} is `true`, this has no affect, as the value wll be read from a parent {@linkcode svgViewBox} (if one exists). @returns {number} */
    get height() { return this.#_height; }
    set height(v) {
        if (this.matchViewboxXYWH && this.rootHTMLAsset != null) {
            if (WARNING_SET_XYWH_ON_XYWH_MATCHED_DEF) { console.warn(`WARNING: Can't set HEIGHT to ${v} on svgXYWHDefinition with matchViewboxXYWH enabled.`, this); }
            return;
        }
        let prev = this.#_height; this.#_height = v; this.changed('height', v, prev);
    }
    /** @type {number} */
    #_height = svgDefaults.HEIGHT;

    /** 
     * Class representing an SVG definition, typically found in an SVG's `<defs>`.
     * - Includes {@linkcode x}, {@linkcode y}, {@linkcode width}, and {@linkcode height}
     *   (XYWH) values, and syncs those values to the {@linkcode svgViewBox viewbox} 
     *   on the parent {@linkcode svgHTMLAsset} if {@linkcode matchViewboxXYWH} is `true`.
     * @param {string} [id] Unique identifier for this element (see {@linkcode svgElement.id}). If blank/omitted, sets to {@linkcode svgElement.uniqueID}. 
     * @param {string?} [defType] Definition type. Must be set, but can be set at any time. 
     * Usually set by the constructor of a subclass inheriting from {@link svgDefinition}.
     * If unassigned, and can't auto-detect, won't be generated in {@linkcode html}
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
     */
    constructor(id = undefined, defType = undefined) {
        super(id, defType);
        this.AddOnChangeCallback(this.onAssetChanged);
        // initial attempt to match to viewbox 
        if (this.parent != null) { this._updateXYWH(); }
    }

    get data() {
        if (this.includeXYWHInData == null || this.includeXYWHInData == false || this.includeXYWHInData == 'none') { return super.data; }
        let xywh = { x: false, y: false, w: false, h: false };
        if (typeof this.includeXYWHInData === 'boolean') {
            // must be true
            xywh.x = true; xywh.y = true; xywh.w = true; xywh.h = true;
        } else {
            // must be string 
            switch (this.includeXYWHInData) {
                case 'all':
                case 'xywh':
                    xywh.x = true; xywh.y = true; xywh.w = true; xywh.h = true;
                    break;
                case 'xy':
                case 'xyOnly':
                    xywh.x = true; xywh.y = true;
                    break;
                case 'wh':
                case 'whOnly':
                case 'widthHeightOnly':
                    xywh.w = true; xywh.h = true;
                    break;
                case 'w':
                case 'width':
                    xywh.w = true;
                    break;
                case 'h':
                case 'height':
                    xywh.h = true;
                    break;
                default:
                    xywh.x = this.includeXYWHInData.indexOf('x') >= 0;
                    xywh.y = this.includeXYWHInData.indexOf('y') >= 0;
                    xywh.w = this.includeXYWHInData.indexOf('w') >= 0;
                    xywh.h = this.includeXYWHInData.indexOf('h') >= 0;
                    break;
            }
        }
        if (xywh.x == false && xywh.y == false && xywh.w == false && xywh.h == false) { return super.data; }
        /** @type {[string, any?][]} */
        let dataToParse = [];
        if (xywh.x) { dataToParse.push(['x', this.x]); }
        if (xywh.y) { dataToParse.push(['y', this.y]); }
        if (xywh.w) { dataToParse.push(['width', this.width]); }
        if (xywh.h) { dataToParse.push(['height', this.height]); }
        if (dataToParse.length == 0) { return super.data; }
        return [super.data, this.ParseData(dataToParse)].join(' ');
    }

    onAssetChanged(valueChanged, newValue, previousValue, _changedElement) {
        switch (valueChanged) {
            case 'parent':
                // new parent, first, remove onChange callback if found 
                if (previousValue != null && previousValue instanceof svgElement) {
                    if (previousValue.HasOnChangeCallback(this.onAssetChanged)) {
                        previousValue.RemoveOnChangeCallback(this.onAssetChanged);
                    }
                }
                // add onChange callback to new parent's HTML asset 
                if (newValue != null) {
                    if (newValue instanceof svgElement) {
                        let htmlAsset = newValue.rootHTMLAsset;
                        if (htmlAsset != null) {
                            htmlAsset.AddOnChangeCallback(this.XYWHUpdateCallback);
                            htmlAsset.viewBox?.AddOnChangeCallback(this.XYWHUpdateCallback);
                        }
                    } else {
                        console.warn("New parent assigned to svgXYWHDefinition is somehow NOT an svgElement? Investigate", newValue, this);
                        return;
                    }
                }
                this._updateXYWH();
                break;
        }
    }

    XYWHUpdateCallback(valueChanged, newValue, previousValue, changedElement) {
        if (changedElement instanceof svgHTMLAsset) {
            // HTML asset changed 
            switch (valueChanged) {
                case 'viewbox':
                    let p = /** @type {svgViewBox} */ (previousValue);
                    if (p != null) {
                        if (p.HasOnChangeCallback(this.XYWHUpdateCallback)) {
                            p.RemoveOnChangeCallback(this.XYWHUpdateCallback);
                        }
                    }
                    let n = /** @type {svgViewBox} */ (newValue);
                    if (n != null) {
                        n.AddOnChangeCallback(this.XYWHUpdateCallback);
                        this._updateXYWH(n);
                    }
                    break;
            }
        } else if (changedElement instanceof svgViewBox) {
            // viewbox asset changed 
            switch (valueChanged) {
                case 'x':
                case 'y':
                case 'width':
                case 'height':
                    this._updateXYWH(changedElement);
                    break;
            }
        }
    }

    /**
     * Update this asset's XYWH based on the given {@linkcode svgViewBox}.
     * 
     * If {@linkcode viewbox} is `null`, attempts to find it using
     * {@linkcode svgElement.rootHTMLAsset}, via {@linkcode _getViewbox}. 
     * 
     * **Note:** If {@linkcode matchViewboxXYWH} is `false`, does nothing.
     * @param {svgViewBox} [viewbox] 
     * @private
     */
    _updateXYWH(viewbox) {
        if (!this.matchViewboxXYWH) { return; }
        if (viewbox == null) {
            viewbox = this._getViewbox;
            if (viewbox == null) { return; }
        }
        // set local stores, because
        // 1) we don't want to trigger onChange, and 
        // 2) we don't want matchViewboxXYWH to catch 
        this.#_x = viewbox.x;
        this.#_y = viewbox.y;
        this.#_width = viewbox.width;
        this.#_height = viewbox.height;
    }

    /** 
     * Get the locally referenced {@linkcode svgViewBox}, 
     * or `null` if not found 
     * @returns {svgViewBox|null} 
     */
    get _getViewbox() {
        return this.rootHTMLAsset?.viewBox;
    }
}

// #endregion XYWH Def 
