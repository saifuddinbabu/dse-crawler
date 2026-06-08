import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const greet = (name: string): string => {
  return `Hello, ${name}! Your Node.js + TypeScript project is ready.`;
};

const main = (): void => {
  console.log(greet('World'));
  console.log('Running from:', __dirname);
};

main();
