import type { pathNode as _pathNode } from './src/js/assetExporter';
import { _baseNode } from '../js/assetExporter';
import { EnsureColorValid, ColorToRGBA, ColorToHex, ColorToArray, ToPercentage, Round, Ceil, Floor, RoundWith, RoundOps } from '../js/lilutils';
import { svgXYWHDefinition } from '../js/svg';

declare global {

    /**
     * Any type of node created via `nestedPath` in `assetExporter.js`
     * 
     * Node types, for reference:  
     * - {@linkcode nestedNode}: node with both a {@linkcode _baseNode.URL URL} and {@linkcode _baseNode.Children Children} 
     * - {@linkcode containerNode}: node with no {@linkcode _baseNode.URL URL} but with {@linkcode _baseNode.Children Children} 
     * - {@linkcode leafNode}: node with a {@linkcode _baseNode.URL URL} but no {@linkcode _baseNode.Children Children} 
     * - {@linkcode deadNode}: node with neither a {@linkcode _baseNode.URL URL} nor {@linkcode _baseNode.Children Children} 
     * @param {string} URL Filepath URL to the given asset, eg `assets/png/myImage.png' 
     * @param {string[]} Children Array of nodes, by name reference, childed to this node
     */
    declare type pathNode = _pathNode;

    /**
     * CSS-valid color string. Can technically by any string value, but this type implies it should be a color. 
     * but intended to be a CSS appropriate color. 
     * @see {@linkcode EnsureColorValid} to check if a string value is a valid color 
     * @see {@linkcode ColorToRGBA}, {@linkcode ColorToHex}, and {@linkcode ColorToArray} for usable type conversion 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/color
     */
    declare type color = string;

    /**
     * Number that is intended to be an integer.
     * - **Note:** Documentation only; not enforced. 
     * @see {@linkcode Round}, {@linkcode Ceil}, {@linkcode Floor}, {@linkcode RoundWith}, and {@linkcode RoundOps} in `lilutils.js`
     */
    declare type integer = number;

    /**
     * The `<blend-mode>` CSS data type describes how colors should appear when 
     * elements overlap. If unspecified, the default value is typically `normal`. 
     * - **Note:** remember that the attribute name must be `"blend-mode"`, 
     * not `"blendMode"`,  `"BlendMode"`, or any other alternative spelling. 
     * @see {@linkcode BlendMode BlendMode} The type declaration 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/blend-mode
     */
    declare enum BlendMode {
        /** The final color is the top color, regardless of what the bottom color is. The effect is like two opaque pieces of paper overlapping. */
        Normal = 'normal',
        /** The final color is the result of multiplying the top and bottom colors. A black layer leads to a black final layer, and a white layer leads to no change. The effect is like two images printed on transparent film overlapping. */
        Multiply = 'multiply',
        /** The final color is the result of inverting the colors, multiplying them, and inverting that value. A black layer leads to no change, and a white layer leads to a white final layer. The effect is like two images shining onto a projection screen. */
        Screen = 'screen',
        /** The final color is the result of {@linkcode Multiply multiply} if the bottom color is darker, or {@linkcode Screen screen} if the bottom color is lighter. This blend mode is equivalent to {@linkcode HardLight hard-light} but with the layers swapped. */
        Overlay = 'overlay',
        /** The final color is composed of the darkest values of each color channel. */
        Darken = 'darken',
        /** The final color is composed of the lightest values of each color channel. */
        Lighten = 'lighten',
        /** The final color is the result of dividing the bottom color by the inverse of the top color. A black foreground leads to no change. A foreground with the inverse color of the backdrop leads to a fully lit color. This blend mode is similar to {@linkcode Screen screen}, but the foreground only needs to be as light as the inverse of the backdrop to create a fully lit color. */
        ColorDodge = 'color-dodge',
        /** The final color is the result of inverting the bottom color, dividing the value by the top color, and inverting that value. A white foreground leads to no change. A foreground with the inverse color of the backdrop leads to a black final image. This blend mode is similar to {@linkcode Multiply multiply}, but the foreground only needs to be as dark as the inverse of the backdrop to make the final image black. */
        ColorBurn = 'color-burn',
        /** The final color is the result of {@linkcode Multiply multiply} if the top color is darker, or {@linkcode Screen screen} if the top color is lighter. This blend mode is equivalent to overlay but with the layers swapped. The effect is similar to shining a harsh spotlight on the backdrop. */
        HardLight = 'hard-light',
        /** The final color is similar to {@linkcode HardLight hard-light}, but softer. This blend mode behaves similar to {@linkcode HardLight hard-light}. The effect is similar to shining a diffused spotlight on the backdrop. */
        SoftLight = 'soft-light',
        /** The final color is the result of subtracting the darker of the two colors from the lighter one. A black layer has no effect, while a white layer inverts the other layer's color. */
        Difference = 'difference',
        /** The final color is similar to {@linkcode Difference difference}, but with less contrast. As with {@linkcode Difference difference}, a black layer has no effect, while a white layer inverts the other layer's color. */
        Exclusion = 'exclusion',
        /** The final color has the *hue* of the top color, while using the *saturation* and *luminosity* of the bottom color. */
        Hue = 'hue',
        /** The final color has the *saturation* of the top color, while using the *hue* and *luminosity* of the bottom color. A pure gray backdrop, having no saturation, will have no effect. */
        Saturation = 'saturation',
        /** The final color has the *hue* and *saturation* of the top color, while using the *luminosity* of the bottom color. The effect preserves gray levels and can be used to colorize the foreground. */
        Color = 'color',
        /** The final color has the *luminosity* of the top color, while using the *hue* and *saturation* of the bottom color. This blend mode is equivalent to {@linkcode Color color}, but with the layers swapped. */
        Luminosity = 'luminosity',
    };

    /**
     * The `<blend-mode>` CSS data type describes how colors should appear when 
     * elements overlap. If unspecified, the default value is typically `normal`. 
     * - **Note:** remember that the attribute name must be `"blend-mode"`, 
     * not `"blendMode"`,  `"BlendMode"`, or any other alternative spelling. 
     * @see {@linkcode BlendMode} The enum object containing string literal references 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/blend-mode
     */
    declare type BlendMode = BlendMode |
        'normal' | 'multiply' | 'screen' | 'overlay' |
        'darken' | 'lighten' | 'color-dodge' | 'color-burn' |
        'hard-light' | 'soft-light' | 'difference' | 'exclusion' |
        'hue' | 'saturation' | 'color' | 'luminosity';

    /**
     * SVG CSS value used to specify one, or optionally two, paired numbers. 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Content_type#number-optional-number
     */
    declare type cssNumberOptionalNumber = number | [number, number?];
    /**
     * SVG CSS value used to specify one, or optionally two, paired {@link integer integers}. 
     * - **Note:** Integer value is documentation only; not enforced. 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Content_type#number-optional-number
     */
    declare type cssIntegerOptionalInteger = cssNumberOptionalNumber;

    /**
     * SVG List-Of-Numbers value, based on the SVG type List-of-Ts. 
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Guides/Content_type#list-of-ts
     */
    declare type cssNumberListOfNumbers = number | number[];

    /** Single-char string representing one of the RGBA channels */
    declare type cssRGBA = 'R' | 'G' | 'B' | 'A';

    /**
     * The `preserveAspectRatio` SVG CSS attribute indicates how an element with a viewBox 
     * providing a given aspect ratio must fit into a viewport with a different aspect ratio. 
     * 
     * Syntax: `preserveAspectRatio="<align> [<meet or slice>]"`
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio 
     */
    declare type cssPreserveAspectRatio = 'none' | `x${'Min' | 'Mid' | 'Max'}Y${'Min' | 'Mid' | 'Max'} ${'meet' | 'slice'}`;

    /** 
     * Provides support for configuration of the Cross-Origin 
     * Resource Sharing (CORS) requests for the element's fetched data.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/crossorigin 
     */
    declare type cssCrossorigin = 'anonymous' | 'use-credentials' | '';

    /** 
     * String-number formatted `"N%"` where `N` is any number. 
     * @see {@linkcode ToPercentage} for `number` conversion. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/percentage 
     */
    declare type percentage = `${number}%`;
    /**
     * String-number formatted `"N%"` where `N` is any number. 
     * - **Note:** Identical to {@linkcode percentage}, 
     * only exists for convenience and type naming consistency. 
     * @see {@linkcode ToPercentage} for `number` conversion. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/percentage 
     */
    declare type cssPercentage = percentage;
    /** 
     * Common CSS data type representing a distance value. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length 
     */
    declare type cssLength = `${cssLengthUnits}${number}`;
    /**
     * CSS data type that can either be a {@linkcode cssLength length} or {@linkcode cssPercentage percentage}. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length-percentage
     */
    declare type cssLengthPercentage = cssPercentage | cssLength;

    /** All prefixes before viewport-specific CSS lengths. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport */
    type cssLengthViewportPrefix = '' | 's' | 'l' | 'd';
    /** All viewport-specific CSS length units. 
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length#relative_length_units_based_on_viewport */
    type cssLengthViewportValues = 'vh' | 'vw' | 'vmax' | 'vmin' | 'vb' | 'vi';
    /** All possible unit values for CSS lengths */
    type cssLengthUnits = 'px' | 'cm' | 'mm' | 'Q' | 'in' | 'pc' | 'pt' | 'cap' |
        'ch' | 'em' | 'ex' | 'ic' | 'lh' | 'rcap' | 'rch' | 'rem' | 'rex' |
        'ric' | 'rlh' | `${cssLengthViewportPrefix}${cssLengthViewportValues}` |
        'cqw' | 'cqh' | 'cqi' | 'cqb' | 'cqmin' | 'cqmax';

    /**
     * Used in {@linkcode svgXYWHDefinition}. Determines which values 
     * between {@linkcode svgXYWHDefinition.x}, {@linkcode svgXYWHDefinition.y | .y}, 
     * {@linkcode svgXYWHDefinition.width | .width}, and {@linkcode svgXYWHDefinition.height | .height} 
     * are included on {@linkcode svgXYWHDefinition.html html} export. 
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
     */
    declare type xywhInclusion = boolean | 'all' | 'xyOnly' | 'whOnly' | 'widthHeight' | 'widthHeightOnly' | `${'x' | ''}${'y' | ''}${'w' | ''}${'h' | ''}` | 'width' | 'height' | `none`;
}

export { };