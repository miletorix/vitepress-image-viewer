# vitepress-image-viewer 

VitePress image viewer with zoom, drag, fullscreen overlay, captions and download button. Automatically enhances all images on the page. Built with Vue 3. 

![npm](https://img.shields.io/npm/v/@miletorix/vitepress-image-viewer)  ![npm](https://img.shields.io/npm/dw/@miletorix/vitepress-image-viewer)  ![license](https://img.shields.io/npm/l/@miletorix/vitepress-image-viewer)

## Live Demo and more information

✨ See it in action:  
👉 [https://miletorix.github.io/vitepress-image-viewer/](https://miletorix.github.io/vitepress-image-viewer/)

📦 NPM Package:  
👉 [https://www.npmjs.com/package/@miletorix/vitepress-image-viewer](https://www.npmjs.com/package/@miletorix/vitepress-image-viewer)

## Installation

```sh [npm]
npm i @miletorix/vitepress-image-viewer
```

## Usage

### Configuration

```typescript
// docs/.vitepress/theme/index.ts
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import ImageViewerP from '@miletorix/vitepress-image-viewer' //[!code ++]
import '@miletorix/vitepress-image-viewer/style.css' //[!code ++]

export default {
  extends: DefaultTheme,
  enhanceApp(ctx) {
    ImageViewerP(ctx.app) //[!code ++]
  }
}
```

## Preview

![preview](/assets/preview.gif)