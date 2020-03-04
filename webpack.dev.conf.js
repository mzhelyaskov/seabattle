const webpack = require('webpack');
const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');

const devWebpackConfig = merge(baseConfig, {
	mode: 'development',
	devtool: 'cheap-module-eval-source-map',
	devServer: {
		contentBase: baseConfig.externals.paths.dist, // то где будет открываться webpack автоматически при запуске dev-server
		overlay: {
			warnings: true,
			errors: true
		}
	},
	plugins: [
		new webpack.SourceMapDevToolPlugin({filename: '[file].map'})
	]
});

module.exports = new Promise((resolve) => {
	resolve(devWebpackConfig);
});
