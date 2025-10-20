const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// Add custom resolver for @poultryco/design-system
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  '@poultryco/design-system': path.resolve(projectRoot, 'src/design-system'),
};

module.exports = config;

