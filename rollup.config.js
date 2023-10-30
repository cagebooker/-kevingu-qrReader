import babel from '@rollup/plugin-babel';
// rollup.config.js
import { terser } from 'rollup-plugin-terser';

export default [
  {
    input: 'src/index.js',
    output: {
      file: 'dist/index.min.js',
      format: 'cjs',
      sourcemap: true,
    },
    plugins: [
        terser(),
        babel({
            babelHelpers: 'bundled', // 使用"bundled"选项来减小输出文件的体积
          })],
  },
];