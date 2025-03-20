/** @type {import("next").NextConfig} */
const nextConfig = {
	//reactStrictMode: true,
	productionBrowserSourceMaps: false,
	poweredByHeader: false,
	serverRuntimeConfig: {
		PROJECT_ROOT: __dirname
	}
};

module.exports = nextConfig;
