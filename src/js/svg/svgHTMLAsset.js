import * as svg from './index';
import { svgElement, svgConfig, svgDefaults, svgShape, svgDefinition, svgGradient } from './index';
import { shape, rect, circle, ellipse, line, polyline, polygon, path, gradient } from "./index";
import { isBlank } from "../lilutils";

/** 
 * Used to create an SVG element ready to add to the HTML document 
 * @example
    // import the relevant classes from their scripts
    // (or, use "import * as svg from './index';" and "svg.htmlAsset" / "svg.gradient") 
    import { svgHTMLAsset } from "./svg/svgHTMLAsset";
    import { svgGradient } from "./svg/svgGradient";

    // create the div to hold the SVG's HTML
    const myDiv = document.createElement("div");

    // create a new SVG asset, or use something like BasicGradientRect for a template 
    const mySVG = svgHTMLAsset.BasicGradientRect(svgGradient.templates.softrainbow);

    // customize the appearance of the gradient 
    mySVG.gradient.sharpness = 0.69;
    mySVG.gradient.angle = 15;

    // assign the HTML to the div. Use mySVG.onChange to auto-update any changes!
    myDiv.innerHTML = mySVG.html;

    // done! add the div to the page body, and behold a beautiful rainbow
    document.body.appendChild(myDiv);
 */
export class svgHTMLAsset extends svg.element {

    /** Array containing all {@linkcode svgHTMLAsset svgHTMLAsset} instances @type {svgHTMLAsset[]} */
    static allSVGHTMLAssets = [];
    /** Filters and returns length of {@linkcode allSVGHTMLAssets} @returns {Number} */
    static get allSVGHTMLAssetsCount() { svgHTMLAsset.#__filterAssetsArray(); return svgHTMLAsset.allSVGHTMLAssets.length; }
    /** Remove all `null` values from the {@linkcode allSVGHTMLAssets} array @returns {void} */
    static #__filterAssetsArray() { svgHTMLAsset.allSVGHTMLAssets = svgHTMLAsset.allSVGHTMLAssets.filter(e => e != null); }

    /** Opacity of the SVG element as a whole.
     * 
     * **Note:** If `opacity != 1`, this is applied via setting `style="opacity: X;"` in this svg's
     * HTML declaration. This may interfere with opacity set via CSS stylesheets. In that case, leave
     * this as `1`, and change opacity either by setting the opacity of the fill color (eg `#ffffff69`)
     * or, if using an {@link svgGradient}, you can use 
     * {@linkcode svgGradient.opacity svgGradient.opacity}.
     * 
     * **Note:** since this is assigning opacity via CSS and not any color or gradient properties, 
     * things like using a gradient as a mask may not perform as you'd expect. In that case, use
     * {@linkcode svgGradient.opacity svgGradient.opacity} instead.
     * @returns {number} */
    get opacity() { return this.#_opacity; }
    set opacity(v) { let prev = this.#_opacity; this.#_opacity = v; this.changed('opacity', v, prev); }
    /** @type {number} */
    #_opacity = svg.defaults.OPACITY;

    /** CSS class to apply to this SVG asset @returns {string} */
    get class() { return this.#_class; }
    set class(v) { let prev = this.#_class; this.#_class = v; this.changed('class', v, prev); }
    /** @type {string} */
    #_class;
    /** Used to define viewbox properties in the SVG HTML element @returns {svgViewBox} */
    get viewBox() {
        if (!svgConfig.ALLOW_NULL_VIEWBOX) {
            if (this.#_viewBox == null) {
                this.viewBox = new svgViewBox();
            }
        }
        return this.#_viewBox;
    }
    set viewBox(v) {
        if (this.#_viewBox == v) { return; } // call local ref, not getter 
        let prev = this.#_viewBox;
        if (!svgConfig.ALLOW_NULL_VIEWBOX) {
            if (v == null) { v = new svgViewBox(); }
        }
        this.#_viewBox = v;
        if (v != null) { v.parent = this; }
        if (!this.#_firstViewboxAssigned) {
            this.#_firstViewboxAssigned = true;
        } else {
            this.changed('viewbox', v, prev);
        }
    }
    /** @type {svgViewBox} */
    #_viewBox;
    /** local flag for first viewbox assignment @type {boolean} */
    #_firstViewboxAssigned = false;
    /** 
     * Array of {@link svg.shape shapes} contained in this SVG 
     * (excluding any in {@link definitions `<defs>`}) 
     * @returns {svg.shape[]} */
    get shapes() {
        if (this.#_shapes == null) { this.#_shapes = []; }
        return this.#_shapes;
    }
    set shapes(v) {
        let prev = this.#_shapes;
        if (v == null) {
            if (svg.config.ARRAY_SET_NULL_CREATES_EMPTY_ARRAY) {
                v = [];
            } else {
                this.#_shapes = null;
                this.changed(_arrayNameShapes, v, prev);
                return;
            }
        } else { v.removeNullValues(); }
        v.forEach(shape => {
            shape.storeInDefsElement = false;
            shape.parent = this;
        });
        this.#_shapes = v;
        this.#_shapes.name = _arrayNameShapes;
        this.#_shapes['parent'] = this;
        this.#_shapes.onChange = this.arrayChanged;
        this.changed(_arrayNameShapes, v, prev);
    }
    /** @type {svg.shape[]} */
    #_shapes; // don't assign default value to svg element arrays 
    /** 
     * Array of elements contained in this SVG's `<defs>` 
     * @returns {svg.definition[]} 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/defs
     * */
    get definitions() {
        if (this.#_definitions == null) { this.#_definitions = []; }
        return this.#_definitions;
    }
    set definitions(v) {
        let prev = this.#_definitions;
        if (v == null) {
            if (svg.config.ARRAY_SET_NULL_CREATES_EMPTY_ARRAY) {
                v = [];
            } else {
                this.#_definitions = null;
                this.changed(_arrayNameDefinitions, v, prev);
                return;
            }
        } else { v.removeNullValues(); }
        v.forEach(def => {
            def.parent = this;
        });
        this.#_definitions = v;
        this.#_definitions.name = _arrayNameDefinitions;
        this.#_definitions['parent'] = this;
        this.#_definitions.onChange = this.arrayChanged;
        this.changed(_arrayNameDefinitions, v, prev);
    }
    /** @type {svg.definition[]} */
    #_definitions; // don't assign default value to svg element arrays 

    /** 
     * Preserves the SVG's aspect ratio.
     * - **Note:** This is distinct from {@linkcode cssPreserveAspectRatio}. 
     * @returns {boolean} */
    get preserveAspectRatio() { return this.#_preserveAspectRatio; }
    set preserveAspectRatio(v) { let prev = this.#_preserveAspectRatio; this.#_preserveAspectRatio = v; this.changed('preserveAspectRatio', v, prev); }
    /** @type {boolean} */
    #_preserveAspectRatio = svg.defaults.PRESERVEASPECTRATIO;;
    /** @returns {([string, any?])[]} */
    get metadata() { return this.#_metadata; }
    set metadata(v) { let prev = this.#_metadata; this.#_metadata = v; this.changed('metadata', v, prev); }
    /** @type {([string, any?])[]} */
    #_metadata = svg.defaults.METADATA;

    /**
     * Create a new SVG HTML asset, with optionally 
     * supplied shapes, definitions, and viewbox.
     * @param {svg.shape|svg.shape[]} shapes Optional array of {@link svgShape svgShapes} 
     * @param {svg.definition|svg.definition[]} definitions Optional array of {@link svgDefinition svgDefinitions} for `<defs>` 
     * @param {svgViewBox|number|null} viewBoxOrVBWidth Optional {@link svgViewBox viewbox}, or a width value for a new ViewBox (if height is also defined). If omitted, creates a new viewbox with default values.
     * @param {number|null} [vbHeight=undefined] Optional height for a new Viewbox. Only used if `viewBoxWidth` is type `number`.
     */
    constructor(shapes = [], definitions = [], viewBoxOrVBWidth = new svgViewBox(), vbHeight = undefined) {
        super();
        this.onChange = this._htmlAssetOnChange;
        this.shapes = Array.isArray(shapes) ? shapes : shapes == null ? [] : [shapes];
        this.definitions = Array.isArray(definitions) ? definitions : definitions == null ? [] : [definitions];
        if (viewBoxOrVBWidth != null) {
            if (viewBoxOrVBWidth instanceof svgViewBox) {
                this.viewBox = viewBoxOrVBWidth;
            } else if (typeof viewBoxOrVBWidth === 'number' && vbHeight != null && typeof vbHeight === 'number') {
                this.viewBox = new svgViewBox(null, null, viewBoxOrVBWidth, vbHeight);
            } else {
                this.viewBox = new svgViewBox();
            }
        } else {
            if (!svgConfig.ALLOW_NULL_VIEWBOX) {
                this.viewBox = new svgViewBox();
            }
        }
        svgHTMLAsset.#__filterAssetsArray();
        svgHTMLAsset.allSVGHTMLAssets.push(this);
    }
    get html() {
        let d = this.data;
        let newSVG = isBlank(d) ? '<svg' : `<svg ${d}`;
        if (this.opacity != 1) {
            newSVG += ` style="opacity:${this.opacity};"`;
        }
        newSVG += '>';
        if (svg.config.HTML_NEWLINE) { newSVG += '\n'; }
        // collect SVG definitions and shapes 
        /** defs directly childed to this asset @type {svgDefinition[]} */
        let directChildren = [];
        /** defs stored in `<defs>` @type {svgDefinition[]} */
        let defs = [];
        if (this.definitions != null && this.definitions.length > 0) {
            this.definitions.forEach(definition => {
                if (definition == null) { return; }
                if (definition.storeInDefsElement) {
                    defs.push(definition);
                } else {
                    directChildren.push(definition);
                }
            });
        }
        if (this.shapes != null && this.shapes.length > 0) {
            this.shapes.forEach(shape => {
                if (shape == null) { return; }
                if (shape.storeInDefsElement) {
                    defs.push(shape);
                } else {
                    directChildren.push(shape);
                }
            });
        }
        // add defs to the html output
        // defs 
        if (defs.length > 0) {
            if (svg.config.HTML_INDENT) { newSVG += '\t'; }
            newSVG += '<defs>';
            if (svg.config.HTML_NEWLINE) { newSVG += '\n'; }
            defs.forEach(definition => {
                if (definition == null) { return; }
                let h = this.IndentHTML(definition.html, 2);
                if (!isBlank(h)) {
                    newSVG += h;
                    if (svg.config.HTML_NEWLINE) { newSVG += '\n'; }
                }
            });
            if (svg.config.HTML_INDENT) { newSVG += '\t'; }
            newSVG += '</defs>';
            if (svg.config.HTML_NEWLINE) { newSVG += '\n'; }
        }
        // direct children 
        if (directChildren.length > 0) {
            directChildren.forEach(definition => {
                if (definition == null) { return; }
                let h = definition.html;
                if (!isBlank(h)) {
                    if (svg.config.HTML_INDENT) { newSVG += '\t'; }
                    newSVG += h;
                    if (svg.config.HTML_NEWLINE) { newSVG += '\n'; }
                }
            });
        }

        return `${newSVG}</svg>`;
    }
    /**
     * Collects and returns all the data relevant to this asset, 
     * generally to be used in {@linkcode html} to for the final output.
     */
    get data() {
        if (this.viewBox == null) { this.viewBox = new svgViewBox(); }
        if (this.metadata == null) { this.metadata = svg.defaults.METADATA; }
        let d = this.ParseData([
            ['class', this.class],
            ['preserveAspectRatio', this.preserveAspectRatio]
        ]);
        return [this.ParseData(this.metadata), d, this.viewBox.html].filter(Boolean).join(' ');
    }

    /** Get/set the {@linkcode svgViewBox.x x} value of this asset's {@linkcode svgViewBox}. @returns {number} */
    get x() { return this.viewBox.x; }
    set x(v) { this.viewBox.x = v; }
    /** Get/set the {@linkcode svgViewBox.y y} value of this asset's {@linkcode svgViewBox}. @returns {number} */
    get y() { return this.viewBox.y; }
    set y(v) { this.viewBox.y = v; }
    /** Get/set the {@linkcode svgViewBox.width width} value of this asset's {@linkcode svgViewBox}. @returns {number} */
    get width() { return this.viewBox.width; }
    set width(v) { this.viewBox.width = v; }
    /** Get/set the {@linkcode svgViewBox.height height} value of this asset's {@linkcode svgViewBox}. @returns {number} */
    get height() { return this.viewBox.height; }
    set height(v) { this.viewBox.height = v; }

    /**
     * Internal {@linkcode svg.onChange onChange} callback for this HTML asset  
     * @param {string} valueChanged Name of the value that was changed 
     * @param {any} newValue Newly assigned value 
     * @param {any} previousValue Previous value (for reference)
     * @param {svgElement} _changedElement Element that was changed (typically `this`)
     * @param  {...any} _extraParameters Any extra parameters provided 
     * @private @returns {void}
     */
    _htmlAssetOnChange(valueChanged, newValue, previousValue, _changedElement, ..._extraParameters) {
        // -- determine if an array was changed, parenting updates 
        let hashIndex = valueChanged.indexOf('#');
        let arrayChanged = hashIndex >= 0;
        let arrayName = arrayChanged ? valueChanged.substring(0, hashIndex) : null;
        let arrayMethod = arrayChanged ? valueChanged.substring(hashIndex + 1) : null;
        arrayChanged = this._isValidArrayName(arrayName);
        if (arrayChanged) {
            let newArray = /** @type {svgElement[]} */ (newValue);
            let prevArray = /** @type {svgElement[]} */ (previousValue);
            let newValues = [];
            let removedValues = [];
            let oppositeArray = [];
            switch (arrayMethod) {
                case 'push':
                case 'unshift':
                    // value added, get new values and ensure they're properly parented 
                    for (let i = 0; i < newArray.length; i++) {
                        if (!prevArray.contains(newArray[i])) {
                            // newly added value 
                            newValues.push(newArray[i]);
                        }
                    }
                    newValues.forEach(element => {
                        element.parent = this;
                    });
                    break;
                case 'pop':
                case 'shift':
                    // value removed, ensure parent is removed, UNLESS it's still in the other array 
                    oppositeArray = this._getArrayByName(this._getOppositeArrayName(arrayName));
                    for (let i = 0; i < prevArray.length; i++) {
                        if (!newArray.contains(prevArray[i]) && !oppositeArray.contains(prevArray[i])) {
                            if (prevArray[i].parent == this) {
                                removedValues.push(prevArray[i]);
                            }
                        }
                    }
                    removedValues.forEach(element => {
                        element.parent = null;
                    });
                    break;
                case 'copyWithin':
                case 'fill':
                    // value(s) may be added or removed (technically copyWithin can only remove, but idc let's be safe)
                    // get new values 
                    for (let i = 0; i < newArray.length; i++) {
                        if (!prevArray.contains(newArray[i])) {
                            // newly added value 
                            newValues.push(newArray[i]);
                        }
                    }
                    // get removed values 
                    oppositeArray = this._getArrayByName(this._getOppositeArrayName(arrayName));
                    for (let i = 0; i < prevArray.length; i++) {
                        if (!newArray.contains(prevArray[i]) && !oppositeArray.contains(prevArray[i])) {
                            if (prevArray[i].parent == this) {
                                removedValues.push(prevArray[i]);
                            }
                        }
                    }
                    // assign parenting as needed 
                    newValues.forEach(element => {
                        element.parent = this;
                    });
                    removedValues.forEach(element => {
                        element.parent = null;
                    });
                    break;
            }
        } // - end determining array changes, parenting updates 
    }

    /**
     * Gets the relevant svgElement array of this asset by name 
     * @param {string} arrayName 
     * @returns {svgElement[]|null}
     * @private
     */
    _getArrayByName(arrayName) {
        switch (arrayName) {
            case _arrayNameDefinitions: return this.definitions;
            case _arrayNameShapes: return this.shapes;
        }
        return null;
    }
    /**
     * Returns true if arrayName is a valid array on this asset 
     * @param {string} arrayName 
     * @returns {boolean}
     * @private
     */
    _isValidArrayName(arrayName) {
        return (arrayName == _arrayNameDefinitions || arrayName == _arrayNameShapes);
    }
    /**
     * Gets the opposite array name from the given name (eg, `"shapes"` returns `"definitions"`)
     * @param {string} fromArrayName 
     * @returns {string}
     * @private
     */
    _getOppositeArrayName(fromArrayName) {
        switch (fromArrayName) {
            case _arrayNameDefinitions: return _arrayNameShapes;
            case _arrayNameShapes: return _arrayNameDefinitions;
        }
        return null;
    }

    /**
     * Gets the {@link svg.shape shape} found in {@linkcode shapes} 
     * (or, optionally, in {@linkcode definitions})
     * at the given index (default `0`, first)
     * @param {number} [index = 0] index to return 
     * @param {boolean} [searchDefinitions=false] 
     * search `definitions` array instead of `shapes`?
     * If the value found at the given index in `definitions`
     * is not a shape, returns `null`.
     * @returns {svg.shape|null}
     */
    GetShape(index = 0, searchDefinitions = false) {
        if (searchDefinitions) {
            let s = this.GetDefinition(index);
            if (s == null || !(s instanceof svg.shape)) { return null; }
            return s;
        }
        if (this.shapes == null || this.shapes.length <= index) { return null; }
        return this.shapes[index];
    }
    /**
     * Gets the first {@link svg.shape shape} of the given `type`
     * found in {@linkcode shapes} (or, optionally, 
     * in {@linkcode definitions})
     * @see {@linkcode svg.IsValidShapeType svgShapes.IsValidShapeType} for valid types 
     * @param {string} shapeType Shape type. See {@linkcode svg.IsValidShapeType svgShapes.IsValidShapeType} for valid types 
     * @param {boolean} [searchDefinitions=false] 
     * search `definitions` array instead of `shapes`?
     * @returns {svg.shape|null}
     */
    GetFirstShapeOfType(shapeType, searchDefinitions = false) {
        if (!svg.IsValidShapeType(shapeType)) {
            console.warn(`WARNING: can't get first shape of invalid shape type ${shapeType}`, this);
            return null;
        }
        if (searchDefinitions) {
            for (let i = 0; i < this.definitions.length; i++) {
                if (this.definitions[i] instanceof shape) {
                    let s = /** @type {svg.shape} */ (this.definitions[i]);
                    if (s.shapeType == shapeType) {
                        return s;
                    }
                }
            }
        } else {
            for (let i = 0; i < this.shapes.length; i++) {
                if (this.shapes[i].shapeType == shapeType) {
                    return this.shapes[i];
                }
            }
        }
        return null;
    }
    /**
     * Gets the first {@link svg.shape shape} with the given
     * {@linkcode svg.element.id ID} found in {@linkcode shapes}
     * (or, optionally, in {@linkcode definitions})
     * @param {string} id {@linkcode svgElement.id ID} string to check for 
     * @param {boolean} [searchDefinitions=false] 
     * search `definitions` array instead of `shapes`?
     * @returns {svg.shape|null}
     */
    GetShapeWithID(id, searchDefinitions = false) {
        if (searchDefinitions) {
            for (let i = 0; i < this.definitions.length; i++) {
                if (this.definitions[i] instanceof shape) {
                    let s = /** @type {svg.shape} */ (this.definitions[i]);
                    if (s.id == id) {
                        return s;
                    }
                }
            }
        } else {
            for (let i = 0; i < this.shapes.length; i++) {
                if (this.shapes[i].id == id) {
                    return this.shapes[i];
                }
            }
        }
        return null;
    }

    /**
     * Gets the Nth {@link svgGradient} found in 
     * {@linkcode definitions}, where N (`index`) increments 
     * through just the gradient elements found. By default,
     * returns the first gradient found. 
     * 
     * Eg, if defs contains `[gradientA, elementA, elementB, 
     * gradientB, gradientC]`, `index=1` (zero inclusive) 
     * would return the second gradient found, `gradientB`.
     * @param {number} [gradientIndex = 0] Nth gradient to return
     * @returns {svg.gradient|null}
     */
    GetGradient(gradientIndex = 0) {
        if (this.definitions == null || this.definitions.length <= gradientIndex) { return null; }
        let gradientCounter = 0;// gradients-only increment 
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i] instanceof svg.gradient) {
                let g = /** @type {svg.gradient} */ (this.definitions[i]);
                if (gradientCounter == gradientIndex) {
                    return g;
                }
                gradientCounter++;
            }
        }
        return null;
    }
    /**
     * Gets all {@linkcode svgGradient svgGradients} in this SVG asset
     * @returns {svgGradient[]}
     */
    GetAllGradients() {
        let indices = this.GetAllGradientIndices();
        let gradients = [];
        for (let i = 0; i < indices.length; i++) {
            let gradient = /** @type {svgGradient} */ (this.definitions[indices[i]]);
            gradients.push(gradient);
        }
        return gradients;
    }
    /**
     * Gets all {@linkcode svgGradient svgGradients} indices in {@linkcode definitions}
     * @returns {number[]}
     */
    GetAllGradientIndices() {
        if (this.definitions == null || this.definitions.length == 0) { return []; }
        let gradients = [];
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i] instanceof svgGradient) {
                gradients.push(i);
            }
        }
        return gradients;
    }
    /**
     * Removes the given gradient from this asset's 
     * {@linkcode definitions}, if it's found.
     * @param {svgGradient} gradient 
     */
    RemoveGradient(gradient) {
        let i = this.GetGradientIndex(gradient);
        if (i >= 0) {
            let prev = this.definitions.structuredClone();
            if (this.definitions.removeAt(i) != null) {
                this.changed('definitions#setGradient', this.definitions, prev);
            }
        }
    }
    /**
     * Removes all {@linkcode svgGradient svgGradients} 
     * from this asset's {@linkcode definitions}. 
     */
    RemoveAllGradients() {
        let gradients = this.GetAllGradients();
        for (let i = 0; i < gradients.length; i++) {
            this.RemoveGradient(gradients[i]);
        }
    }
    /**
     * Gets the index of the first {@link svgGradient}
     * found in {@linkcode definitions}, or `-1` if none are found.
     * @returns {number}
     */
    GetFirstGradientDefinitionIndex() {
        if (this.definitions == null) { return -1; }
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i] instanceof svg.gradient) {
                return i;
            }
        }
        return -1;
    }
    /**
     * Gets the first {@link svg.gradient gradient} with the given
     * {@linkcode svg.element.id ID} found in {@linkcode definitions}.
     * 
     * If not found, returns `null`
     * @param {string} id {@linkcode svgElement.id ID} string to check for 
     * @returns {svg.gradient|null}
     */
    GetGradientWithID(id) {
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i] instanceof svg.gradient &&
                this.definitions[i].id == id) {
                return /** @type {svg.gradient} */ (this.definitions[i]);
            }
        }
        return null;
    }
    /**
     * Returns the index of the given gradient if it's found in this
     * element's {@linkcode definitions}. Otherwise, returns `-1`
     * @param {svgGradient} gradient 
     * @returns {number}
     */
    GetGradientIndex(gradient) {
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i] === gradient) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Gets the {@link svg.element svgElement} found in {@linkcode definitions} 
     * at the given index (default `0`, first)
     * @param {number} [index = 0] index to return  
     * @returns {svg.element|null}
     */
    GetDefinition(index = 0) {
        if (this.definitions == null || this.definitions.length <= index) { return null; }
        return this.definitions[index];
    }
    /**
     * Gets the first {@link svg.shape element} with the given
     * {@linkcode svg.element.id ID} found in {@linkcode definitions}
     * @returns {svg.element|null}
     */
    GetDefinitionWithID(id) {
        for (let i = 0; i < this.definitions.length; i++) {
            if (this.definitions[i].id == id) {
                return this.definitions[i];
            }
        }
        return null;
    }

    /** 
     * convenience getter for first-found {@link gradient} 
     * (or `null` if no gradients are defined)
     * @see {@link GetGradient}
     * @returns {gradient|null} 
    */
    get gradient() { return this.GetGradient(0); }
    /** @param {gradient|gradient[]|string[]|null} v  */
    set gradient(v) {
        if (v == null) {
            if (svg.config.GRADIENT_SET_NULL_SETS_FILL_NULL) {
                // DPJS_TO_DO: implement GetAllSVGElementsWithProperty to find all svgs using a gradient
                // Issue URL: https://github.com/nickyonge/evto-web/issues/57
                // use GetAllSVGElementsWithProperty to find all svgs that reference the gradient 
                // as a URL, and replace them with null
                throw new Error(`Not Yet Implemented: svgHTMLAsset.gradient.set null value when SET_GRADIENT_NULL_SETS_FILL_NULL should reassign all #url(thisGradient) values to null`);
            } else { return; }
        }
        // check if actual gradient, or string, or array
        if (v instanceof svg.gradient) {
            // it's an actual gradient, assign values directly  
            let gdIndex = this.GetFirstGradientDefinitionIndex();
            if (gdIndex >= 0) {
                let g = this.GetGradient();
                if (g == v) { return; } // reassigning the same gradient, do nothing 
                let prev = this.definitions.structuredClone();
                this.definitions[gdIndex] = v;
                this.changed('definitions#setGradient', this.definitions, prev);
            } else {
                this.AddGradient(v);
            }
        } else if (Array.isArray(v)) {
            // it's an array, check if it's empty, if so, treat as null 
            v.removeNullValues();
            if (v.length == 0) { v = null; this.gradient = v; return; }
            if (typeof (v[0]) === 'string') {
                // assign string array 
                if (this.GetFirstGradientDefinitionIndex() >= 0) {
                    this.GetGradient().SetColors(v);
                } else {
                    this.NewGradient(null, false, /** @type {string[]} */(v));
                }
            } else {
                // assign gradient array 
                if (v.length == 1) {
                    // single asset, just pass in directly
                    this.gradient = v[0];
                    return;
                }
                this.RemoveAllGradients();

            }
        } else if (typeof v === 'string') {
            // it's a string 
            if (this.GetFirstGradientDefinitionIndex() >= 0) {
                this.GetGradient().SetColors(v);
            } else {
                this.NewGradient(null, false, v);
            }
        } else {
            console.warn("WARNING: can't set gradient, can't parse type, should be svgGradient, string[] of colors, or single color string", v, this);
        }
    }

    /** 
     * add a {@link svg.shape shape} to shapes array (recommend using another shape; 
     * else, must manually assign `type`) @param {shape} shape 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddShape(shape, asDefinition = false) { this.#PushShape(shape, asDefinition); return shape; }
    NewShape(fill = svg.defaults.FILL, asDefinition = false) {
        let shape = new svg.shape(fill);
        this.#PushShape(shape, asDefinition); return shape;
    }
    DefaultShape(asDefinition = false) { return this.NewShape(svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.rect rect} to shapes array @param {rect} rect 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddRect(rect, asDefinition = false) { this.#PushShape(rect, asDefinition); return rect; }
    NewRect(x = svg.defaults.X, y = svg.defaults.Y, width = svg.defaults.WIDTH, height = svg.defaults.HEIGHT, fill = svg.defaults.FILL, asDefinition = false) {
        let rect = new svg.rect(x, y, width, height, fill);
        this.#PushShape(rect, asDefinition); return rect;
    }
    DefaultRect(asDefinition = false) { return this.NewRect(svg.defaults.X, svg.defaults.Y, svg.defaults.WIDTH, svg.defaults.HEIGHT, svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.circle circle} to shapes array @param {circle} circle 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddCircle(circle, asDefinition = false) { this.#PushShape(circle, asDefinition); return circle; }
    NewCircle(r = svg.defaults.R, cx = svg.defaults.CX, cy = svg.defaults.CY, fill = svg.defaults.FILL, asDefinition = false) {
        let circle = new svg.circle(r, cx, cy, fill);
        this.#PushShape(circle, asDefinition); return circle;
    }
    DefaultCircle(asDefinition = false) { return this.NewCircle(svg.defaults.R, svg.defaults.CX, svg.defaults.CY, svg.defaults.FILL, asDefinition); };
    /** 
     * add an {@link svg.ellipse ellipse} to shapes array @param {ellipse} ellipse 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddEllipse(ellipse, asDefinition = false) { this.#PushShape(ellipse, asDefinition); return ellipse; }
    NewEllipse(rx = svg.defaults.ELLIPSE_RX, ry = svg.defaults.ELLIPSE_RY, cx = svg.defaults.CX, cy = svg.defaults.CY, fill = svg.defaults.FILL, asDefinition = false) {
        let ellipse = new svg.ellipse(rx, ry, cx, cy, fill);
        this.#PushShape(ellipse, asDefinition); return ellipse;
    }
    DefaultEllipse(asDefinition = false) { return this.NewEllipse(svg.defaults.ELLIPSE_RX, svg.defaults.ELLIPSE_RY, svg.defaults.CX, svg.defaults.CY, svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.line line} to shapes array @param {line} line 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddLine(line, asDefinition = false) { return this.#PushShape(line, asDefinition); return line; }
    NewLine(x1 = svg.defaults.X1, y1 = svg.defaults.Y1, x2 = svg.defaults.X2, y2 = svg.defaults.Y2, fill = svg.defaults.FILL, asDefinition = false) {
        let line = new svg.line(x1, y1, x2, y2, fill);
        this.#PushShape(line, asDefinition); return line;
    }
    DefaultLine(asDefinition = false) { return this.NewLine(svg.defaults.X1, svg.defaults.Y1, svg.defaults.X2, svg.defaults.Y2, svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.polyline polyline} to shapes array @param {polyline} polyline 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddPolyline(polyline, asDefinition = false) { this.#PushShape(polyline, asDefinition); return polyline; }
    NewPolyline(points = svg.defaults.POINTS, fill = svg.defaults.FILL, asDefinition = false) {
        let polyline = new svg.polyline(points, fill);
        this.#PushShape(polyline, asDefinition); return polyline;
    }
    DefaultPolyline(asDefinition = false) { return this.NewPolyline(svg.defaults.POINTS, svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.polygon polygon} to shapes array @param {polygon} polygon 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddPolygon(polygon, asDefinition = false) { this.#PushShape(polygon, asDefinition); return polygon; }
    NewPolygon(points = svg.defaults.POINTS, fill = svg.defaults.FILL, asDefinition = false) {
        let polygon = new svg.polygon(points, fill);
        this.#PushShape(polygon, asDefinition); return polygon;
    }
    DefaultPolygon(asDefinition = false) { return this.NewPolygon(svg.defaults.POINTS, svg.defaults.FILL, asDefinition); };
    /** 
     * add a {@link svg.path path} to shapes array @param {path} path 
     * @param {boolean} [asDefinition=false] add the shape to SVG `<defs>`? */
    AddPath(path, asDefinition = false) { this.#PushShape(path, asDefinition); return path; }
    NewPath(d = svg.defaults.D, fill = svg.defaults.FILL, asDefinition = false) {
        let path = new svg.path(d, fill);
        this.#PushShape(path, asDefinition); return path;
    }
    DefaultPath(asDefinition = false) { return this.NewPath(svg.defaults.D, svg.defaults.FILL, asDefinition); };

    /** 
     * Create and add a new {@link svg.gradient gradient} 
     * to the {@linkcode definitions} array
     * 
     * @param {string} [id=undefined] Unique identifier for this element (see {@linkcode svgElement.id}). If blank/omitted, sets to {@linkcode svgElement.uniqueID}. 
     * @param {boolean} isRadial is this a radial gradient, or linear? Default `GRADIENT_ISRADIAL`
     * @param {spreadString} colors Array/values of colors used to create this array 
     * @returns {svg.gradient} The newly-created, newly-added gradient
     * */
    NewGradient(id = undefined, isRadial = svg.defaults.GRADIENT_ISRADIAL, ...colors) {
        let gradient = svgGradient.fullParams(id, isRadial, ...colors);
        let prev = this.#_definitions;
        this.definitions.push(gradient);
        this.gradient.parent = this;
        if (!this.definitions.hasOwnProperty('onChange')) {
            this.changed('definitions#push', this.definitions, prev);
        }
        return gradient;
    }
    /**
     * Add the given {@link svg.gradient gradient} 
     * to the {@linkcode definitions} array
     * @param {svg.gradient} [gradient] Pre-existing gradient to import
     * @returns {svg.gradient} The now-added gradient
     */
    AddGradient(gradient) {
        let prev = this.#_definitions;
        this.definitions.push(gradient);
        gradient.parent = this;
        if (!this.definitions.hasOwnProperty('onChange')) {
            this.changed('definitions#push', this.definitions, prev);
        }
        return gradient;
    }
    /**
     * Adds all the given svgGradients
     * @param {svgGradient[]} gradients 
     */
    AddGradients(gradients) {
        for (let i = 0; i < gradients.length; i++) {
            this.AddGradient(gradients[i]);
        }
    }

    /**
     * Local ref to push a shape/element to {@link shapes} or {@link definitions}
     * @param {svgShape|svgDefinition} shapeDef {@link svgShape} or {@link svgDefinition} to push
     * @param {boolean} [asDefinition=false] Push this shape as a definition? Default `false`
     */
    #PushShape(shapeDef, asDefinition = false) {
        let prev;
        // storeInDefsElement has made "shapes" as separate elements redundant tbh 
        shapeDef.storeInDefsElement = asDefinition;
        if (asDefinition) {
            prev = this.#_definitions;
            this.definitions.push(shapeDef);
            if (shapeDef.hasOwnProperty('parent')) { shapeDef.parent = this; }
            if (!this.definitions.hasOwnProperty('onChange')) {
                this.changed('definitions#push', this.definitions, prev);
            }
        }
        else {
            prev = this.#_shapes;
            this.shapes.push(shapeDef);
            if (shapeDef.hasOwnProperty('parent')) { shapeDef.parent = this; }
            if (!this.shapes.hasOwnProperty('onChange')) {
                this.changed('shapes#push', this.shapes, prev);
            }
        }
    }

    /** Generate a basic rectangle with a gradient of the given colors, with all default values.
     * @param  {spreadString} [colors] Optional array of colors to generate the gradient with
     * @returns {svg.htmlAsset} new instance of {@linkcode svg.htmlAsset svgHTMLAsset}
     * @see {@linkcode svg.generator.BasicGradientRect svgGenerator.BasicGradientRect}, which this static method calls */
    static BasicGradientRect(...colors) {
        return svg.generator.BasicGradientRect(...colors);
    }
}
const _arrayNameDefinitions = 'definitions';
const _arrayNameShapes = 'shapes';

/** Used to define viewbox properties in the SVG HTML element */
export class svgViewBox extends svg.element {
    get x() { return this.#_x; }
    set x(v) { let prev = this.#_x; this.#_x = v; this.changed('x', v, prev); }
    #_x = svg.defaults.X;
    get y() { return this.#_y; }
    set y(v) { let prev = this.#_y; this.#_y = v; this.changed('y', v, prev); }
    #_y = svg.defaults.Y;
    get width() { return this.#_width; }
    set width(v) { let prev = this.#_width; this.#_width = v; this.changed('width', v, prev); }
    #_width = svg.defaults.WIDTH;
    get height() { return this.#_height; }
    set height(v) { let prev = this.#_height; this.#_height = v; this.changed('height', v, prev); }
    #_height = svg.defaults.HEIGHT;
    constructor(x = svg.defaults.X, y = svg.defaults.Y, width = svg.defaults.WIDTH, height = svg.defaults.HEIGHT) {
        if (x == null) { x = svgDefaults.X; }
        if (y == null) { y = svgDefaults.Y; }
        if (width == null) { width = svgDefaults.WIDTH; }
        if (height == null) { height = svgDefaults.HEIGHT; }
        super();
        this.x = x; this.y = y; this.width = width; this.height = height;
    }
    get html() { return `viewBox="${this.data}"`; }
    get data() { return `${this.x} ${this.y} ${this.width} ${this.height}`; }
}