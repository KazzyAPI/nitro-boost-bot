require("better-logging")(console);

const { createLogger, format, transports } = require("winston");
const { consoleFormat } = require("winston-console-format");
const util = require("util");
const logger = createLogger({
  level: "silly",
  format: format.combine(
    format.timestamp(),
    format.ms(),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  defaultMeta: { service: "Test" },
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize({ all: true }),
        format.padLevels(),
        consoleFormat({
          showMeta: true,
          metaStrip: ["timestamp", "service"],
          inspectOptions: {
            depth: Infinity,
            colors: true,
            maxArrayLength: Infinity,
            breakLength: 120,
            compact: Infinity,
          },
        })
      ),
    }),
  ],
});

function textWithTimeStamp(text) {
  return `[${new Date().toISOString()}] ${text}`;
}


module.exports = {
  logger,
  textWithTimeStamp
};
