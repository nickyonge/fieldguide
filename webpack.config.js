/* WEBPACK TEMPLATE SETUP 
 * webpack.config.js
 * 
 * All the steps for getting a new webpack-based website started via VS Code! 
 * 
 * This script itself is a file called webpack.config.js and is used to tell Webpack how to build your site.
 * Start with the prerequisites below! 
 * 
 *  --- PREREQUISITES --- 
   - Install VS Code, https://code.visualstudio.com
   - Install Node.js, https://www.nodejs.org
        Note: During installation, you should generally allow the installer to set up other packages like Chocolatey
        If a popup appears installing additional tools, just keep Pressing Any Key until the installation is complete.
        Helpful but optional: Node.js tutorial for VS Code: https://code.visualstudio.com/docs/nodejs/nodejs-tutorial
   - Create your directory folder,
        "My Website That Is Cool And Going To Change The World For Everyone For The Better",
        and place this file in it. Open it up in VS Code
   - You're good to go!
 * 
 * 
 *  --- SHORT SUMMARY --- 
 * 
 * Once prereqs are fulfilled, and this file (webpack.config.js) is placed in a new directory: 
 * 
 * 1: Run the following three terminal commands:         (use Ctrl + ` / Cmd + ` to open the terminal)
        npm init -y
 *          (If you get error text saying "The term 'npm' is not recognized", ensure node.js is installed)
        npm i webpack webpack-cli webpack-dev-server webpack-remove-empty-scripts css-loader html-webpack-plugin mini-css-extract-plugin postcss-loader --save-dev
        npm i typescript jquery --save
 * 2: Add the following values to package.json's "scripts":{} array:
        "start": "webpack serve --open",
        "start:dev": "webpack serve --mode=development --open",
        "start:prod": "webpack serve --mode=production --open",
        "build": "webpack --mode=production",
        "preview": "npx http-server dist"
 *         (package.json will be auto-created in your parent directory. You'll find the scripts array 
 *         inside it with a few values prepopulated - just copy+paste these!)
 * 3: Fill out the values in the Config region of this file, below
        PRODUCTION_BUILD should be while you're in development mode 
        SITE_TITLE should be the name of your beautiful new website
        SRC_FOLDER, OUTPUT_FOLDER, and INDEX_FILE should be left "src", "dist", and "./js/index.js", respectively
 * 
 *       Done! Run command "npm start" to get underway
 *       Consider starting by making a src/ directory and index.js inside of it (steps 9/10 in the detailed instructions below)
 *          (Remember to uncomment the "entry" module rule on line 102) 
 * 
 
 *  --- DETAILED STEPS --- 
 *    with terminal cmds
 * 
 * 1: Create new folder (project, vscode workspace, github repo, etc), and place this file in it
 * 2: install npm
        npm init -y
 * 3: initialize webpack and its CLI as dev dependencies 
        npm install webpack webpack-cli --save-dev
 * 4: initialize webpack dev server as a dev dependencies, for local testing at url "localhost:8080"
        npm install webpack-dev-server --save-dev
 * 5: initialize HTML Webpack Plugin as a dev dependency, to auto-generate .html files in ./dist folder upon build 
        npm install html-webpack-plugin --save-dev
 * 6: add the following values to package.json's "scripts": {} array
        "start": "webpack serve --open",
        "start:dev": "webpack serve --mode=development --open",
        "start:prod": "webpack serve --mode=production --open",
        "build": "webpack --mode=production",
        "preview": "npx http-server dist"
 *          to enable terminal commands "npm run build" and "npm run start", respectively 
 * 7: Optionally, prep CSS loader, PostCSS loaders and Mini CSS Extract Plugin, all as dev dependencies, to import/export .css files from ./src
        npm install css-loader postcss-loader mini-css-extract-plugin --save-dev
 *          If not doing this step, you can remove CSS / mini plugin references from this file 
 *          Note: We're using mini-css-extract-plugin instead of style-loader to control CSS file output 
 * 8: Optionally, import the JQuery and TypeScript libraries, 
        npm install jquery typescript
 *          Note: Omit the --save-dev! These aren't dev-only dependencies.
 *          If not doing this step, you can remove the JQuery references from this file. 
 * 9: create a ./src subfolder with a /js subfolder, and inside it, a file called index.js 
 * 10: Fill out the values in the Config region of this file, below
        PRODUCTION_BUILD should be while you're in development mode 
        SITE_TITLE should be the name of your beautiful new website
        SRC_FOLDER and INDEX_FILE should be left "src" and "./js/index.js", respectively
 * 
 * 
 * 
 *      Done! Now go make a beautiful website.
 *          Use command "npm start" :) 
 * 
 * 
 * If you want even more details, here's Webpack's official Getting Started guide: 
 * https://webpack.js.org/guides/getting-started/
 *
 * by Nick Yonge
 * https://gist.github.com/nickyonge/bb9fe46458c16e1cd560bce505e4af39
*/

// tutorial complete~
// done? consider deleting the above tutorial section, or moving it to the end of this file.
// you may end up modifying webpack config quite a bit! might as well have the content up top.

// https://webpack.js.org/configuration/

// #region Config 

/** Export webpack bundle in Production mode, or Development? 
 * - **Note:** Remember to close & restart Webpack if changed, via `npm start` 
 * @see {@linkcode environment} for runtime mode detection @type {boolean} */
const PRODUCTION_BUILD = false;

/** Your site title; the text that will appear in the browser tab. @type {string} */
const SITE_TITLE = 'Duck Pond Field Guide';

/** Name of your source code folder. It should be in the same directory as `webpack.config.js` 
 * itself. Don't put `webpack.config.js` *in* the source folder. @type {string} */
const SRC_FOLDER = 'src';

/** Name of the folder where build output will be exported. @type {string} */
const OUTPUT_FOLDER = 'dist';

/** Filepath of your index script, relative to 
 * {@linkcode SRC_FOLDER}. Must begin with `./` or `/`. @type {string} */
const INDEX_FILE = './js/index.js';

// #endregion Config 

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');

/** 
 * Defines the runtime build environment
 * 
 * To determine what the current environment is in your codebase, use:  
 * `process.env.NODE_ENV`  
 * which will return a string matching either `"production"` or 
 * `"development"`, depending on the value of {@linkcode PRODUCTION_BUILD}.
   @example
   const _env = process.env.NODE_ENV;
   const isDevBuild = _env === 'development';
   if (isDevBuild) { 
       // Do secret sneaky dev-only stuff here! 
   }
 */
const environment = PRODUCTION_BUILD ? 'production' : 'development';

module.exports = () => {

    return {

        // set the runtime build environment 
        mode: environment,

        // reference to src folder build path 
        context: path.resolve(__dirname, SRC_FOLDER),

        entry: { // initial script to begin generating runtime webpage from
            index: INDEX_FILE,
        },
        plugins: [
            // define webpack plugins here 
            new RemoveEmptyScriptsPlugin(),
            new HtmlWebpackPlugin({
                title: SITE_TITLE,
            }),
            new MiniCssExtractPlugin({
                filename: '[name].css',
                chunkFilename: '[name].css',
                runtime: false,
            }),
        ],

        // enable inline source mapping, so we can see lines/error info in browser console output
        devtool: PRODUCTION_BUILD ? 'source-map' : 'eval-cheap-source-map', // see: https://webpack.js.org/guides/development/#using-source-maps
        // for prod builds, either use 'source-map' (full sourcemap in separate file, unsecure but easy live debugging) or false (no sourcemap included)
        // see: https://webpack.js.org/configuration/devtool/#devtool

        // enable webpack dev server so we can locally test 
        // run: npm install webpack-dev-server --save
        // remember to also add check "optimization" at bottom
        // see: https://webpack.js.org/guides/development/#using-webpack-dev-server
        devServer: {
            static: OUTPUT_FOLDER,
        },

        module: {
            rules: [

                // Jquery 
                {
                    test: require.resolve("jquery"),
                    loader: "expose-loader",
                    options: {
                        exposes: ["$", "jQuery"],
                    },
                },

                // CSS loading 
                {
                    test: /\.(sc|c)ss$/i,
                    use: [
                        MiniCssExtractPlugin.loader, // extract css to subfolder 
                        'css-loader',
                        'postcss-loader',
                        // 'sass-loader',
                        // 'style-loader',
                    ],
                },

                // Images asset loading
                {
                    test: /\.(png|svg|jpg|jpeg|gif)$/i,
                    type: 'asset/resource',
                },

                // Fonts asset loading
                {
                    test: /\.(woff|woff2|eot|ttf|otf)$/i,
                    type: 'asset/resource',
                },

            ],
        },

        output: {
            filename: '[name].bundle.js',
            path: path.resolve(__dirname, OUTPUT_FOLDER),
            assetModuleFilename: '[path][name][ext]',
            clean: true,
        },

        // build time optimization, see https://webpack.js.org/guides/development/#using-webpack-dev-server 
        optimization: {
            runtimeChunk: false,
            splitChunks: {
                cacheGroups: {
                    styles: {
                        name: 'styles',
                        type: 'css/mini-extract', // use type, not test 
                        chunks: 'all',
                        enforce: true,
                    },
                },
            },
            removeEmptyChunks: true,
        },
    };
};
