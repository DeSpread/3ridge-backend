import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import { join } from 'path';

export default () => {
  const yamlConfigFileNameByEnv = `${process.env.NODE_ENV}.yaml`;

  return yaml.load(
    readFileSync(join(__dirname, yamlConfigFileNameByEnv), 'utf8'),
  ) as Record<string, any>;
};
