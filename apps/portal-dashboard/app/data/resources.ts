import type {ResourceProps} from "@refinedev/core";

const resources: ResourceProps[] = [
    {
        name: 'account',
        meta: {
            dataProviderName: 'default',
        }
    },
    {
        name: 'file',
        meta: {
            dataProviderName: 'files',
        }
    }
];

export default resources;
