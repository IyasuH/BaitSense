# Development Guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development mode (auto-rebuild on changes)
npm run dev

# In another terminal, you can run type checking
npm run type-check
```

## First Time Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the extension:**
   ```bash
   npm run build
   ```

3. **Load in browser:**
   - Open `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the BaitSense project folder

4. **Test on YouTube:**
   - Navigate to https://www.youtube.com
   - Hover over any video thumbnail
   - You should see a clickbait analysis tooltip

## Development Workflow

### Making Changes

1. **Edit source files** in `src/`
2. **Changes auto-rebuild** if using `npm run dev`
3. **Reload extension:**
   - Go to `chrome://extensions/`
   - Click refresh icon on BaitSense
4. **Refresh YouTube page** to see changes

### Testing Changes

**Content Script (tooltip on YouTube):**
- Open YouTube
- Open DevTools (F12)
- Check Console for `[BaitSense]` logs
- Hover over thumbnails to test

**Background Script (API calls):**
- Go to `chrome://extensions/`
- Click "Inspect views: service worker"
- Check Console for logs

**Popup (settings UI):**
- Right-click extension icon
- Select "Inspect popup"
- Test settings changes

## Code Architecture

### Message Flow

```
Content Script → Background Script → Analyzer Service
     ↓                    ↓                  ↓
  Tooltip         Storage Manager      AI API (mock)
```

1. **User hovers** over thumbnail (content script)
2. **Content script** sends message to background
3. **Background script** checks cache, calls analyzer
4. **Analyzer** performs clickbait detection
5. **Result** sent back to content script
6. **Tooltip** displays analysis

### Key Files

- **`src/types/index.ts`** - All TypeScript types
- **`src/utils/storage.ts`** - Chrome storage wrapper
- **`src/services/analyzer.ts`** - Clickbait detection logic (CUSTOMIZE THIS)
- **`src/content/index.ts`** - YouTube page integration
- **`src/background/index.ts`** - Message handling

## Adding Features

### Example: Add New Setting

1. **Update type definition** in `src/types/index.ts`:
   ```typescript
   export interface ExtensionSettings {
     enabled: boolean;
     threshold: number;
     cacheExpiry: number;
     newSetting: string; // Add this
   }
   ```

2. **Update default** in `src/utils/storage.ts`:
   ```typescript
   const DEFAULT_SETTINGS: ExtensionSettings = {
     enabled: true,
     threshold: 60,
     cacheExpiry: 24,
     newSetting: 'default value' // Add this
   };
   ```

3. **Add UI** in `public/popup.html`:
   ```html
   <input type="text" id="newSetting" class="input">
   ```

4. **Handle in popup** `src/popup/index.ts`:
   ```typescript
   const newSettingInput = document.getElementById('newSetting') as HTMLInputElement;
   
   // In loadSettings():
   newSettingInput.value = settings.newSetting;
   
   // In saveSettings():
   newSetting: newSettingInput.value
   ```

## Debugging Tips

### Enable Verbose Logging

The logger only shows logs in development. To see all logs:

```typescript
// src/utils/logger.ts
private isDevelopment = true; // Force to true
```

### Test Specific Video

```typescript
// src/content/index.ts
const testVideo: VideoData = {
  videoId: 'dQw4w9WgXcQ',
  title: 'YOU WON\'T BELIEVE THIS!!!',
  thumbnailUrl: '',
  channelName: 'Test'
};

handleThumbnailHover(element, testVideo);
```

### Mock API Response

```typescript
// src/services/analyzer.ts
// Return fixed score for testing
return {
  videoId: video.videoId,
  score: 95, // Always high clickbait
  verdict: 'Test verdict',
  reasons: ['Test reason'],
  confidence: 1.0,
  analyzedAt: Date.now()
};
```

## Performance Optimization

### Reduce API Calls

- Increase cache expiry (default: 24 hours)
- Increase hover delay (default: 500ms)
- Only analyze visible thumbnails

### Optimize Bundle Size

```bash
# Check bundle size
npm run build
ls -lh dist/

# Analyze bundle
npx webpack-bundle-analyzer dist/stats.json
```

## Testing Checklist

Before submitting changes:

- [ ] Extension loads without errors
- [ ] Tooltips appear on hover
- [ ] Popup opens and saves settings
- [ ] No console errors
- [ ] TypeScript compiles: `npm run type-check`
- [ ] Linting passes: `npm run lint`
- [ ] Works on YouTube home, search, and video pages
- [ ] Cache works correctly
- [ ] Statistics update properly

## Common Patterns

### Adding a New Utility Function

```typescript
// src/utils/helpers.ts
export function formatNumber(num: number): string {
  return new Intl.NumberFormat().format(num);
}

// Use in other files
import { formatNumber } from '@utils/helpers';
```

### Adding a New Message Type

```typescript
// 1. Add to enum in src/types/index.ts
export enum MessageType {
  // ... existing types
  NEW_ACTION = 'NEW_ACTION'
}

// 2. Add interface
export interface NewActionMessage extends MessagePayload {
  type: MessageType.NEW_ACTION;
  data: { /* your data */ };
}

// 3. Handle in background/index.ts
case MessageType.NEW_ACTION:
  handleNewAction(message, sendResponse);
  return true;
```

## Troubleshooting

**"Cannot find module '@types'"**
- Fix: Change imports from `@types/index` to `@types`
- Or run: `npm install`

**"chrome is not defined"**
- Fix: Install types: `npm install --save-dev @types/chrome`

**Webpack build fails**
- Fix: Delete `node_modules` and `dist`, run `npm install`

**Extension doesn't reload**
- Hard refresh: Remove and re-add extension
- Check for errors in `chrome://extensions/`

**Tooltips don't show**
- Check YouTube selectors haven't changed
- Verify content script is injected
- Check browser console for errors

## Resources

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/mv3/intro/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Webpack Documentation](https://webpack.js.org/)
