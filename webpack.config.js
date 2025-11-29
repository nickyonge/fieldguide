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
 * 1: Run the following terminal commands:         (use Ctrl+` / Cmd+` to open the terminal)
        npm init -y
            (If you get error text saying "The term 'npm' is not recognized", ensure node.js is installed)
        npm install webpack webpack-cli --save
        npm install html-webpack-plugin --save
        npm install webpack-dev-server --save
        npm install style-loader css-loader postcss-loader --save
        npm install jquery --save
 * 2: Add the following values to package.json's "scripts":{} array:
        "watch": "webpack --watch",
        "start": "webpack serve --open",
        "build": "webpack"
            (package.json will be auto-created in your parent directory. You'll find the scripts array 
            inside it with a few values prepopulated - just copy+paste these!)
 * 3: Uncomment the JQuery and CSS { sections } of the module: {rules: { ... }} below
            (This step is optional, but recommended as JQuery and CSS are very popular webdev resources)
            (There are also modules for loading fonts and images you can use too <3 )
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
 * 3: initialize webpack
        npm install webpack webpack-cli --save
 * 4: initialize html webpack plugin, to auto-generate .html files in ./dist folder upon build 
        npm install html-webpack-plugin --save
 * 5: initialize webpack dev server, for local testing at url "localhost:8080" (while watching)
        npm install webpack-dev-server --save
 * 6: add the following values to package.json's "scripts": {} array
        "build": "webpack",
        "start": "webpack serve --open",
        "watch": "webpack --watch",
 *          to enable terminal commands "npm run build" and "npm run watch", respectively 
 * 7: optionally, prep CSS loader, to import .css files from ./src
        npm install style-loader css-loader postcss-loader --save
 *          then uncomment the CSS { section } from module rules below
 * 8: optionally, import the JQuery library, 
        npm install jquery --save
 *          then uncomment the JQuery { section } from module rules below
 * 9: create a ./src subfolder, and inside it, a file called index.js
 * 10: uncomment the line "index: './src/index.js'," under entry { } below
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

const HtmlWebpackPlugin = require('html-webpack-plugin');      // const reference to webpack's html plugin
const path = require('path');                                  // const convenience reference to the local filepath

module.exports = {

    //                                                  set export mode
    // mode: 'production',
    mode: 'development',

    // enable Watch Mode (auto refresh changes), 
    watch: true, // see: https://webpack.js.org/guides/development/#using-watch-mode

    entry: { //                                         entry: place to begin generating webpage from
        // index: './src/index.js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            //                                          webpage title here
            title: 'New Website',
        }),
    ],

    // enable inline source mapping, so we can see lines/error info in browser console output
    devtool: 'inline-source-map', // see: https://webpack.js.org/guides/development/#using-source-maps

    // enable webpack dev server so we can locally test 
    // run: npm install webpack-dev-server --save
    // remember to also add check "optimization" at bottom
    // see: https://webpack.js.org/guides/development/#using-webpack-dev-server
    devServer: {
        static: './dist',
    },

    module: {
        rules: [
            //                                          module rules (with some presets)

            // Jquery (requires library): npm install jquery --save
            // { 
            //     test: require.resolve("jquery"),
            //     loader: "expose-loader",
            //     options: {
            //         exposes: ["$", "jQuery"],
            //     },
            // },

            // CSS (requires loader): npm install style-loader css-loader postcss-loader --save
            // {
            //     test: /\.css$/i,
            //     use: ['style-loader', 'css-loader', 'postcss-loader'],
            // },

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
        path: path.resolve(__dirname, 'dist'),
        clean: true,
    },
    // build time optimization, see https://webpack.js.org/guides/development/#using-webpack-dev-server 
    optimization: {
        runtimeChunk: 'single',
    },
};