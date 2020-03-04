const merge = require('webpack-merge');
const baseConfig = require('./webpack.base.conf');

const prodWebpackConfig = merge(baseConfig, {
	mode: 'production',
});

module.exports = new Promise((resolve) => {
	resolve(prodWebpackConfig);
});
