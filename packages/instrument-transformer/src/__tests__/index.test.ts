import fs from 'fs/promises';
import module from 'module';
import path from 'path';
import url from 'url';

import { beforeEach, describe, expect, it } from 'vitest';

import { InstrumentTransformer } from '../index.js';

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const require = module.createRequire(__dirname);

const loadSource = (id: string) => fs.readFile(require.resolve(id), 'utf-8');

const sources = {
  clickTask: await loadSource('@open-data-capture/instrument-library/interactive/click-task.tsx'),
  happinessQuestionnaire: await loadSource('@open-data-capture/instrument-library/forms/happiness-questionnaire.ts')
};

describe('InstrumentTransformer', () => {
  let transformer: InstrumentTransformer;

  beforeEach(() => {
    transformer = new InstrumentTransformer();
  });

  describe('generateBundle', () => {
    it('should successfully transpile the click task', async () => {
      expect(transformer.generateBundle(sources.clickTask)).resolves.toBeTypeOf('string');
    });
    it('should successfully transpile the happiness questionnaire', async () => {
      expect(transformer.generateBundle(sources.happinessQuestionnaire)).resolves.toBeTypeOf('string');
    });
    it('should fail to transpile syntactically invalid code', () => {
      const source = sources.happinessQuestionnaire + 'INVALID SYNTAX!!';
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a static import', () => {
      const source = ["import _ from 'lodash';", sources.happinessQuestionnaire].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including a named export', () => {
      const source = [sources.happinessQuestionnaire, 'export const __foo__ = 5'].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
    it('should reject source including multiple default exports', () => {
      const source = [sources.happinessQuestionnaire, 'export default __foo__ = 5'].join('\n');
      expect(transformer.generateBundle(source)).rejects.toThrow();
    });
  });

  describe('transformRuntimeImports', () => {
    it('should transform imports', async () => {
      const input = 'import("/runtime/v0.0.1/react.js");\n';
      const output = 'import("./runtime/v0.0.1/react.js");\n';
      expect(transformer.transformRuntimeImports(input)).resolves.toBe(output);
    });
  });
});
