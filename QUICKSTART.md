# Quick Start Guide

Get BaitSense running in 5 minutes! 🚀

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Build the Extension

```bash
npm run build
```

You should see output like:
```
asset content.js 15.2 KiB [emitted] (name: content)
asset background.js 12.8 KiB [emitted] (name: background)
asset popup.js 8.4 KiB [emitted] (name: popup)
webpack compiled successfully
```

## Step 3: Load in Browser

1. Open Chrome and go to: **`chrome://extensions/`**

2. Toggle **"Developer mode"** ON (top-right corner)

3. Click **"Load unpacked"**

4. Select the **BaitSense folder** (the one containing `manifest.json`)

5. You should see BaitSense appear in your extensions!

## Step 4: Test It

1. Go to **https://www.youtube.com**

2. **Hover** over any video thumbnail

3. Wait ~500ms and a **tooltip appears** with clickbait analysis! 🎯

## Step 5: Configure Settings

1. Click the **BaitSense icon** in your browser toolbar

2. Adjust settings:
   - **Enable Detection** - Toggle on/off
   - **Sensitivity Threshold** - Set minimum score to show warnings
   - **Cache Duration** - How long to cache results

3. Click **Save Settings**

## Development Mode

For active development with auto-rebuild:

```bash
npm run dev
```

This watches for file changes and rebuilds automatically.

**After making changes:**
1. Go to `chrome://extensions/`
2. Click the **refresh icon** on BaitSense
3. **Refresh YouTube page**

## Troubleshooting

**Extension won't load?**
- Make sure you selected the project root folder (not `dist/`)
- Check for errors in the extension card

**No tooltips appearing?**
- Open DevTools (F12) and check Console
- Look for `[BaitSense] Content script loaded`
- Make sure you're on youtube.com

**TypeScript errors?**
- Run `npm install` to get type definitions
- Restart your IDE

## Next Steps

- Read [README.md](./README.md) for full documentation
- Check [DEVELOPMENT.md](./DEVELOPMENT.md) for development guide
- Customize `src/services/analyzer.ts` to integrate real AI API

## Need Help?

Check the console logs:
- **Content script**: Open YouTube → F12 → Console
- **Background script**: `chrome://extensions/` → "Inspect views: service worker"
- **Popup**: Right-click extension icon → "Inspect popup"

All BaitSense logs are prefixed with `[BaitSense]`

---

Happy coding! 🎯
