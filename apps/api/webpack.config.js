module.exports = function (options, webpack) {
  const externals = Array.isArray(options.externals) 
    ? [...options.externals, 'sharp']
    : typeof options.externals === 'object' && options.externals !== null
    ? { ...options.externals, 'sharp': 'commonjs sharp' }
    : ['sharp'];

  return {
    ...options,
    externals,
    plugins: [
      ...(options.plugins || []),
      // Ignore missing modules in whatsapp-web.js
      new webpack.IgnorePlugin({
        resourceRegExp: /WAWebPollsVotesSchema/,
        contextRegExp: /whatsapp-web\.js/,
      }),
      // Also ignore other missing whatsapp-web.js internal modules
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Ignore missing modules in whatsapp-web.js node_modules
          if (context.includes('whatsapp-web.js') && 
              resource.includes('WAWebPollsVotesSchema')) {
            return true;
          }
          return false;
        },
      }),
    ],
    resolve: {
      ...options.resolve,
      fallback: {
        ...(options.resolve?.fallback || {}),
      },
    },
  };
};

