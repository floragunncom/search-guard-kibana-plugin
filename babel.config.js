module.exports = function (api) {
  // ensure env is test so that this config won't impact build or dev server
  if (api.env('test')) {
    return {
      presets: [
        require('@babel/preset-env'),
        require('@babel/preset-react'),
        require('@babel/preset-typescript'),
      ],
      plugins: [
        [require('@babel/plugin-transform-runtime'), { regenerator: true }],
        require('@babel/plugin-proposal-class-properties'),
        require('@babel/plugin-proposal-object-rest-spread'),
      ],
    };
  }
}
