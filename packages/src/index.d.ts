import type { App } from 'vue'

export interface ImageViewerOptions {
  /**
   * Use transparent dark overlay instead of solid background
   * @default true
   */
  transparentBg?: boolean

  /**
   * Automatically show thumbnails on desktop
   * @default true
   */
  autoShowThumbnails?: boolean
}

declare const ImageViewerPlugin: (
  app: App,
  options?: ImageViewerOptions
) => void

export default ImageViewerPlugin
