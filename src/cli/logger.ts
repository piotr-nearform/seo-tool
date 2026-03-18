import pc from 'picocolors';

export enum LogLevel {
  Quiet = 0,
  Default = 1,
  Verbose = 2,
}

export interface Logger {
  error(message: string): void;
  warn(message: string): void;
  info(message: string): void;
  debug(message: string): void;
  progress(current: number, total: number, label: string): void;
}

export function createLogger(level: LogLevel = LogLevel.Default): Logger {
  return {
    error(message: string): void {
      // Errors are always shown
      console.error(pc.red(`[ERROR] ${message}`));
    },

    warn(message: string): void {
      if (level >= LogLevel.Default) {
        console.warn(pc.yellow(`[WARN] ${message}`));
      }
    },

    info(message: string): void {
      if (level >= LogLevel.Default) {
        console.log(pc.cyan(`[INFO] ${message}`));
      }
    },

    debug(message: string): void {
      if (level >= LogLevel.Verbose) {
        console.log(pc.gray(`[DEBUG] ${message}`));
      }
    },

    progress(current: number, total: number, label: string): void {
      if (level >= LogLevel.Default) {
        console.log(pc.green(`[${current}/${total}] ${label}`));
      }
    },
  };
}
