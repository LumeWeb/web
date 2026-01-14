# @lumeweb/uppy-post-upload

Plain and simple classic HTML multipart form uploads with Uppy, as well as uploads using the HTTP PUT method.

## Features

- Supports multipart form uploads
- Supports HTTP PUT method uploads
- Seamless integration with Uppy
- Browser and Node.js support

## Installation

```bash
npm install @lumeweb/uppy-post-upload
```

```bash
pnpm add @lumeweb/uppy-post-upload
```

```bash
yarn add @lumeweb/uppy-post-upload
```

## Usage

```js
import Uppy from '@uppy/core';
import PostUpload from '@lumeweb/uppy-post-upload';

const uppy = new Uppy({
  debug: true,
  autoProceed: false,
});

uppy.use(PostUpload, {
  endpoint: 'https://your-upload-endpoint.com/upload',
  fieldName: 'files',
});
```

## Options

- `endpoint` (string, required): The upload endpoint URL
- `fieldName` (string): Form field name for files (default: `'files'`)
- `method` (string): HTTP method to use (`'POST'` or `'PUT'`, default: `'POST'`)

## License

MIT
