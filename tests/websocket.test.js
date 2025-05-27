const WebSocket = require('ws');
const assert = require('assert');

const WS_URL = 'wss://watson-stt-stream-connector-zlp-c7gtdghregdxgme3.australiacentral-01.azurewebsites.net:443';
const API_KEY = process.env.STREAM_CONNECTOR_API_KEY || '550e8400-e29b-41d4-a716-446655440000';
const CLIENT_SECRET = process.env.CLIENT_SECRET || 'GC_AH2024#pK8$mN3@vR5*dL9qW2&jH6tB4';

// 添加重试机制
function connectWithRetry(url, options, maxRetries = 3, retryDelay = 2000) {
    return new Promise((resolve, reject) => {
        let retryCount = 0;

        function tryConnect() {
            console.log(`Attempt ${retryCount + 1} of ${maxRetries} to connect to:`, url);
            const ws = new WebSocket(url, options);

            // 添加握手过程监控
            ws.on('upgrade', (response) => {
                console.log('Upgrade response:', {
                    statusCode: response.statusCode,
                    headers: response.headers
                });
            });

            ws.on('open', () => {
                console.log('Connection established successfully');
                console.log('WebSocket state:', ws.readyState);
                console.log('Protocol:', ws.protocol);
                console.log('URL:', ws.url);
                resolve(ws);
            });

            ws.on('error', (error) => {
                console.error('WebSocket error details:', {
                    message: error.message,
                    code: error.code,
                    type: error.type,
                    stack: error.stack
                });

                if (retryCount < maxRetries - 1) {
                    retryCount++;
                    console.log(`Retrying in ${retryDelay/1000} seconds...`);
                    setTimeout(tryConnect, retryDelay);
                } else {
                    reject(error);
                }
            });

            ws.on('close', (code, reason) => {
                console.log('WebSocket closed:', {
                    code,
                    reason: reason.toString(),
                    wasClean: ws.readyState === WebSocket.CLOSED
                });
            });

            // 设置更长的超时时间
            const timeout = setTimeout(() => {
                if (ws.readyState !== WebSocket.OPEN) {
                    console.log('Connection timeout - current state:', ws.readyState);
                    ws.terminate();
                    if (retryCount < maxRetries - 1) {
                        retryCount++;
                        console.log(`Retrying in ${retryDelay/1000} seconds...`);
                        setTimeout(tryConnect, retryDelay);
                    } else {
                        reject(new Error('Connection timeout after all retries'));
                    }
                }
            }, 30000); // 增加到 30 秒

            ws.on('open', () => {
                clearTimeout(timeout);
            });
        }

        tryConnect();
    });
}

// 直接执行连接测试
async function testConnection() {
    try {
        console.log('Testing WebSocket connection...');
        const ws = await connectWithRetry(WS_URL, {
            headers: {
                'x-api-key': API_KEY,
                'x-client-secret': CLIENT_SECRET,
                'Origin': 'https://watson-stt-stream-connector-zlp-c7gtdghregdxgme3.australiacentral-01.azurewebsites.net'
            },
            handshakeTimeout: 30000,
            perMessageDeflate: false
        });
        
        console.log('Connection test successful');

        // 添加消息监听器
        ws.on('message', (data) => {
            console.log('Received message:', data.toString());
        });

        // 60秒后关闭连接
        setTimeout(() => {
            ws.close();
        }, 60000);
        
    } catch (error) {
        console.error('Connection test failed:', error);
        process.exit(1);
    }
}

// 执行测试
testConnection(); 