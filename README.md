# Retell Sidetool Logistics

Canadian Logistics AI Agent - Lead Qualification & FAQ Support with Retell AI. A demonstration of Retell AI web call functionality that allows users to have voice conversations with an AI agent directly in their browser.

## 🌐 Live Demo

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/franciscolamberti/retell-logistics-demo)

Try the live demo: https://retell-logistics-demo-eight.vercel.app

## Features

- 🎙️ **Browser-based voice calls** - No phone required, works directly in the browser
- 🤖 **Real-time AI conversations** - Speak naturally with an AI agent
- 🎨 **Modern, clean design** - Matches Kleva demo styling
- 📱 **Fully responsive** - Works on desktop and mobile
- ⚡ **No build process** - Single HTML file, ready to use
- 🔊 **WebRTC audio** - Low-latency voice communication

## Quick Start

1. **Clone this repository**
   ```bash
   git clone https://github.com/franciscolamberti/retell-logistics-demo.git
   cd retell-logistics-demo
   ```

2. **Open the demo**

   Simply open `index.html` in your browser or use a local server:

   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js (with http-server)
   npx http-server
   ```

3. **Test the web call**

   Click "Start Voice Call" and allow microphone access when prompted.

## How It Works

1. User clicks "Start Voice Call" button
2. Browser requests microphone permission
3. App creates a web call session via Retell API
4. WebRTC connection established with AI agent
5. User can speak naturally - AI responds in real-time
6. Call timer shows duration
7. User clicks "End Call" to disconnect

## Configuration

The demo is pre-configured with these credentials:

- **Public Key**: `key_9b7349002a90326c7c553addd6ce`
- **Agent ID**: `agent_d1e33aa42cae40033f4ce5e641`

To use your own agent:

1. Open `index.html`
2. Find the `CONFIG` object (around line 120)
3. Replace with your credentials:

```javascript
const CONFIG = {
  publicKey: 'your_public_key_here',
  agentId: 'your_agent_id_here'
};
```

## Browser Support

Works in modern browsers with WebRTC support:

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (macOS/iOS)
- ✅ Opera

**Note**: HTTPS required for microphone access (localhost works for testing)

## Technical Details

### Dependencies

- **Retell Web Client SDK** v2.0.7 - Loaded from CDN
- **Tailwind CSS** - For styling (loaded from CDN)

### API Flow

```
1. User clicks button
   ↓
2. POST /v2/create-web-call
   - Headers: Authorization with public key
   - Body: { agent_id }
   ↓
3. Response: { access_token, call_id }
   ↓
4. retellClient.startCall({ accessToken })
   ↓
5. WebRTC connection established
   ↓
6. Real-time audio streaming
```

### Events

The SDK provides these events:

- `call_started` - Connection established
- `call_ended` - Call disconnected
- `error` - Error occurred
- `agent_start_talking` - Agent begins speaking
- `agent_stop_talking` - Agent finishes speaking
- `audio` - Audio data received
- `update` - Call status update

## Deployment

Deploy to Vercel in minutes:

### Quick Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Customization

### Styling

The demo uses Tailwind CSS. Key styling elements:

- **Voice Waves**: Purple animated circles with `slowPulse` animation
- **Layout**: Clean, centered design matching Kleva aesthetic
- **Colors**: Black/white theme with purple accents
- **Typography**: Bold headings with gray subtitles

### Adding Custom Variables

To pass dynamic variables to your agent:

```javascript
const response = await fetch('https://api.retellai.com/v2/create-web-call', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${CONFIG.publicKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: CONFIG.agentId,
    retell_llm_dynamic_variables: {
      user_name: 'John Doe',
      custom_field: 'value'
    }
  })
});
```

## Troubleshooting

### Microphone Not Working

- Check browser permissions (click lock icon in address bar)
- Ensure you're using HTTPS (or localhost for testing)
- Try a different browser (Chrome recommended)

### Connection Fails

- Verify your public key is correct
- Check agent ID exists and is active
- Look at browser console for detailed errors
- Ensure you have Retell credits available

### No Audio Heard

- Check your system audio output
- Verify agent is configured with a voice
- Test with headphones to rule out echo issues

### CORS Errors

- This shouldn't happen with Retell's public key system
- If you see CORS errors, verify you're using the public key (not API key)

## Examples

- `index.html` - Main web call demo
- `web-call-demo.html` - Alternative implementation
- `examples/with-conversation-flow.html` - Using conversation flows

## Resources

- [Retell AI Documentation](https://docs.retellai.com)
- [Retell Web SDK](https://docs.retellai.com/sdk-reference/web-sdk)
- [Create Voice Agent Guide](https://docs.retellai.com/build/create-voice-agent)
- [Retell Public Keys](https://docs.retellai.com/accounts/public-keys)

## Security

- Uses Retell's public key system - safe for frontend use
- No sensitive credentials exposed
- HTTPS required for production (microphone access)
- WebRTC encrypted by default

## Support

For issues or questions:
- [Retell Documentation](https://docs.retellai.com)
- [GitHub Issues](https://github.com/franciscolamberti/retell-logistics-demo/issues)
- Check browser console for detailed error messages

## License

MIT License - feel free to use this demo as a starting point for your own projects.

---

**Note**: This demo creates browser-based voice calls, not phone calls. For phone callback functionality, see the `examples/` folder or check the Retell documentation for the callback widget.
