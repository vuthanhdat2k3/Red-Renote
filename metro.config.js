const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Zustand v5 exports field points Metro to ESM (.mjs) files that use
// `import.meta`, which Metro's CJS bundler cannot handle on web.
// Force-resolve zustand sub-paths to their CJS equivalents.
const CJS_PACKAGES = ["zustand", "zustand/middleware", "zustand/react", "zustand/vanilla", "zustand/shallow", "zustand/traditional"];

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (CJS_PACKAGES.includes(moduleName)) {
    const subpath = moduleName === "zustand" ? "index.js" : `${moduleName.replace("zustand/", "")}.js`;
    return {
      filePath: path.resolve(__dirname, "node_modules/zustand", subpath),
      type: "sourceFile",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
