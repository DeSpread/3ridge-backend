import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';
import { registerAs } from '@nestjs/config';

export default registerAs('global', () => {
  const yamlConfigFileNameByEnv = 'global.yaml';

  return yaml.load(
    readFileSync(join(__dirname, yamlConfigFileNameByEnv), 'utf8'),
  ) as Record<string, any>;
});
