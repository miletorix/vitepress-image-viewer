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
          <button @click="zoomOut"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="currentColor" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14M7 10.5v-2h5v2z" />
</svg></button>
          <button @click="zoomIn"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="currentColor" d="m19.6 21l-6.3-6.3q-.75.6-1.725.95T9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l6.3 6.3zM9.5 14q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14m-1-1.5v-2h-2v-2h2v-2h2v2h2v2h-2v2z" />
</svg></button>
          <button @click="resetTransform"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="currentColor" d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3s-3 1.331-3 3s1.329 3 3 3" />
	<path fill="currentColor" d="M20.817 11.186a8.9 8.9 0 0 0-1.355-3.219a9 9 0 0 0-2.43-2.43a9 9 0 0 0-3.219-1.355a9 9 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a7 7 0 0 1 2.502 1.053a7 7 0 0 1 1.892 1.892A6.97 6.97 0 0 1 19 13a7 7 0 0 1-.55 2.725a7 7 0 0 1-.644 1.188a7 7 0 0 1-.858 1.039a7.03 7.03 0 0 1-3.536 1.907a7.1 7.1 0 0 1-2.822 0a7 7 0 0 1-2.503-1.054a7 7 0 0 1-1.89-1.89A7 7 0 0 1 5 13H3a9 9 0 0 0 1.539 5.034a9.1 9.1 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9 9 0 0 0 1.814-.183a9 9 0 0 0 3.218-1.355a9 9 0 0 0 1.331-1.099a9 9 0 0 0 1.1-1.332A8.95 8.95 0 0 0 21 13a9 9 0 0 0-.183-1.814" />
</svg></button>
          <button @click="downloadCurrent"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 32 32">
	<path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 22c-9 1-8-10 0-9C6 2 23 2 22 10c10-3 10 13 1 12m-12 4l5 4l5-4m-5-10v14" />
</svg></button>
          <button @click="close"><svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
	<path fill="currentColor" d="M6.4 19L5 17.6l5.6-5.6L5 6.4L6.4 5l5.6 5.6L17.6 5L19 6.4L13.4 12l5.6 5.6l-1.4 1.4l-5.6-5.6z" />
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

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<style scoped>
.iv-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
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
  top: 20px;
  right: 20px;
  display: flex;
  gap: 10px;
  z-index: 10000;
}
.iv-controls button {
  background: #222;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  cursor: pointer;
  font-size: 20px;
}
.iv-controls button:hover {
  background: #555;
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
  color: #ccc;
  font-size: 1rem;
  text-align: center;
  user-select: none;
  pointer-events: none;
  z-index: 10001;
}
</style>
