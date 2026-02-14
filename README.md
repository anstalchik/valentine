# ValentineOS - Romantic Cyberpunk Mini-Game

A desktop-only romantic cyberpunk Valentine SPA mini-game built with React, TypeScript, Vite, Tailwind CSS, and HeroUI.

## Features

- 🎮 **Interactive Mini-Game**: Complete 5 trials to unlock the final message
- 🎨 **Cyberpunk Aesthetic**: Neon pink/purple accents with dark glossy panels
- 🌓 **Light/Dark Mode**: Toggle between themes with consistent color tokens
- ⌨️ **Typewriter Effects**: Narrative text appears with typewriter animation (respects reduced motion)
- 🎯 **Dodge Button**: NO button that playfully dodges your cursor
- 📊 **Love Meter**: Track progress with a sleek progress bar
- 🏆 **Achievements**: Unlock achievements based on your performance
- 🎁 **Rewards System**: Cycle through reward cards on victory
- 🎪 **Easter Eggs**: Konami code and patch notes modal

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **HeroUI** for UI components (Button, Card, Modal, Progress, Switch)
- **Framer Motion** for animations

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

The production build will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Deployment

### GitHub Pages

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to GitHub Pages:
   - Go to your repository Settings > Pages
   - Set source to "Deploy from a branch"
   - Select the branch containing your `dist` folder
   - Or use GitHub Actions for automatic deployment

### Other Static Hosting

The `dist` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- Cloudflare Pages
- AWS S3 + CloudFront
- etc.

## Customization

### Edit Questions

Edit the `QUESTIONS` array in `src/App.tsx`:

```typescript
// EDIT HERE: Questions array
const QUESTIONS = [
  'Trial 1: Your question here',
  'Trial 2: Another question',
  // ...
];
```

### Edit Text Copy

- **Landing screen**: Edit text in the Landing Screen section of `src/App.tsx`
- **Intro screen**: Edit the Typewriter text array in the Intro Screen section
- **Patch notes**: Edit the `patchNotes` array in `src/components/PatchNotesModal.tsx`
- **Rewards**: Edit the `rewards` array in `src/App.tsx` (Victory Screen section)

### Edit Colors

Colors are configured in multiple places:

1. **Tailwind config**: `tailwind.config.js` - Primary (pink) and Secondary (purple) color scales
2. **HeroUI theme**: `src/theme.ts` - Theme configuration for HeroUI components
3. **CSS variables**: `src/styles.css` - Custom CSS variables for cyberpunk effects

To change the primary/secondary colors:
- Update the color values in `tailwind.config.js`
- Update the corresponding values in `src/theme.ts`
- Adjust CSS variables in `src/styles.css` if needed

## Project Structure

```
valentine-spa/
├── src/
│   ├── components/
│   │   ├── DesktopGate.tsx      # Desktop-only gate screen
│   │   ├── DodgeButton.tsx      # NO button with dodge behavior
│   │   ├── HUD.tsx              # Trial counter, love meter, theme toggle
│   │   ├── HeartConfetti.tsx    # Victory celebration effect
│   │   ├── PatchNotesModal.tsx  # Easter egg modal
│   │   ├── TerminalOverlay.tsx # Transition overlay
│   │   ├── ToastStack.tsx       # Achievement toast notifications
│   │   └── Typewriter.tsx       # Typewriter text effect
│   ├── App.tsx                  # Main app with state machine
│   ├── main.tsx                 # Entry point
│   ├── theme.ts                 # HeroUI theme configuration
│   └── styles.css               # Global styles + cyberpunk effects
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Game Flow

1. **Landing**: Click YES to start (NO button dodges)
2. **Intro**: Read instructions, press Enter to proceed
3. **Trials**: Complete 5 trials by clicking YES
   - Trials 1-4: NO button dodges
   - Trial 5: NO opens a modal (cosmetic choice)
4. **Victory**: View rewards, achievements, and leaderboard

## Easter Eggs

- **Konami Code**: ↑ ↑ ↓ ↓ ← → ← → B A
  - Unlocks secret reward: "Unlimited hugs license"
- **Patch Notes**: Click the "?" button in bottom-left corner

## Accessibility

- Respects `prefers-reduced-motion` media query
- Typewriter animations disabled when reduced motion is enabled
- Keyboard navigation support (Enter key on intro screen)

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Desktop only (viewport width < 900px shows gate screen)

## License

MIT
