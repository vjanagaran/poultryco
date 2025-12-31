# WebSocket Connection Debug Guide

## Connection URL Format

The WebSocket namespace `/whatsapp` should be accessed as:
- **Correct**: `io('http://localhost:3002/whatsapp', { path: '/socket.io' })`
- **Incorrect**: `io('http://localhost:3002', { namespace: '/whatsapp' })`

## Testing Connection

1. Open browser console
2. Check for WebSocket connection errors
3. Verify the namespace is registered on the server

## Expected Behavior

- HTTP GET to `http://localhost:3002/whatsapp` → 404 (expected, it's WebSocket only)
- WebSocket connection to `ws://localhost:3002/socket.io/?EIO=4&transport=websocket&ns=/whatsapp` → Should connect

## Troubleshooting

If you see "Invalid namespace" error:
1. Check server logs for gateway initialization
2. Verify `WhatsAppGateway` is in `WhatsAppModule` providers
3. Check CORS settings match frontend URL
4. Verify `IoAdapter` is configured in `main.ts`

