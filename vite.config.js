// vite.config.js
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'


export default defineConfig({
  plugins:  [
    dts({
      insertTypesEntry: true
    })
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'dfjs',
      fileName: 'dfjs',
    },
    rollupOptions: {
        external: ['mathjs','papaparse','@tensorflow/tfjs','table'],
        output: {
            // Provide global variables to use in the UMD build
            // for externalized deps
            globals: {
                papaparse: 'Papa',
            },
        }
    },
  },
  test:{
    coverage:{
      reporter: ['text','json','html'],
      reportsDirectory: './coverage'
    }
  }
})