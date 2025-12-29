module.exports = function (options, webpack) {
  const externals = Array.isArray(options.externals) 
    ? [...options.externals, 'sharp']
    : typeof options.externals === 'object' && options.externals !== null
    ? { ...options.externals, 'sharp': 'commonjs sharp' }
    : ['sharp'];
    
  return {
    ...options,
    externals,
  };
};

