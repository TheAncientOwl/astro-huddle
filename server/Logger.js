import { Chalk } from 'chalk';
const chalk = new Chalk();

const LogLevel = {
  Database: 'Database',
  Info: 'Info',
  Log: 'Log',
  Verbose: 'Verbose',
  Warn: 'Warning',
  Error: 'Error',
};

const formatTime = (date = new Date()) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}::${hours}:${minutes}:${seconds}`;
};

class Logger {
  static log(message, level = LogLevel.Info) {
    switch (level) {
      case LogLevel.Info:
        console.info(chalk.cyan(Logger.format(`${message}`, level)));
        break;
      case LogLevel.Warn:
        console.warn(chalk.yellow(Logger.format(`${message}`, level)));
        break;
      case LogLevel.Error:
        console.error(chalk.red(Logger.format(`${message}`, level)));
        break;
      case LogLevel.Database:
        console.log(chalk.magenta(Logger.format(`${message}`, level)));
        break;
      default:
        console.log(chalk.green(Logger.format(`${message}`, level)));
    }
  }

  static format(message, level = LogLevel.Info) {
    return `[${formatTime()}] [AstralHuddle] [${level}] ${message}`;
  }

  static info(message) {
    this.log(message, LogLevel.Info);
  }

  static warn(message) {
    this.log(message, LogLevel.Warn);
  }

  static error(message) {
    this.log(message, LogLevel.Error);
  }

  static verbose(message) {
    this.log(message, LogLevel.Verbose);
  }

  static database(message) {
    this.log(message, LogLevel.Database);
  }
}

export { Logger, LogLevel };
