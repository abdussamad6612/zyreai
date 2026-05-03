import { createRequestHandler } from '@remix-run/express';
import compression from 'compression';
import express from 'express';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BUILD_DIR = join(__dirname, '..', 'build');

const app = express();

app.use(compression());
app.disable('x-powered-by');

// Static files from build/client
app.use(
  '/build',
  express.static(join(BUILD_DIR, 'client', 'build'), { immutable: true, maxAge: '1y' }),
);
app.use(express.static(join(BUILD_DIR, 'client'), { maxAge: '1h' }));

app.use(morgan('tiny'));

app.all(
  '*',
  createRequestHandler({
    build: await import(join(BUILD_DIR, 'server', 'index.js')),
    mode: process.env.NODE_ENV,
  }),
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Express server listening on port ${port}`);
});

export default app;
