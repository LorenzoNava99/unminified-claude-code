/**
 * Unit tests for Configuration Module
 * Tests configuration management, environment variable parsing, and region selection
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import {
  getClaudeConfigDir,
  parseBoolean,
  parseBooleanNegative,
  parseEnvironmentVariables,
  getAWSRegion,
  getDefaultCloudMLRegion,
  getVertexRegionForModel,
  shouldMaintainProjectWorkingDir,
  CONFIG_DEFAULTS,
  ENV_VARS,
  noop
} from '../../src/config/index.js';

describe('Configuration Module', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('getClaudeConfigDir', () => {
    it('should return config dir from environment', () => {
      process.env.CLAUDE_CONFIG_DIR = '/custom/config';
      expect(getClaudeConfigDir()).toBe('/custom/config');
    });

    it('should return default ~/.claude if not set', () => {
      delete process.env.CLAUDE_CONFIG_DIR;
      const result = getClaudeConfigDir();
      expect(result).toContain('.claude');
    });
  });

  describe('parseBoolean', () => {
    it('should parse boolean values', () => {
      expect(parseBoolean(true)).toBe(true);
      expect(parseBoolean(false)).toBe(false);
    });

    it('should parse truthy strings', () => {
      expect(parseBoolean('1')).toBe(true);
      expect(parseBoolean('true')).toBe(true);
      expect(parseBoolean('TRUE')).toBe(true);
      expect(parseBoolean('yes')).toBe(true);
      expect(parseBoolean('YES')).toBe(true);
      expect(parseBoolean('on')).toBe(true);
      expect(parseBoolean('ON')).toBe(true);
    });

    it('should parse falsy strings', () => {
      expect(parseBoolean('0')).toBe(false);
      expect(parseBoolean('false')).toBe(false);
      expect(parseBoolean('no')).toBe(false);
      expect(parseBoolean('off')).toBe(false);
      expect(parseBoolean('other')).toBe(false);
    });

    it('should trim whitespace', () => {
      expect(parseBoolean('  true  ')).toBe(true);
      expect(parseBoolean('  false  ')).toBe(false);
    });

    it('should handle empty/null values', () => {
      expect(parseBoolean('')).toBe(false);
      expect(parseBoolean(null)).toBe(false);
      expect(parseBoolean(undefined)).toBe(false);
    });
  });

  describe('parseBooleanNegative', () => {
    it('should return true for negative boolean strings', () => {
      expect(parseBooleanNegative('0')).toBe(true);
      expect(parseBooleanNegative('false')).toBe(true);
      expect(parseBooleanNegative('FALSE')).toBe(true);
      expect(parseBooleanNegative('no')).toBe(true);
      expect(parseBooleanNegative('off')).toBe(true);
    });

    it('should negate boolean values', () => {
      expect(parseBooleanNegative(true)).toBe(false);
      expect(parseBooleanNegative(false)).toBe(true);
    });

    it('should return false for undefined', () => {
      expect(parseBooleanNegative(undefined)).toBe(false);
    });
  });

  describe('parseEnvironmentVariables', () => {
    it('should parse env var strings', () => {
      const envVars = ['KEY1=value1', 'KEY2=value2'];
      const result = parseEnvironmentVariables(envVars);

      expect(result).toEqual({
        KEY1: 'value1',
        KEY2: 'value2'
      });
    });

    it('should handle values with equals signs', () => {
      const envVars = ['KEY=value=with=equals'];
      const result = parseEnvironmentVariables(envVars);

      expect(result.KEY).toBe('value=with=equals');
    });

    it('should throw error for invalid format', () => {
      expect(() => {
        parseEnvironmentVariables(['INVALID']);
      }).toThrow('Invalid environment variable format');

      expect(() => {
        parseEnvironmentVariables(['KEY=']);
      }).toThrow('Invalid environment variable format');
    });

    it('should return empty object for null input', () => {
      expect(parseEnvironmentVariables(null)).toEqual({});
      expect(parseEnvironmentVariables(undefined)).toEqual({});
    });
  });

  describe('getAWSRegion', () => {
    it('should return AWS_REGION if set', () => {
      process.env.AWS_REGION = 'us-west-2';
      expect(getAWSRegion()).toBe('us-west-2');
    });

    it('should return AWS_DEFAULT_REGION if AWS_REGION not set', () => {
      delete process.env.AWS_REGION;
      process.env.AWS_DEFAULT_REGION = 'eu-west-1';
      expect(getAWSRegion()).toBe('eu-west-1');
    });

    it('should return default us-east-1 if neither set', () => {
      delete process.env.AWS_REGION;
      delete process.env.AWS_DEFAULT_REGION;
      expect(getAWSRegion()).toBe('us-east-1');
    });
  });

  describe('getDefaultCloudMLRegion', () => {
    it('should return CLOUD_ML_REGION if set', () => {
      process.env.CLOUD_ML_REGION = 'us-central1';
      expect(getDefaultCloudMLRegion()).toBe('us-central1');
    });

    it('should return default us-east5 if not set', () => {
      delete process.env.CLOUD_ML_REGION;
      expect(getDefaultCloudMLRegion()).toBe('us-east5');
    });
  });

  describe('getVertexRegionForModel', () => {
    beforeEach(() => {
      delete process.env.CLOUD_ML_REGION;
      delete process.env.VERTEX_REGION_CLAUDE_HAIKU_4_5;
      delete process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU;
      delete process.env.VERTEX_REGION_CLAUDE_3_5_SONNET;
      delete process.env.VERTEX_REGION_CLAUDE_3_7_SONNET;
      delete process.env.VERTEX_REGION_CLAUDE_4_1_OPUS;
      delete process.env.VERTEX_REGION_CLAUDE_4_0_OPUS;
      delete process.env.VERTEX_REGION_CLAUDE_4_5_SONNET;
      delete process.env.VERTEX_REGION_CLAUDE_4_0_SONNET;
    });

    it('should return model-specific region for claude-haiku-4-5', () => {
      process.env.VERTEX_REGION_CLAUDE_HAIKU_4_5 = 'us-west1';
      expect(getVertexRegionForModel('claude-haiku-4-5-20250101')).toBe('us-west1');
    });

    it('should return model-specific region for claude-3-5-haiku', () => {
      process.env.VERTEX_REGION_CLAUDE_3_5_HAIKU = 'us-west2';
      expect(getVertexRegionForModel('claude-3-5-haiku-20240307')).toBe('us-west2');
    });

    it('should return model-specific region for claude-3-5-sonnet', () => {
      process.env.VERTEX_REGION_CLAUDE_3_5_SONNET = 'us-central1';
      expect(getVertexRegionForModel('claude-3-5-sonnet-20240620')).toBe('us-central1');
    });

    it('should return model-specific region for claude-sonnet-4-5', () => {
      process.env.VERTEX_REGION_CLAUDE_4_5_SONNET = 'us-east1';
      expect(getVertexRegionForModel('claude-sonnet-4-5-20250929')).toBe('us-east1');
    });

    it('should fall back to default region if model-specific not set', () => {
      process.env.CLOUD_ML_REGION = 'us-central1';
      expect(getVertexRegionForModel('claude-3-5-sonnet-20240620')).toBe('us-central1');
    });

    it('should return default for unknown model', () => {
      expect(getVertexRegionForModel('unknown-model')).toBe('us-east5');
    });

    it('should handle null/undefined model', () => {
      expect(getVertexRegionForModel(null)).toBe('us-east5');
      expect(getVertexRegionForModel(undefined)).toBe('us-east5');
    });
  });

  describe('shouldMaintainProjectWorkingDir', () => {
    it('should return true if env var is truthy', () => {
      process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR = 'true';
      expect(shouldMaintainProjectWorkingDir()).toBe(true);
    });

    it('should return false if env var is falsy', () => {
      process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR = 'false';
      expect(shouldMaintainProjectWorkingDir()).toBe(false);
    });

    it('should return false if env var is not set', () => {
      delete process.env.CLAUDE_BASH_MAINTAIN_PROJECT_WORKING_DIR;
      expect(shouldMaintainProjectWorkingDir()).toBe(false);
    });
  });

  describe('CONFIG_DEFAULTS', () => {
    it('should contain default configuration values', () => {
      expect(CONFIG_DEFAULTS.BASH_MAX_OUTPUT_LENGTH).toBe(30000);
      expect(CONFIG_DEFAULTS.AWS_REGION).toBe('us-east-1');
      expect(CONFIG_DEFAULTS.CLOUD_ML_REGION).toBe('us-east5');
    });
  });

  describe('ENV_VARS', () => {
    it('should contain environment variable names', () => {
      expect(ENV_VARS.CLAUDE_CONFIG_DIR).toBe('CLAUDE_CONFIG_DIR');
      expect(ENV_VARS.AWS_REGION).toBe('AWS_REGION');
      expect(ENV_VARS.CLOUD_ML_REGION).toBe('CLOUD_ML_REGION');
    });
  });

  describe('noop', () => {
    it('should do nothing and return undefined', () => {
      expect(noop()).toBeUndefined();
    });
  });
});
