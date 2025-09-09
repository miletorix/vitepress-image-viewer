<template>
  <Teleport to="body">
    <transition name="iv-fade">
      <div
        v-show="visible"
        class="iv-overlay"
        @click.self="tryClose"
        @wheel.prevent="onWheel"
      >
        <div class="iv-controls">
          <div class="iv-left">
            <div class="iv-counter" title="Position in gallery">{{ displayIndex }} / {{ totalImages }}</div>
          </div>

          <div class="iv-buttons" role="toolbar" aria-label="Image viewer controls">
            <button @click="zoomOut" :disabled="!canZoomOut" aria-label="Zoom out" title="Zoom out">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M8 11h6"/></svg>
            </button>

            <button @click="zoomIn" :disabled="!canZoomIn" aria-label="Zoom in" title="Zoom in">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M11 8v6m-3-3h6"/></svg>
            </button>

            <button @click="resetTransform" :disabled="!canReset" aria-label="Reset" title="Reset">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M813.176 180.706a60.235 60.235 0 0 1 60.236 60.235v481.883a60.235 60.235 0 0 1-60.236 60.235H210.824a60.235 60.235 0 0 1-60.236-60.235V240.94a60.235 60.235 0 0 1 60.236-60.235h602.352zm0-60.235H210.824A120.47 120.47 0 0 0 90.353 240.94v481.883a120.47 120.47 0 0 0 120.47 120.47h602.353a120.47 120.47 0 0 0 120.471-120.47V240.94a120.47 120.47 0 0 0-120.47-120.47zm-120.47 180.705a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 0 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118m-361.412 0a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 1 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118M512 361.412a30.12 30.12 0 0 0-30.118 30.117v30.118a30.118 30.118 0 0 0 60.236 0V391.53A30.12 30.12 0 0 0 512 361.412M512 512a30.12 30.12 0 0 0-30.118 30.118v30.117a30.118 30.118 0 0 0 60.236 0v-30.117A30.12 30.12 0 0 0 512 512"/></svg>
            </button>

            <button @click="toggleThumbs" aria-label="Toggle thumbnails" title="Toggle thumbnails">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M9.5 3a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M3 9.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3M9.5 8a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0m5 0a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M13 4.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3M4.5 3a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M8 14.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3m6.5-1.5a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0M3 14.5a1.5 1.5 0 1 0 0-3a1.5 1.5 0 0 0 0 3" clip-rule="evenodd" /></svg>
            </button>

            <button @click="downloadCurrent" aria-label="Download" title="Download">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22c-9 1-8-10 0-9C6 2 23 2 22 10c10-3 10 13 1 12m-12 4l5 4l5-4m-5-10v14"/></svg>
            </button>

            <button @click="close" aria-label="Close" title="Close">
              <svg class="iv-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z"/></svg>
            </button>
          </div>
        </div>

        <div class="iv-side-nav">
          <button class="iv-side iv-side-left" @click="prevImage" :disabled="!hasPrev" aria-label="Previous">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M22 12H2m9-9l-9 9l9 9" /></svg>
          </button>
          <button class="iv-side iv-side-right" @click="nextImage" :disabled="!hasNext" aria-label="Next">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" stroke-width="2" d="M2 12h20m-9-9l9 9l-9 9" /></svg>
          </button>
        </div>

        <transition :name="imageTransition" mode="out-in">
          <div v-if="src" :key="src + '-' + selectedIndex" class="iv-image-wrap">
            <img
              ref="animatedImage"
              :src="src"
              v-bind="alt ? { alt } : {}"
              class="iv-image"
              :style="imageStyle"
              @mousedown="startDrag"
              @touchstart="startDrag"
              draggable="false"
            />
          </div>
        </transition>

        <div v-if="!thumbnailsVisible && alt" class="iv-caption" role="note">{{ alt }}</div>

        <transition name="iv-slide-up">
          <div v-if="thumbnailsVisible" class="iv-thumbs-bottom" role="region" aria-label="Thumbnails panel">
            <div class="iv-thumbs-inner">
              <div
                v-for="(t, idx) in visibleThumbs"
                :key="t.src + '_' + (thumbOffset + idx)"
                class="iv-thumb"
                :class="{ active: thumbOffset + idx === selectedIndex }"
                @click="selectByIndex(thumbOffset + idx)"
                role="button"
                tabindex="0"
              >
                <img :src="t.src" v-bind="t.alt ? { alt: t.alt } : {}" />
              </div>
            </div>
          </div>
        </transition>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'

const visible = ref(false)
const src = ref('')
const alt = ref('')
const scale = ref(1)
const position = reactive({ x: 0, y: 0 })
const dragging = ref(false)
const dragged = ref(false)
const start = ref({ x: 0, y: 0 })
const lastOpenTime = ref(0)

const minScale = 0.5
const maxScale = 3
const canZoomIn = computed(() => scale.value < maxScale - 1e-9)
const canZoomOut = computed(() => scale.value > minScale + 1e-9)
const canReset = computed(() => Math.abs(scale.value - 1) > 1e-6 || position.x !== 0 || position.y !== 0)

const animatedImage = ref<HTMLImageElement | null>(null)

const thumbnailsVisible = ref(false)
const pageImages = ref<Array<{ src: string; alt: string }>>([])
const selectedIndex = ref(-1)
const isMobile = ref(window.innerWidth < 768)
let thumbOffset = ref(0) as any

let lastScopeRoot: Element | null = null

const imageTransition = ref('iv-fade')

function collectPageImages(root?: Element | null) {
  const selectorsToExclude = [
    'nav',
    'header',
    '.navbar',
    '.site-logo',
    '.logo',
    '.vp-nav',
    '.vp-site-logo',
    '.theme-toggle',
    '.vp-navbar',
    '.link-card-logo',
    '.thumb'
  ]

  const defaultRoot = document.querySelector('main, article, .content, .vp-doc, .theme-doc, #main')
  const scope: Element | Document = root ?? defaultRoot ?? document

  const nodeList = Array.from(scope.querySelectorAll<HTMLImageElement>('img:not(.no-viewer)'))
  const minSize = 60;
  const filtered = nodeList.filter(img => {
    for (const sel of selectorsToExclude) {
      if (img.closest(sel)) return false
    }
    if (!img.src) return false
    if (img.classList.contains('iv-thumb')) return false
    

    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      if (img.naturalWidth < minSize && img.naturalHeight < minSize) {
        return false;
      }
    }
    return true
  })

  const seen = new Set<string>()
  const list: Array<{ src: string; alt: string }> = []
  filtered.forEach(i => {
    const s = (i.currentSrc || i.src).split('#')[0]
    if (!seen.has(s)) {
      seen.add(s)
      const a = i.getAttribute('alt') ?? ''
      list.push({ src: s, alt: a })
    }
  })

  pageImages.value = list
}

async function open(imageSrc: string, imageAlt = '', originEl?: HTMLImageElement) {
  const rootCandidate = originEl?.closest('main, article, .content, .vp-doc, .theme-doc, #main') ?? document.querySelector('main, article, .content, .vp-doc, .theme-doc, #main') ?? null
  lastScopeRoot = rootCandidate

  collectPageImages(lastScopeRoot ?? undefined)

  imageTransition.value = 'iv-fade'

  const normalized = (imageSrc || '').split('#')[0]
  const originAlt = originEl?.getAttribute('alt') ?? imageAlt ?? ''
  let idx = pageImages.value.findIndex(i => i.src === normalized)

  if (idx === -1) {
    pageImages.value.unshift({ src: normalized, alt: originAlt })
    idx = 0
  }

  selectedIndex.value = idx
  src.value = pageImages.value[selectedIndex.value].src
  alt.value = originAlt || pageImages.value[selectedIndex.value].alt || ''
  scale.value = 1
  position.x = 0
  position.y = 0
  visible.value = true
  lastOpenTime.value = Date.now()

  await nextTick()
}

defineExpose({ open, visible })

const OVERLAY_FADE_MS = 300

function close() {
  visible.value = false
  thumbnailsVisible.value = false
  imageTransition.value = 'iv-fade'

  setTimeout(() => {
    src.value = ''
    alt.value = ''
    selectedIndex.value = -1
    pageImages.value = []
    lastScopeRoot = null
    scale.value = 1
    position.x = 0
    position.y = 0
  }, OVERLAY_FADE_MS + 20)
}

function tryClose() {
  if (Date.now() - lastOpenTime.value < 300) return
  close()
}

function resetTransform() {
  scale.value = 1
  position.x = 0
  position.y = 0
  dragged.value = false
}
function zoomIn() { scale.value = Math.min(scale.value + 0.1, maxScale) }
function zoomOut() { scale.value = Math.max(scale.value - 0.1, minScale) }
function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.min(Math.max(minScale, scale.value + delta), maxScale)
}

function startDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true
  dragged.value = false
  const point = 'touches' in e ? e.touches[0] : e
  start.value = { x: point.clientX - position.x, y: point.clientY - position.y }
  window.addEventListener('mousemove', onDrag)
  window.addEventListener('mouseup', stopDrag)
  window.addEventListener('touchmove', onDrag, { passive: false })
  window.addEventListener('touchend', stopDrag)
}
function onDrag(e: MouseEvent | TouchEvent) {
  if (!dragging.value) return
  const point = 'touches' in e ? e.touches[0] : e
  position.x = point.clientX - start.value.x
  position.y = point.clientY - start.value.y
  dragged.value = true
  e.preventDefault()
}
function stopDrag() {
  dragging.value = false
  window.removeEventListener('mousemove', onDrag)
  window.removeEventListener('mouseup', stopDrag)
  window.removeEventListener('touchmove', onDrag)
  window.removeEventListener('touchend', stopDrag)
}

function toggleThumbs() {
  collectPageImages(lastScopeRoot ?? undefined)
  thumbnailsVisible.value = !thumbnailsVisible.value
}

function selectByIndex(i: number) {
  if (i < 0 || i >= pageImages.value.length) return

  if (selectedIndex.value === -1) {
    imageTransition.value = 'iv-fade'
  } else if (i > selectedIndex.value) {
    imageTransition.value = 'iv-slide-left'
  } else if (i < selectedIndex.value) {
    imageTransition.value = 'iv-slide-right'
  } else {
    imageTransition.value = 'iv-fade'
  }

  selectedIndex.value = i
  src.value = pageImages.value[i].src
  alt.value = pageImages.value[i].alt || ''
  resetTransform()
}

const hasPrev = computed(() => selectedIndex.value > 0)
const hasNext = computed(() => selectedIndex.value >= 0 && selectedIndex.value < pageImages.value.length - 1)

function prevImage() {
  if (!pageImages.value.length) return
  if (!hasPrev.value) return
  selectByIndex(selectedIndex.value - 1)
}
function nextImage() {
  if (!pageImages.value.length) return
  if (!hasNext.value) return
  selectByIndex(selectedIndex.value + 1)
}

function onKeyDown(e: KeyboardEvent) {
  if (!visible.value) return
  if (e.key === 'Escape') close()
  else if (e.key === 'ArrowLeft') prevImage()
  else if (e.key === 'ArrowRight') nextImage()
}

let initialDistance = 0
let initialScale = 1
function getDistance(touches: TouchList) {
  const [t1, t2] = [touches[0], touches[1]]
  const dx = t2.clientX - t1.clientX
  const dy = t2.clientY - t1.clientY
  return Math.sqrt(dx * dx + dy * dy)
}
function onTouchStart(e: TouchEvent) {
  if (e.touches.length === 2) {
    initialDistance = getDistance(e.touches)
    initialScale = scale.value
  }
}
function onTouchMove(e: TouchEvent) {
  if (e.touches.length === 2) {
    e.preventDefault()
    const newDistance = getDistance(e.touches)
    const scaleChange = newDistance / initialDistance
    scale.value = Math.min(Math.max(minScale, initialScale * scaleChange), maxScale)
  }
}
function onTouchEnd(e: TouchEvent) { if (e.touches.length < 2) initialDistance = 0 }

function downloadCurrent() {
  const link = document.createElement('a')
  link.href = src.value
  link.download = alt.value || 'image'
  link.click()
}

const imageStyle = computed(() => ({
  transform: `translate(${position.x}px, ${position.y}px) scale(${scale.value})`,
  transition: dragging.value ? 'none' : 'transform 0.28s ease, opacity 0.22s ease',
  cursor: dragging.value ? 'grabbing' : 'grab',
  zIndex: 9999,
}))

const totalImages = computed(() => pageImages.value.length)
const displayIndex = computed(() => (selectedIndex.value >= 0 ? selectedIndex.value + 1 : 0))

const visibleThumbs = computed(() => {
  const total = pageImages.value.length
  if (!total || selectedIndex.value < 0) return []
  const count = isMobile.value ? 1 : 2
  const windowSize = count * 2 + 1
  let start = Math.max(0, selectedIndex.value - count)
  if (start + windowSize > total) start = Math.max(0, total - windowSize)
  thumbOffset.value = start
  return pageImages.value.slice(start, Math.min(total, start + windowSize))
})

function onResize() { isMobile.value = window.innerWidth < 768 }

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
  window.addEventListener('resize', onResize)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.iv-overlay {
  position: fixed;
  inset: 0;
  background: var(--vp-code-block-bg);
  z-index: 9998;
  user-select: none;
  transition: opacity 0.25s ease;
}

.iv-fade-enter-active,
.iv-fade-leave-active { transition: opacity 0.25s ease; }
.iv-fade-enter-from,
.iv-fade-leave-to { opacity: 0; }

.iv-controls {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background: var(--vp-c-bg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 0 16px;
  z-index: 10000;
  box-sizing: border-box;
  border-bottom: 1px solid var(--vp-c-divider);
  flex-wrap: nowrap;
}
.iv-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.iv-counter { color: var(--vp-c-text-1); font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 160px; }

.iv-buttons { display: flex; gap: 8px; align-items: center; flex: 0 0 auto; }
.iv-buttons button { background: transparent; color: var(--vp-c-text-1); border: none; border-radius: 6px; padding: 6px; cursor: pointer; font-size: 18px; display: inline-flex; align-items: center; justify-content: center; min-width: 36px; min-height: 36px; transition: all 0.3s ease; }
.iv-buttons button:hover:not(:disabled) { background-color: var(--vp-c-brand-soft); color: var(--vp-c-brand-1) }
.iv-buttons button:disabled { opacity: 0.4; cursor: not-allowed }
.iv-icon { width: 26px; height: 26px; display: block; }

.iv-side-nav { position: fixed; inset: 0; z-index: 10000; pointer-events: none; }
.iv-side { position: absolute; top: 50%; opacity: 0.6; transform: translateY(-50%); width: 56px; height: 56px; border-radius: 999px; border: none; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-size: 28px; display: inline-grid; place-items: center; cursor: pointer; pointer-events: auto; transition: all 0.3s ease; }
.iv-side:hover { color: var(--vp-c-brand-1); opacity: 1; }
.iv-side-left { left: 12px }
.iv-side-right { right: 12px }
.iv-side:disabled { opacity: 0.35; cursor: not-allowed; }

.iv-image-wrap {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.iv-image {
  position: relative;
  border-radius: 8px;
  user-select: none;
  -webkit-user-drag: none;
  object-fit: contain;
  max-width: 90vw;
  max-height: 80vh;
  pointer-events: auto;
  transform-origin: center center;
  display: block;
}

.iv-caption { position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); color: var(--vp-c-text-1); font-size: 0.95rem; text-align: center; user-select: none; pointer-events: none; z-index: 10001 }

.iv-thumbs-bottom { position: fixed; bottom: 0; left: 0; width: 100%; background: var(--vp-c-bg); z-index: 10000; box-shadow: 0 -4px 18px rgba(0,0,0,0.06); border-top: 1px solid var(--vp-c-divider); }
.iv-thumbs-inner { display: flex; gap: 10px; padding: 12px; justify-content: center; overflow: auto; -webkit-overflow-scrolling: touch }
.iv-thumb { width: 84px; height: 56px; flex: 0 0 auto; border-radius: 6px; overflow: hidden; display: inline-grid; place-items: center; cursor: pointer; transition: transform 0.18s ease }
.iv-thumb img { width: 100%; height: 100%; object-fit: cover; filter: brightness(0.5); opacity: 0.5; transition: filter 0.18s ease, transform 0.18s ease }
.iv-thumb.active img { filter: brightness(1); opacity: 1; transition: all 0.3s ease; }
.iv-thumb:focus { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px }

.iv-slide-up-enter-active, .iv-slide-up-leave-active { transition: transform 0.28s ease, opacity 0.22s ease }
.iv-slide-up-enter-from, .iv-slide-up-leave-to { transform: translateY(100%); opacity: 0 }

.iv-slide-left-enter-active, .iv-slide-left-leave-active,
.iv-slide-right-enter-active, .iv-slide-right-leave-active {
  transition: transform 0.28s ease, opacity 0.22s ease;
}
.iv-slide-left-enter-from { transform: translate(calc(-50% + 100vw), -50%); opacity: 0; }
.iv-slide-left-leave-to   { transform: translate(calc(-50% - 100vw), -50%); opacity: 0; }

.iv-slide-right-enter-from { transform: translate(calc(-50% - 100vw), -50%); opacity: 0; }
.iv-slide-right-leave-to   { transform: translate(calc(-50% + 100vw), -50%); opacity: 0; }

.iv-fade-enter-active, .iv-fade-leave-active { transition: opacity 0.25s ease; }
.iv-fade-enter-from, .iv-fade-leave-to { opacity: 0; }

@media (max-width: 600px) {
  .iv-controls { height: 44px; padding: 0 12px; gap: 6px; }
  .iv-icon { width: 25px; height: 25px; }
  .iv-counter { font-size: 0.82rem; max-width: 100px; }
  .iv-buttons button { padding: 6px; min-width: 32px; min-height: 32px; }
  .iv-side { width: 48px; height: 48px; font-size: 22px; }
  .iv-thumb { width: 74px; height: 48px; }
}
</style>
