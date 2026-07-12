import { createLogger, defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

const logger = createLogger()
const loggerInfo = logger.info.bind(logger)

logger.info = (msg, options) => {
  if (typeof msg === 'string' && msg.includes('➜  Local:')) {
    const filteredMessage = msg.replace(/\n\s*➜\s*Local:.*(?=\n|$)/, '')
    loggerInfo(filteredMessage.trimEnd(), options)
    return
  }

  loggerInfo(msg, options)
}

// https://vite.dev/config/
export default defineConfig({
  customLogger: logger,
  server: {
    host: '0.0.0.0',
  },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
