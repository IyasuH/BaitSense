# BaitSense 🎯

AI-powered clickbait detection for YouTube videos. BaitSense analyzes video titles and shows you a clickbait rating when you hover over thumbnails.

## Features

- 🔍 **Real-time Analysis** - Hover over any YouTube video thumbnail to see clickbait analysis
- 🎨 **Beautiful UI** - Modern, gradient-based design with smooth animations
- ⚙️ **Customizable** - Adjust sensitivity threshold and cache settings
- 💾 **Smart Caching** - Reduces API calls by caching analysis results
- 📊 **Statistics** - Track how many videos you've analyzed
- 🌙 **Dark Mode** - Automatic dark mode support

## Project Structure

```
BaitSense/
├── manifest.json           # Extension manifest (Manifest V3)
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
├── webpack.config.js      # Webpack build configuration
├── public/
│   ├── popup.html        # Extension popup UI
│   └── icons/            # Extension icons (16, 32, 48, 128px)
└── src/
    ├── types/            # TypeScript type definitions
    │   └── index.ts
    ├── utils/            # Utility modules
    │   ├── logger.ts     # Logging utility
    │   ├── storage.ts    # Chrome storage wrapper
    │   └── dom.ts        # DOM manipulation helpers
    ├── services/         # Business logic
    │   └── analyzer.ts   # Clickbait analysis service
    ├── background/       # Background service worker
    │   └── index.ts
    ├── content/          # Content scripts
    │   ├── index.ts      # Main content script
    │   ├── tooltip.ts    # Tooltip component
    │   └── styles.css    # Content styles
    └── popup/            # Popup UI
        ├── index.ts      # Popup logic
        └── styles.css    # Popup styles
```

## Build & Test

### Prerequisites

- Node.js 18+ and npm
- A Chromium-based browser (Chrome, Edge, Brave, etc.)

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   # Development build (with source maps)
   npm run build

   # Or watch mode for development
   npm run dev
   ```

   This creates a `dist/` folder with the compiled extension.

### Loading the Extension

1. **Open your browser's extension page:**
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
   - Brave: `brave://extensions/`

2. **Enable "Developer mode"** (toggle in top-right corner)

3. **Click "Load unpacked"**

4. **Select the project root folder** (not the `dist/` folder)
   - The browser will load `manifest.json` and use files from `dist/`

5. **Verify the extension is loaded:**
   - You should see the BaitSense icon in your extensions toolbar
   - Check for any errors in the extension card

### Testing

#### Manual Testing

1. **Navigate to YouTube:**
   - Go to https://www.youtube.com
   - Browse the home page, search results, or any video page

2. **Hover over video thumbnails:**
   - Wait ~500ms after hovering
   - A tooltip should appear showing the clickbait analysis
   - Score ranges from 0-100 (higher = more clickbait)

3. **Test the popup:**
   - Click the BaitSense icon in the toolbar
   - Toggle settings and verify they save
   - Check statistics update correctly

4. **Check the console:**
   - Open DevTools (F12)
   - Check the Console tab for any errors
   - BaitSense logs are prefixed with `[BaitSense]`

#### Debugging

**Content Script Debugging:**
```bash
# Open YouTube and DevTools (F12)
# Console logs from content script appear here
# Check for: [BaitSense] Content script loaded
```

**Background Script Debugging:**
```bash
# Go to chrome://extensions/
# Click "Inspect views: service worker" under BaitSense
# New DevTools window opens for background script
```

**Popup Debugging:**
```bash
# Right-click the BaitSense icon
# Select "Inspect popup"
# DevTools opens for the popup
```

### Development Workflow

1. **Make code changes** in `src/`

2. **Rebuild:**
   ```bash
   # If using watch mode, changes rebuild automatically
   npm run dev

   # Otherwise, rebuild manually
   npm run build
   ```

3. **Reload the extension:**
   - Go to `chrome://extensions/`
   - Click the refresh icon on the BaitSense card
   - Or use the keyboard shortcut: `Ctrl+R` (Windows/Linux) or `Cmd+R` (Mac)

4. **Refresh YouTube page** to load updated content script

### Common Issues

**Extension not loading:**
- Ensure you selected the project root folder, not `dist/`
- Check for syntax errors in `manifest.json`
- Look for errors in the extension card

**Tooltips not appearing:**
- Check browser console for errors
- Verify content script is injected: look for `[BaitSense] Content script loaded`
- Ensure you're on youtube.com (not other domains)

**TypeScript errors in IDE:**
- Run `npm install` to install type definitions
- Restart your IDE/TypeScript server

**Build errors:**
- Delete `node_modules/` and `dist/`, then run `npm install` again
- Check Node.js version (18+ required)

## Customization

### AI Integration

The current implementation uses mock analysis. To integrate a real AI API:

1. **Open `src/services/analyzer.ts`**

2. **Replace the `performAnalysis` method** with your AI API call:

```typescript
private static async performAnalysis(video: VideoData): Promise<ClickbaitAnalysis> {
  const settings = await StorageManager.getSettings();
  
  const response = await fetch(settings.apiEndpoint || 'YOUR_API_ENDPOINT', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      title: video.title,
      thumbnail: video.thumbnailUrl,
      channel: video.channelName
    })
  });

  const data = await response.json();
  
  return {
    videoId: video.videoId,
    score: data.score,
    verdict: data.verdict,
    reasons: data.reasons,
    confidence: data.confidence,
    analyzedAt: Date.now()
  };
}
```

3. **Add API settings to popup** (already has fields for `apiEndpoint` and `apiKey`)

### Styling

- **Tooltip styles:** `src/content/styles.css`
- **Popup styles:** `src/popup/styles.css`
- **Color scheme:** Modify gradient colors in CSS files

### Icons

Add your own icons to `public/icons/`:
- `icon16.png` - 16x16px
- `icon32.png` - 32x32px
- `icon48.png` - 48x48px
- `icon128.png` - 128x128px

## Scripts

```bash
npm run dev          # Development build with watch mode
npm run build        # Production build (minified)
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
npm run type-check   # Check TypeScript types
npm run clean        # Remove dist folder
```

## Tech Stack

- **TypeScript** - Type-safe JavaScript
- **Webpack** - Module bundler
- **Chrome Extension Manifest V3** - Latest extension format
- **CSS3** - Modern styling with gradients and animations
- **ESLint** - Code linting

## Browser Support

- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ✅ Opera
- ❌ Firefox (uses different extension API)

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Note:** This extension currently uses mock clickbait detection. Integrate with your preferred AI API (OpenAI, Claude, Gemini, etc.) for production use.
