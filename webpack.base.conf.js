const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const PATHS = {
	scss: path.join(__dirname, './src/scss'),
	src: path.join(__dirname, './src'),
	dist: path.join(__dirname, './dist'),
	assets: 'assets'
};

module.exports = {
	externals: {
		paths: PATHS
	},
	entry: `${PATHS.src}/index.js`,
	output: {
		path: PATHS.dist,
		filename: `${PATHS.assets}/js/[name].js`
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: {
					loader: 'babel-loader'
				}
			},
			{
				test: /\.(png|jpg|gif\svg)$/,
				loader: 'file-loader',
				options: {
					name: '[name].[ext]'
				}
			},
			{
				test: /\.(s*)css$/,
				use: [
					'style-loader',
					MiniCssExtractPlugin.loader,
					{
						loader: 'css-loader',
						options: {sourceMap: true}
					},
					{
						loader: 'sass-loader',
						options: {sourceMap: true}
					}
				]
			}
		]
	},
	resolve: {
		alias: {
			"~": PATHS.scss
		}
	},
	plugins: [
		new MiniCssExtractPlugin({filename: `${PATHS.assets}/css/[name].css`,}),
		new HtmlWebpackPlugin({
			hash: false,
			template: `${PATHS.src}/index.html`,
			filename: `./index.html`
		}),
		new CopyWebpackPlugin([
			{from: `${PATHS.src}/images`, to: `${PATHS.assets}/images`},
		])
	]
};