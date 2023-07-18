module.exports = {
    transform: [["babelify", { presets: ["@babel/preset-env"] }]],
    plugin: [
      ["factor-bundle", { outputs: ["bundle.js"] }],
    ],
    debug: true,
    browserField: false,
    builtins: false,
    commondir: false,
    insertGlobalVars: {
      process: undefined,
      global: undefined,
      'Buffer.isBuffer': undefined,
      Buffer: undefined,
      __filename: undefined,
      __dirname: undefined,
    },
  };
  