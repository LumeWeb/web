import { defineConfig } from 'orval';

export default defineConfig({
    account: {
        input: './src/account/swagger.yaml',
        output: {
            mode: 'split',
            workspace: "./src/account/generated",
            target: 'openapi.ts',
            override: {
                mutator: {
                    path: '../axios.ts',
                    name: 'customInstance',
                },
            },
        },
    },
});
