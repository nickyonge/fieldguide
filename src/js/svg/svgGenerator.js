import { isBlank, StringAlphanumericOnly } from "../lilutils";
import * as svg from './index';
import { htmlAsset, gradient } from "./index";

const FANCYBOX_MAX_SPLITS = 3;
const FANCYBOX_FIRST_SPLIT_IS_BASE = true;

/** Generate a basic rectangle with a gradient of the given colors, with all default values.
 * @param  {spreadString} [colors] Optional array of colors to generate the gradient with
 * @returns {svg.htmlAsset} new instance of {@linkcode svg.htmlAsset svgHTMLAsset} */
export function BasicGradientRect(...colors) {
    if (colors == null || !Array.isArray(colors)) { colors = []; }
    colors.removeNullValues();
    if (colors.length == 0) { colors = svg.gradient.templates.softrainbow; }
    let svgAsset = new htmlAsset();
    svgAsset.NewRect(svg.defaults.X, svg.defaults.Y, svg.defaults.WIDTH, svg.defaults.HEIGHT, svgAsset.NewGradient(null, svg.defaults.GRADIENT_ISRADIAL, ...colors).idURL);
    return svgAsset;
}

export class svgFancyBox {
    // TODO: convert svgFancyBox to SVG pattern generation, not its own weird pseudo-shape type 
    // Issue URL: https://github.com/nickyonge/evto-web/issues/53
    x;
    y;
    width;
    height;

    splitCount = 0;//0 to FANCYBOX_MAX_SPLITS
    angle = 0;// -1 to 1
    waveCount = 0;// 0 to 
    waveHeight = 0.5;
    waveFlip = false;
    horizontal = true;

    get ds() {

        if (this.splitCount < 0 || this.splitCount > FANCYBOX_MAX_SPLITS) {
            console.warn(`WARNING: invalid split count ${this.splitCount}, must be between 0 and ${FANCYBOX_MAX_SPLITS} (inclusive), returning null`);
            return null;
        }

        if (this.splitCount == 0) {
            return [BoxPath(this.x, this.y, this.width, this.height)];
        }

        let ds = [];

        // local reference functions to convert fractions to appropriate width/height 
        function w(value) { return this.width * value; }
        function h(value) { return this.height * value; }

        // iterate through split count
        for (let i = 0; i <= this.splitCount; i++) {
            if (FANCYBOX_FIRST_SPLIT_IS_BASE && i == 0) {
                // first path, generate full basic SVG
                ds.push(BoxPath(this.x, this.y, this.width, this.height));
                continue;
            }
            let interval = i / this.splitCount + 1;// eg, 1 split should be at 50%, 2 at 33% and 66%, etc
            let steps = [`M${this.horizontal ? `0,${h(0.5)}` : `${w(0.5)},0`}`];
            // draw line
            steps.push(`L${w(1)},${h(0.5)}`);
            // combine and push
            ds.push(steps.join(' '));
        }
        // return
        return ds;
    }
}

/**
 * Create a `d` attribute {@link svg.path path} making up a rectangle 
 * @see {@link svg.rect}
 * @param {number} x {@link svg.defaults.X}
 * @param {number} y {@link svg.defaults.Y}
 * @param {number} width {@link svg.defaults.WIDTH}
 * @param {number} height {@link svg.defaults.HEIGHT}
 * @param {boolean} [relativeStart=false] If false, start `d` path with an `M` command; if true, `m`
 * @param {boolean} [closePath=true] End `d` path with a `Z` command?
 * @returns {string} Path `d` attribute for a rectangle of the given parameters
 */
export function BoxPath(x = svg.defaults.X, y = svg.defaults.Y, width = svg.defaults.WIDTH, height = svg.defaults.HEIGHT,
    relativeStart = false, closePath = true) {
    return `${relativeStart ? 'm' : 'M'}${x},${y} h${width} v${height} h${-width} ${closePath ? 'Z' : `v${-height}`}`;
}

