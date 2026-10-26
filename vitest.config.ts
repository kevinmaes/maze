import path from 'node:path';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';

// Custom plugin to mock SVG imports as React components in test mode
function svgMockPlugin(): Plugin {
  return {
    name: 'svg-mock-plugin',
    enforce: 'pre' as const,
    resolveId(source: string) {
      if (source.endsWith('.svg')) {
        return `${source}?mock`;
      }
      return null;
    },
    load(id: string) {
      if (id.endsWith('.svg?mock')) {
        return {
          code: `import React from 'react'; export default function SvgMock(props) { return React.createElement('svg', { ...props, 'data-testid': 'svg-mock' }) }`,
          map: null,
        };
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [react(), svgMockPlugin()],
  test: {
    include: ['src/**/*.test.{ts,tsx}', '.github/scripts/**/*.test.mjs'],
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        'src/pages/**',
        'src/test/**',
        'src/**/*.d.ts',
        'src/**/*.stories.{js,jsx,ts,tsx}',
        'src/**/*.test.{js,jsx,ts,tsx}',
        'src/**/index.{js,jsx,ts,tsx}',
        '.next/',
        'coverage/',
      ],
      // Ratchet only: raise these floors as coverage improves.
      thresholds: {
        branches: 81,
        functions: 92,
        lines: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  define: {
    'process.env': {},
  },
});
