const { QueueServiceClient } = require('@azure/storage-queue');
const EventPublisher = require('./EventPublisher');

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const logger = require('pino')({ 
    level: LOG_LEVEL,
    name: 'AzureQueueEventPublisher'
});

const { trace, SpanKind } = require('@opentelemetry/api');
const tracer = trace.getTracer('GenesysAudioHookAdapter');

class AzureQueueEventPublisher extends EventPublisher {
  constructor() {
    super();

    // 临时禁用 Azure Storage Queue
    logger.info('Azure Storage Queue is temporarily disabled');
    return this;

    /* 注释掉 Azure Storage Queue 相关代码
    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const queueName = process.env.AZURE_STORAGE_QUEUE_NAME;

    if (!connectionString || !queueName) {
      logger.error('Azure Storage Queue configuration is missing:', {
        hasConnectionString: !!connectionString,
        hasQueueName: !!queueName
      });
      throw new Error('Azure Storage Queue configuration is missing');
    }

    try {
      this.queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
      this.queueClient = this.queueServiceClient.getQueueClient(queueName);
      logger.info(`Initializing Azure Queue connection to queue: ${queueName}`);
    } catch (error) {
      logger.error('Failed to initialize Azure Queue client:', error);
      throw error;
    }

    this.initializeQueue()
      .then(() => {
        logger.info('Azure Queue connection established successfully');
      })
      .catch((error) => {
        logger.error('Failed to initialize Azure Queue:', error);
      });
    */
  }

  async initializeQueue(retries = 3, delay = 1000) {
    // 临时禁用
    return;
    /* 注释掉原有代码
    try {
      await this.queueClient.createIfNotExists();
      logger.debug('Azure Queue created or already exists');
    } catch (error) {
      if (retries <= 1) {
        throw error;
      }
      logger.warn(`Retry ${4 - retries}/3 to create Azure Queue:`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
      await this.initializeQueue(retries - 1, delay);
    }
    */
  }

  publish(topic, message, parentSpanCtx) {
    // 临时禁用，只记录日志
    logger.debug('AzureQueueEventPublisher: message publishing is disabled', {
      topic,
      message
    });
    return;

    /* 注释掉原有代码
    if (!this.queueClient) {
      logger.error('Azure Queue client is not initialized');
      return;
    }

    const messageText = JSON.stringify({
      topic,
      message,
      timestamp: new Date().toISOString(),
    });
    const base64Message = Buffer.from(messageText).toString('base64');

    logger.debug('AzureQueueEventPublisher: publishing message: ' + message + ' on topic: ' + topic);
    
    tracer.startActiveSpan('AzureQueueEventPublisher.send_message', { kind: SpanKind.PRODUCER }, parentSpanCtx, async (span) => {
      try {
        await this.queueClient.sendMessage(base64Message);
        logger.debug(`Message published to Azure Queue: ${topic}`);
      } catch (error) {
        logger.error('Failed to publish message to Azure Queue:', error);
        try {
          await this.initializeQueue();
          await this.queueClient.sendMessage(base64Message);
          logger.debug(`Message published to Azure Queue after retry: ${topic}`);
        } catch (retryError) {
          logger.error('Failed to publish message after retry:', retryError);
        }
      }
      span.end();
    });
    */
  }

  async destroy() {
    // 临时禁用
    logger.debug('Azure Queue resources cleanup is disabled');
    return;

    /* 注释掉原有代码
    this.queueClient = null;
    this.queueServiceClient = null;
    logger.debug('Azure Queue resources cleaned up');
    */
  }
}

module.exports = AzureQueueEventPublisher;
