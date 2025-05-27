// const setupTelemetry = require('./setupTelemetry');
// const provider = setupTelemetry();

const WebSocket = require('ws');
const WebSocketServer = require('ws').Server;

const EventPublisher = require('./AzureQueueEventPublisher');
let eventPublisher = null;

//  CCaaS specific adapters currently supported
const GenesysAudioHookAdapter = require('./GenesysAudioHookAdapter');
const MonoChannelStreamingAdapter = require('./MonoChannelStreamingAdapter');
const SiprecStreamingAdapter = require('./SiprecStreamingAdapter');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logger = require('pino')({ 
    level: LOG_LEVEL,
    name: 'StreamConnectorServer'
});

/**
 *
 * @returns
 */
let wsServer = null;
function startServer() {
  return new Promise((resolve, reject) => {
    //  Setup event publisher
    eventPublisher = new EventPublisher();
    const DEFAULT_PORT = process.env.DEFAULT_SERVER_LISTEN_PORT || process.env.PORT || 80;

    try {
      logger.info(`Starting WebSocket server on port ${DEFAULT_PORT}`);
      logger.info(`Using adapter type: ${process.env.STREAM_ADAPTER_TYPE}`);
      logger.info(`API Key required: ${process.env.STREAM_CONNECTOR_API_KEY ? 'Yes' : 'No'}`);

      wsServer = new WebSocketServer({
        port: DEFAULT_PORT,
        verifyClient: (info, callback) => {
          logger.debug('Incoming WebSocket connection request');
          logger.debug('Request URL:', info.req.url);
          logger.debug('Request method:', info.req.method);
          logger.debug('Request headers:', JSON.stringify(info.req.headers, null, 2));

          // 检查 URL 参数
          const url = new URL(info.req.url, `http://${info.req.headers.host}`);
          logger.debug('URL parameters:', Object.fromEntries(url.searchParams));

          // 检查所有可能的 API Key 位置
          const apiKeyLocations = {
            'x-api-key': info.req.headers['x-api-key'],
            'x-apikey': info.req.headers['x-apikey'],
            'api-key': info.req.headers['api-key'],
            'apikey': info.req.headers['apikey'],
            'authorization': info.req.headers['authorization'],
            'url-param': url.searchParams.get('apiKey')
          };

          logger.debug('API Key locations:', apiKeyLocations);

          callback(true); // 允许连接，让适配器处理验证
        }
      });
    } catch (e) {
      logger.error('Failed to start WebSocket server:', e);
      return reject(e);
    }

    wsServer.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    wsServer.on('listening', () => {
      logger.info(`Speech To Text Adapter has started. Listening on port = 80`);
      resolve();
    });

    //  As new adapters are added this is where they will be triggered
    if (process.env.STREAM_ADAPTER_TYPE == 'GenesysAudioHookAdapter'){
        logger.info('Using GenesysAudioHookAdapter');
        GenesysAudioHookAdapter.setEventPublisher(eventPublisher);
        wsServer.on('connection', (ws, req) => {
          logger.debug('New WebSocket connection received');
          logger.debug('Request URL:', req.url);
          logger.debug('Request headers:', JSON.stringify(req.headers, null, 2));
          GenesysAudioHookAdapter.handleAudioHookConnection(ws, req);
        });
    }
    else if (process.env.STREAM_ADAPTER_TYPE == 'MonoChannelStreamingAdapter'){
      logger.info('Using MonoChannelStreamingAdapter');
      MonoChannelStreamingAdapter.setEventPublisher(eventPublisher);
      wsServer.on('connection', MonoChannelStreamingAdapter.handleMonoChannelStreamingConnection);
    }
    else if (process.env.STREAM_ADAPTER_TYPE == 'SiprecStreamingAdapter'){
      logger.info('Using SiprecStreamingAdapter');
      SiprecStreamingAdapter.setEventPublisher(eventPublisher);
      wsServer.on('connection', SiprecStreamingAdapter.handleSiprecStreamingConnection);
    }
    else {
        logger.error(`Unknown adapter type: ${process.env.STREAM_ADAPTER_TYPE}`);
    }

    return wsServer;
  });
}
module.exports.start = startServer;

/**
 *
 * @returns
 */
function stopServer() {
  return new Promise((resolve, reject) => {

    if (eventPublisher != null){
      eventPublisher.destroy();
      eventPublisher = null;
    }

    if (wsServer === null) {
      return reject(new Error('server not started'));
    }

    wsServer.close((err) => {
      if (err) {
        return reject(err);
      }
      return resolve();
    });

    return wsServer;
  });
}
module.exports.stop = stopServer;

// 设置环境变量 STREAM_CONNECTOR_API_KEY 为空字符串
process.env.STREAM_CONNECTOR_API_KEY = '';

