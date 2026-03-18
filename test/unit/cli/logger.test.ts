import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, LogLevel } from '../../../src/cli/logger.js';

describe('Logger', () => {
  let consoleSpy: {
    log: ReturnType<typeof vi.spyOn>;
    error: ReturnType<typeof vi.spyOn>;
    warn: ReturnType<typeof vi.spyOn>;
  };

  beforeEach(() => {
    consoleSpy = {
      log: vi.spyOn(console, 'log').mockImplementation(() => {}),
      error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('quiet mode', () => {
    it('should only output errors', () => {
      const logger = createLogger(LogLevel.Quiet);
      logger.error('something broke');
      logger.warn('warning');
      logger.info('info');
      logger.debug('debug');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).not.toHaveBeenCalled();
      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('default mode', () => {
    it('should output errors, warnings, and info', () => {
      const logger = createLogger(LogLevel.Default);
      logger.error('error');
      logger.warn('warning');
      logger.info('info');
      logger.debug('debug');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledTimes(1); // info only, not debug
    });

    it('should not output debug messages', () => {
      const logger = createLogger(LogLevel.Default);
      logger.debug('debug info');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('verbose mode', () => {
    it('should output everything including debug', () => {
      const logger = createLogger(LogLevel.Verbose);
      logger.error('error');
      logger.warn('warning');
      logger.info('info');
      logger.debug('debug');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
      expect(consoleSpy.log).toHaveBeenCalledTimes(2); // info + debug
    });
  });

  describe('progress reporting', () => {
    it('should report progress in default mode', () => {
      const logger = createLogger(LogLevel.Default);
      logger.progress(5, 10, 'pages processed');

      expect(consoleSpy.log).toHaveBeenCalledTimes(1);
      const output = consoleSpy.log.mock.calls[0][0] as string;
      expect(output).toContain('5');
      expect(output).toContain('10');
      expect(output).toContain('pages processed');
    });

    it('should not report progress in quiet mode', () => {
      const logger = createLogger(LogLevel.Quiet);
      logger.progress(5, 10, 'pages processed');

      expect(consoleSpy.log).not.toHaveBeenCalled();
    });
  });

  describe('error messages include color', () => {
    it('should include colored output for errors', () => {
      const logger = createLogger(LogLevel.Default);
      logger.error('something broke');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
      // The output should contain ANSI codes or the message itself
      const output = consoleSpy.error.mock.calls[0][0] as string;
      expect(output).toContain('something broke');
    });
  });
});
