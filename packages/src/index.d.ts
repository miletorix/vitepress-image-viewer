import type { App } from 'vue'

export interface ImageViewerOptions {
  /**
   * Use transparent dark overlay instead of solid background
   * @default false
   */
  transparentBg?: boolean
}

declare const ImageViewerPlugin: (
  app: App,
  options?: ImageViewerOptions
) => void

export default ImageViewerPlugin
