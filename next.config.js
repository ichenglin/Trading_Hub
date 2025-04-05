/** @type {import("next").NextConfig} */
const removeImports = require('next-remove-imports')();

const nextConfig = {
	//reactStrictMode: true,
	productionBrowserSourceMaps: false,
	poweredByHeader: false,
	serverRuntimeConfig: {
		PROJECT_ROOT: __dirname
	},
	images: {
		domains: ["cdn.discordapp.com"]
	}
};

module.exports = removeImports(nextConfig);
