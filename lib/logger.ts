/* eslint-disable no-console */
interface LogContext {
  [key: string]: any;
}

interface LogLevel {
  INFO: "info";
  WARN: "warn";
  ERROR: "error";
  DEBUG: "debug";
}

type LogLevelType = LogLevel[keyof LogLevel];

class Logger {
  private isDev = process.env.NODE_ENV === "development";
  private isClient = typeof window !== "undefined";

  private formatMessage(
    level: LogLevelType,
    message: string,
    context?: LogContext,
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : "";

    return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
  }

  private shouldLog(level: LogLevelType): boolean {
    if (!this.isDev && (level === "debug" || level === "info")) {
      return false;
    }

    return true;
  }

  private logToConsole(
    level: LogLevelType,
    message: string,
    context?: LogContext,
  ): void {
    if (!this.shouldLog(level)) return;

    const formattedMessage = this.formatMessage(level, message, context);

    switch (level) {
      case "error":
        console.error(formattedMessage);
        break;
      case "warn":
        console.warn(formattedMessage);
        break;
      case "info":
        console.info(formattedMessage);
        break;
      case "debug":
        console.debug(formattedMessage);
        break;
    }
  }

  private sendToMonitoring(
    level: LogLevelType,
    _message: string,
    _context?: LogContext,
  ): void {
    if (!this.isDev && level === "error" && this.isClient) {
      return;
    }
  }

  info(message: string, context?: LogContext): void {
    this.logToConsole("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.logToConsole("warn", message, context);
    this.sendToMonitoring("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    this.logToConsole("error", message, context);
    this.sendToMonitoring("error", message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.logToConsole("debug", message, context);
  }

  auth = {
    login: (success: boolean, context?: LogContext) => {
      const message = success ? "User login successful" : "User login failed";
      const level = success ? "info" : "warn";

      this[level](message, context);
    },

    logout: (context?: LogContext) => {
      this.info("User logout", context);
    },

    tokenRefresh: (success: boolean, context?: LogContext) => {
      const message = success
        ? "Token refresh successful"
        : "Token refresh failed";
      const level = success ? "debug" : "error";

      this[level](message, context);
    },

    securityEvent: (event: string, context?: LogContext) => {
      this.warn(`Security event: ${event}`, context);
    },
  };

  api = {
    request: (
      method: string,
      url: string,
      status: number,
      duration?: number,
    ) => {
      const message = `${method} ${url} - ${status}`;
      const level = status >= 400 ? "error" : "debug";

      this[level](message, { method, url, status, duration });
    },

    error: (method: string, url: string, error: any) => {
      this.error(`API Error: ${method} ${url}`, {
        method,
        url,
        error: error.message || error,
        stack: error.stack,
      });
    },
  };
}

export const logger = new Logger();
export type { LogContext, LogLevelType };
