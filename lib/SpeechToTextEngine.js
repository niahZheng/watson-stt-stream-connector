const { Transform } = require('stream');
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logger = require('pino')({ 
    level: LOG_LEVEL,
    name: 'SpeechToTextEngine'
});

class SpeechToTextEngine extends Transform {
    constructor() {
        super();
    }

  /* eslint-disable class-methods-use-this */
  _read() {}

  _write() {}

  /**
   * Destroys the Speech To Text Engine if a close from the other side occurs
   */
  // eslint-disable-next-line class-methods-use-this
  destroy() {
    throw new Error('not implemented');
  }
}

module.exports = SpeechToTextEngine;
