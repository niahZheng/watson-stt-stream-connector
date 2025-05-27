const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logger = require('pino')({ 
    level: LOG_LEVEL,
    name: 'StreamingSessionState'
});

class StreamingSessionState {

  sessionId;

  //  Used to track when the speech engines are ready to receive audio.
  speechEngineListening = {};

  //  Used to cache any audio that is received from the CCaaS prior to the speech engine
  //  being ready to receive it.
  preListenCache = {};
  
  constructor(sessionId) {
    this.sessionId = sessionId;
  }

  getPreListenCache(engineName){
    return this.preListenCache[engineName];
  }

  setPreListenCache(engineName, buffer){
      this.preListenCache[engineName] = buffer;
  }
  
  isSpeechEngineListening(engineName){
    return this.speechEngineListening[engineName] === true;
  }

  setSpeechEngineListening(engineName, isListening){
    this.speechEngineListening[engineName] = isListening;
  }
}
module.exports = StreamingSessionState;
