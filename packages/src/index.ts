import { createApp, h, App, ref, ComponentPublicInstance } from 'vue'
import ImageViewer from './ImageViewer.vue'

// Тип для методов, которые "экспозит" ImageViewer.vue
interface ImageViewerExpose {
  open: (src: string, alt?: string, originEl?: HTMLImageElement) => void
}

export default function ImageViewerP(app: App) {
  if (typeof window === 'undefined') return
  if ((window as any).__vitepress_image_viewer_installed) return
  ;(window as any).__vitepress_image_viewer_installed = true

  const mountNode = document.createElement('div')
  document.body.appendChild(mountNode)

  const viewerRef = ref<ComponentPublicInstance<ImageViewerExpose> | null>(null)

  const viewerApp = createApp({
    render: () => h(ImageViewer, { ref: viewerRef })
  })

  viewerApp.mount(mountNode)

  setTimeout(() => {
    const imgs = document.querySelectorAll<HTMLImageElement>('img:not(.no-viewer)')
    imgs.forEach(img => {
      img.style.cursor = 'zoom-in'
      img.addEventListener('click', () => {
if (
  viewerRef.value &&
  typeof viewerRef.value.open === 'function' &&
  !(viewerRef.value as any).visible
) {
  viewerRef.value.open(img.src, img.alt || '', img)
}
      })
    })
  }, 100)
}
