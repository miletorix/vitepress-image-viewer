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
          <button @click="zoomOut" :disabled="!canZoomOut" aria-label="Zoom out" title="Zoom out"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M8 11h6" />
</svg></button>
          <button @click="zoomIn":disabled="!canZoomIn" aria-label="Zoom in" title="Zoom in"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M11 8v6m-3-3h6" />
</svg></button>
          <button @click="resetTransform" :disabled="!canReset" aria-label="Crop to original" title="Crop to original"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 1024 1024">
	<path fill="currentColor" d="M813.176 180.706a60.235 60.235 0 0 1 60.236 60.235v481.883a60.235 60.235 0 0 1-60.236 60.235H210.824a60.235 60.235 0 0 1-60.236-60.235V240.94a60.235 60.235 0 0 1 60.236-60.235h602.352zm0-60.235H210.824A120.47 120.47 0 0 0 90.353 240.94v481.883a120.47 120.47 0 0 0 120.47 120.47h602.353a120.47 120.47 0 0 0 120.471-120.47V240.94a120.47 120.47 0 0 0-120.47-120.47zm-120.47 180.705a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 0 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118m-361.412 0a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 1 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118M512 361.412a30.12 30.12 0 0 0-30.118 30.117v30.118a30.118 30.118 0 0 0 60.236 0V391.53A30.12 30.12 0 0 0 512 361.412M512 512a30.12 30.12 0 0 0-30.118 30.118v30.117a30.118 30.118 0 0 0 60.236 0v-30.117A30.12 30.12 0 0 0 512 512" />
</svg></button>
          <button @click="downloadCurrent" aria-label="Download" title="Download"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 32 32">
	<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22c-9 1-8-10 0-9C6 2 23 2 22 10c10-3 10 13 1 12m-12 4l5 4l5-4m-5-10v14" />
</svg></button>
          <button @click="close" aria-label="Close" title="Close"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="currentColor" d="m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z" />
</svg></button>
        </div>
        <img
          v-if="src"
          ref="animatedImage"
          :src="src"
          :alt="alt"
          class="iv-image"
          :style="imageStyle"
          @mousedown="startDrag"
          @touchstart="startDrag"
          draggable="false"
        />
        <div class="iv-caption">{{ alt }}</div>
      </div>
    </transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, computed } from 'vue'

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
const canZoomIn = computed(() => scale.value < maxScale)
const canZoomOut = computed(() => scale.value > minScale)
const canReset = computed(() => scale.value !== 1)

const animatedImage = ref<HTMLImageElement | null>(null)
let startRect: DOMRect | null = null

async function open(imageSrc: string, imageAlt = '', originEl?: HTMLImageElement) {
  if (!originEl) return

  src.value = imageSrc
  alt.value = imageAlt
  scale.value = 1
  position.x = 0
  position.y = 0
  visible.value = true
  document.body.style.overflow = 'hidden'
  lastOpenTime.value = Date.now()

await nextTick() 

const img = animatedImage.value
if (!img || !originEl) return

startRect = originEl.getBoundingClientRect()
const { width, height, top, left } = startRect

const style = img.style
style.transition = 'none'

style.position = 'fixed'
style.top = `${top}px`
style.left = `${left}px`
style.width = `${width}px`
style.height = `${height}px`
style.transform = 'none'

void img.offsetHeight

const targetScale = Math.min(
  window.innerWidth * 0.9 / width,
  window.innerHeight * 0.8 / height
)
const targetWidth = width * targetScale
const targetHeight = height * targetScale
const targetX = (window.innerWidth - targetWidth) / 2
const targetY = (window.innerHeight - targetHeight) / 2

requestAnimationFrame(() => {
  style.transition = 'all 0.4s ease'
  style.top = `${targetY}px`
  style.left = `${targetX}px`
  style.width = `${targetWidth}px`
  style.height = `${targetHeight}px`
})

setTimeout(() => {
  style.transition = 'none'
}, 400)

}

defineExpose({ open, visible })
function close() {
  const img = animatedImage.value
  if (!img || !startRect) {
    visible.value = false
    document.body.style.overflow = ''
    return
  }

  scale.value = 1
  position.x = 0
  position.y = 0

  setTimeout(() => {
    const { top, left, width, height } = startRect!

    img.style.transition = 'all 0.3s ease'
    img.style.top = `${top}px`
    img.style.left = `${left}px`
    img.style.width = `${width}px`
    img.style.height = `${height}px`

    setTimeout(() => {
      visible.value = false
      document.body.style.overflow = ''
    }, 300)
  }, 100)
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

function zoomIn() {
  scale.value = Math.min(scale.value + 0.1, 3)
}
function zoomOut() {
  scale.value = Math.max(scale.value - 0.1, 0.5)
}
function onWheel(e: WheelEvent) {
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  scale.value = Math.min(Math.max(0.5, scale.value + delta), 3)
}

function startDrag(e: MouseEvent | TouchEvent) {
  dragging.value = true
  dragged.value = false
  const point = 'touches' in e ? e.touches[0] : e
  start.value = {
    x: point.clientX - position.x,
    y: point.clientY - position.y,
  }

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

function downloadCurrent() {
  const link = document.createElement('a')
  link.href = src.value
  link.download = alt.value || 'image'
  link.click()
}

const imageStyle = computed(() => ({
  transform: `translate(${position.x}px, ${position.y}px) scale(${scale.value})`,
  transition: dragging.value ? 'none' : 'transform 0.3s ease',
  cursor: dragging.value ? 'grabbing' : 'grab',
  zIndex: 9999,
}))

function onKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && visible.value) {
    close()
  }
}

let initialDistance = 0
let initialScale = 1

function getDistance(touches: TouchList) {
  const [touch1, touch2] = [touches[0], touches[1]]
  const dx = touch2.clientX - touch1.clientX
  const dy = touch2.clientY - touch1.clientY
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
    scale.value = Math.min(Math.max(0.5, initialScale * scaleChange), 3)
  }
}

function onTouchEnd(e: TouchEvent) {
  if (e.touches.length < 2) {
    initialDistance = 0
  }
}


onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('touchstart', onTouchStart, { passive: false })
  window.addEventListener('touchmove', onTouchMove, { passive: false })
  window.addEventListener('touchend', onTouchEnd)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchmove', onTouchMove)
  window.removeEventListener('touchend', onTouchEnd)
})
</script>

<style scoped>
.iv-overlay {
  position: fixed;
  inset: 0;
  background: var(--vp-code-block-bg);
  z-index: 9998;
  user-select: none;
  transition: opacity 0.3s ease;
}
.iv-fade-enter-active,
.iv-fade-leave-active {
  transition: opacity 0.3s ease;
}
.iv-fade-enter-from,
.iv-fade-leave-to {
  opacity: 0;
}
.iv-controls {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 50px;
  background: var(--vp-c-bg); 
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 0 10px;
  z-index: 10000;
  box-sizing: border-box;
  border-bottom: 1px solid var(--vp-c-divider); 
}
.iv-controls button {
  background: transparent;
  color: var(--vp-c-text-1);
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.3s ease;
}
.iv-controls button:hover:not(:disabled) {
  background-color: var(--vp-c-brand-soft);
  color: var(--vp-c-brand-1);
}

.iv-controls button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.iv-image {
  position: fixed;
  border-radius: 8px;
  user-select: none;
  -webkit-user-drag: none;
  object-fit: contain;
  max-width: none;
  max-height: none;
  pointer-events: auto;
}

.iv-caption {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  color: var(--vp-c-text-1);
  font-size: 1rem;
  text-align: center;
  user-select: none;
  pointer-events: none;
  z-index: 10001;
}
</style>
