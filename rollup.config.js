// rollup.config.js
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'

export default {
  input: 'src/index.js',
  output: {
    file: 'lib/bundle.js',
    format: 'umd',
    name: 'brinkjs'
  },
  plugins: [
    commonjs(),
    json()
  ]
}
