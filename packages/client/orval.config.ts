import { defineConfig } from 'orval';

export default defineConfig({
  erpVendas: {
    input: { target: 'http://localhost:3000/docs/json' },
    output: {
      target: './src/api/generated.ts',
      client: 'react-query',
      httpClient: 'axios',
      override: {
        mutator: { path: './src/lib/axios.ts', name: 'customAxios' },
      },
    },
  },
});
