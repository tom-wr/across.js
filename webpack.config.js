const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const WebpackChunkHash = require('webpack-chunk-hash');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const useDevServer = false;
const publicPath = useDevServer ? 'http://localhost:8080/build/' : '/build/';
const isProduction = process.env.NODE_ENV === 'production';
const useSourceMaps = !isProduction;
const useVersioning = true;

const styleLoader = {
    loader: 'style-loader',
    options: {
        sourceMap: useSourceMaps
    }
};

const cssLoader = {
    loader: 'css-loader',
    options: {
        sourceMap: useSourceMaps,
        minimize: isProduction
    }
};

// sourceMap option for resolve-url-loader
const sassLoader = {
    loader: 'sass-loader',
    options: {
        sourceMap: true
    }
};

// fix @import file paths
const resolveUrlLoader = {
    loader: 'resolve-url-loader',
    options: {
        sourceMap: useSourceMaps
    }
};

const webpackConfig = {
    entry: {
        cross: './assets/js/cross'
    },
    output: {
        path: path.resolve(__dirname, 'web', 'build'),
        filename: useVersioning ? '[name].[chunkhash:6].js' : '[name].js',
        publicPath: publicPath
    },
    watch: true,
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        cacheDirectory: true
                    }
                }
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        cssLoader
                    ],
                    // use this if CSS isn't extracted
                    fallback: styleLoader
                })
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    use: [
                        cssLoader,
                        resolveUrlLoader,
                        sassLoader
                    ],
                    fallback: styleLoader
                })
            },
            {
                test: /\.(png|jpg|jpeg|gif|ico|svg)$/,
                use:
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name]-[hash:6].[ext]'
                        }
                    }
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: {
                    loader: 'file-loader',
                    options: {
                        name: '[name]-[hash:6].[ext]'
                    }
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            jQuery: 'jquery',
            $: 'jquery',
            'window.jQuery': 'jquery'
        }),
        new CopyWebpackPlugin([
            { from: './assets/static', to: 'static' }
        ]),
        new webpack.optimize.CommonsChunkPlugin(
            {
                name: [
                    // layout is an entry file
                    // anything including in layout is not included in other files
                    'cross',
                    // dumps the manifest in a separate file to fix caching problem. manifest.js will contain the webpack bootstrap
                    // if the module ids change the user will only need to reload the small manifest file
                    'manifest'
                ],
                minChunks: Infinity
            }
        ),
        new ExtractTextPlugin(
            useVersioning ? '[name].[contenthash:6].css' : '[name].css'
        ),
        new ManifestPlugin({
            writeToFileEmit: true,
            basePath: 'build/'
        }),
        //allows for [chunkhash] wildcard
        new WebpackChunkHash(),
        isProduction ? new webpack.HashedModuleIdsPlugin() : new webpack.NamedModulesPlugin(),
        new CleanWebpackPlugin('web/build/**/*.*')
    ],
    devtool: useSourceMaps ? 'inline-source-map' : false,
    devServer: {
        contentBase: './web',
        headers: {
            'Access-Control-Allow-Origin': '*'
        }
    }
};

if(isProduction) {
    webpackConfig.plugins.push(
      new webpack.optimize.UglifyJsPlugin()
    );

    webpackConfig.plugins.push(
        new webpack.LoaderOptionsPlugin({
            // passes these options to all loaders
            // but we should really pass these ourselves
            minimize: true,
            debug: false
        })
    );

    webpackConfig.plugins.push(
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    );
}

module.exports = webpackConfig;