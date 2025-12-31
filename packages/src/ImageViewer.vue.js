/// <reference types="C:/Users/user1/Desktop/vitepress-image-viewer/packages/node_modules/@vue/language-core/types/template-helpers.d.ts" />
/// <reference types="C:/Users/user1/Desktop/vitepress-image-viewer/packages/node_modules/@vue/language-core/types/props-fallback.d.ts" />
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
const props = defineProps();
const autoShowThumbs = computed(() => props.autoShowThumbnails !== false);
const visible = ref(false);
const src = ref('');
const alt = ref('');
const scale = ref(1);
const position = reactive({ x: 0, y: 0 });
const dragging = ref(false);
const dragged = ref(false);
const start = ref({ x: 0, y: 0 });
const lastOpenTime = ref(0);
const minScale = 0.5;
const maxScale = 3;
const canZoomIn = computed(() => scale.value < maxScale - EPS);
const canZoomOut = computed(() => scale.value > minScale + EPS);
const canReset = computed(() => {
    return (Math.abs(scale.value - 1) > EPS ||
        Math.abs(position.x) > EPS ||
        Math.abs(position.y) > EPS);
});
const animatedImage = ref(null);
const isMobile = ref(window.innerWidth < 768);
const thumbnailsVisible = ref(!isMobile.value && autoShowThumbs.value);
const pageImages = ref([]);
const selectedIndex = ref(-1);
const EPS = 0.001;
let thumbOffset = ref(0);
let lastScopeRoot = null;
const imageTransition = ref('iv-fade');
function collectPageImages(root) {
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
    ];
    const defaultRoot = document.querySelector('main, article, .content, .vp-doc, .theme-doc, #main');
    const scope = root ?? defaultRoot ?? document;
    const nodeList = Array.from(scope.querySelectorAll('img:not(.no-viewer)'));
    const minSize = 60;
    const filtered = nodeList.filter(img => {
        for (const sel of selectorsToExclude) {
            if (img.closest(sel))
                return false;
        }
        if (!img.src)
            return false;
        if (img.classList.contains('iv-thumb'))
            return false;
        if (img.naturalWidth > 0 && img.naturalHeight > 0) {
            if (img.naturalWidth < minSize && img.naturalHeight < minSize) {
                return false;
            }
        }
        return true;
    });
    const seen = new Set();
    const list = [];
    filtered.forEach(i => {
        const s = (i.currentSrc || i.src).split('#')[0];
        if (!seen.has(s)) {
            seen.add(s);
            const a = i.getAttribute('alt') ?? '';
            list.push({ src: s, alt: a });
        }
    });
    pageImages.value = list;
}
function lockScroll() {
    document.body.style.overflow = 'hidden';
}
function unlockScroll() {
    document.body.style.overflow = '';
}
async function open(imageSrc, imageAlt = '', originEl) {
    const rootCandidate = originEl?.closest('main, article, .content, .vp-doc, .theme-doc, #main') ?? document.querySelector('main, article, .content, .vp-doc, .theme-doc, #main') ?? null;
    lastScopeRoot = rootCandidate;
    collectPageImages(lastScopeRoot ?? undefined);
    imageTransition.value = 'iv-fade';
    const normalized = (imageSrc || '').split('#')[0];
    const originAlt = originEl?.getAttribute('alt') ?? imageAlt ?? '';
    let idx = pageImages.value.findIndex(i => i.src === normalized);
    if (idx === -1) {
        pageImages.value.unshift({ src: normalized, alt: originAlt });
        idx = 0;
    }
    selectedIndex.value = idx;
    src.value = pageImages.value[selectedIndex.value].src;
    alt.value = originAlt || pageImages.value[selectedIndex.value].alt || '';
    scale.value = 1;
    position.x = 0;
    position.y = 0;
    visible.value = true;
    lockScroll();
    lastOpenTime.value = Date.now();
    await nextTick();
    if (!isMobile.value) {
        thumbnailsVisible.value =
            autoShowThumbs.value && window.innerHeight > 800;
    }
}
const __VLS_exposed = { open, visible };
defineExpose(__VLS_exposed);
const OVERLAY_FADE_MS = 300;
function close() {
    visible.value = false;
    unlockScroll();
    lastOpenTime.value = Date.now();
    thumbnailsVisible.value =
        !isMobile.value && autoShowThumbs.value;
    imageTransition.value = 'iv-fade';
    setTimeout(() => {
        src.value = '';
        alt.value = '';
        selectedIndex.value = -1;
        pageImages.value = [];
        lastScopeRoot = null;
        scale.value = 1;
        position.x = 0;
        position.y = 0;
    }, OVERLAY_FADE_MS + 20);
}
function tryClose() {
    if (Date.now() - lastOpenTime.value < 300)
        return;
    close();
}
function resetTransform() {
    scale.value = 1;
    position.x = 0;
    position.y = 0;
    dragged.value = false;
}
function zoomIn() {
    if (!canZoomIn.value)
        return;
    scale.value = Math.min(scale.value + 0.1, maxScale);
}
function zoomOut() {
    if (!canZoomOut.value)
        return;
    scale.value = Math.max(scale.value - 0.1, minScale);
}
function onWheel(e) {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const next = scale.value + delta;
    scale.value = Math.min(maxScale, Math.max(minScale, next));
}
function startDrag(e) {
    dragging.value = true;
    dragged.value = false;
    const point = 'touches' in e ? e.touches[0] : e;
    start.value = { x: point.clientX - position.x, y: point.clientY - position.y };
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);
}
function onDrag(e) {
    if (!dragging.value)
        return;
    const point = 'touches' in e ? e.touches[0] : e;
    position.x = point.clientX - start.value.x;
    position.y = point.clientY - start.value.y;
    dragged.value = true;
    e.preventDefault();
}
function stopDrag() {
    dragging.value = false;
    window.removeEventListener('mousemove', onDrag);
    window.removeEventListener('mouseup', stopDrag);
    window.removeEventListener('touchmove', onDrag);
    window.removeEventListener('touchend', stopDrag);
}
function toggleThumbs() {
    collectPageImages(lastScopeRoot ?? undefined);
    thumbnailsVisible.value = !thumbnailsVisible.value;
}
function selectByIndex(i) {
    if (i < 0 || i >= pageImages.value.length)
        return;
    if (selectedIndex.value === -1) {
        imageTransition.value = 'iv-fade';
    }
    else if (i > selectedIndex.value) {
        imageTransition.value = 'iv-slide-left';
    }
    else if (i < selectedIndex.value) {
        imageTransition.value = 'iv-slide-right';
    }
    else {
        imageTransition.value = 'iv-fade';
    }
    selectedIndex.value = i;
    src.value = pageImages.value[i].src;
    alt.value = pageImages.value[i].alt || '';
    resetTransform();
}
const hasPrev = computed(() => selectedIndex.value > 0);
const hasNext = computed(() => selectedIndex.value >= 0 && selectedIndex.value < pageImages.value.length - 1);
function prevImage() {
    if (!pageImages.value.length)
        return;
    if (!hasPrev.value)
        return;
    selectByIndex(selectedIndex.value - 1);
}
function nextImage() {
    if (!pageImages.value.length)
        return;
    if (!hasNext.value)
        return;
    selectByIndex(selectedIndex.value + 1);
}
function onKeyDown(e) {
    if (!visible.value)
        return;
    if (e.key === 'Escape')
        close();
    else if (e.key === 'ArrowLeft')
        prevImage();
    else if (e.key === 'ArrowRight')
        nextImage();
}
let initialDistance = 0;
let initialScale = 1;
function getDistance(touches) {
    const [t1, t2] = [touches[0], touches[1]];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}
function onTouchStart(e) {
    if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
        initialScale = scale.value;
    }
}
function onTouchMove(e) {
    if (e.touches.length === 2) {
        e.preventDefault();
        const newDistance = getDistance(e.touches);
        const scaleChange = newDistance / initialDistance;
        scale.value = Math.min(maxScale, Math.max(minScale, initialScale * scaleChange));
    }
}
function onTouchEnd(e) { if (e.touches.length < 2)
    initialDistance = 0; }
function downloadCurrent() {
    const link = document.createElement('a');
    link.href = src.value;
    link.download = alt.value || 'image';
    link.click();
}
const imageMaxHeight = computed(() => {
    if (!thumbnailsVisible.value)
        return '80vh';
    // desktop
    if (!isMobile.value)
        return '68vh';
    // mobile
    return '70vh';
});
const imageStyle = computed(() => ({
    transform: `translate(${position.x}px, ${position.y}px) scale(${scale.value})`,
    transition: dragging.value ? 'none' : 'transform 0.28s ease, opacity 0.22s ease',
    cursor: dragging.value ? 'grabbing' : 'grab',
    zIndex: 9999,
    maxHeight: imageMaxHeight.value
}));
const totalImages = computed(() => pageImages.value.length);
const displayIndex = computed(() => (selectedIndex.value >= 0 ? selectedIndex.value + 1 : 0));
const visibleThumbs = computed(() => {
    const total = pageImages.value.length;
    if (!total || selectedIndex.value < 0)
        return [];
    // 🖥 Desktop — показываем ВСЕ миниатюры
    if (!isMobile.value) {
        thumbOffset.value = 0;
        return pageImages.value;
    }
    // 📱 Mobile — компактное окно вокруг активной
    const count = 1;
    const windowSize = count * 2 + 1;
    let start = Math.max(0, selectedIndex.value - count);
    if (start + windowSize > total) {
        start = Math.max(0, total - windowSize);
    }
    thumbOffset.value = start;
    return pageImages.value.slice(start, start + windowSize);
});
function onResize() {
    const mobile = window.innerWidth < 768;
    if (isMobile.value !== mobile) {
        isMobile.value = mobile;
        // при переключении режима:
        // десктоп → показать миниатюры
        // мобила → скрыть миниатюры
        thumbnailsVisible.value =
            !mobile && autoShowThumbs.value;
    }
}
onMounted(() => {
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    window.addEventListener('resize', onResize);
});
onUnmounted(() => {
    window.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('touchstart', onTouchStart);
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
    window.removeEventListener('resize', onResize);
});
const __VLS_ctx = {
    ...{},
    ...{},
    ...{},
    ...{},
};
let __VLS_components;
let __VLS_intrinsics;
let __VLS_directives;
/** @type {__VLS_StyleScopedClasses['iv-left']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-side']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-side']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-fade-enter-active']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-fade-leave-active']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-fade-enter-from']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-fade-leave-to']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['active']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumbs-bottom']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-controls']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-counter']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-side']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-caption']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-caption']} */ ;
let __VLS_0;
/** @ts-ignore @type {typeof __VLS_components.Teleport | typeof __VLS_components.Teleport} */
Teleport;
// @ts-ignore
const __VLS_1 = __VLS_asFunctionalComponent1(__VLS_0, new __VLS_0({
    to: "body",
}));
const __VLS_2 = __VLS_1({
    to: "body",
}, ...__VLS_functionalComponentArgsRest(__VLS_1));
const { default: __VLS_5 } = __VLS_3.slots;
let __VLS_6;
/** @ts-ignore @type {typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_7 = __VLS_asFunctionalComponent1(__VLS_6, new __VLS_6({
    name: "iv-fade",
}));
const __VLS_8 = __VLS_7({
    name: "iv-fade",
}, ...__VLS_functionalComponentArgsRest(__VLS_7));
const { default: __VLS_11 } = __VLS_9.slots;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ onClick: (__VLS_ctx.tryClose) },
    ...{ onWheel: (__VLS_ctx.onWheel) },
    ...{ class: "iv-overlay" },
});
__VLS_asFunctionalDirective(__VLS_directives.vShow, {})(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.visible) }, null, null);
/** @type {__VLS_StyleScopedClasses['iv-overlay']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iv-controls" },
});
/** @type {__VLS_StyleScopedClasses['iv-controls']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iv-left" },
});
/** @type {__VLS_StyleScopedClasses['iv-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iv-counter" },
    title: "Position in gallery",
});
/** @type {__VLS_StyleScopedClasses['iv-counter']} */ ;
(__VLS_ctx.displayIndex);
(__VLS_ctx.totalImages);
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iv-buttons" },
    role: "toolbar",
    'aria-label': "Image viewer controls",
});
/** @type {__VLS_StyleScopedClasses['iv-buttons']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.zoomOut) },
    disabled: (!__VLS_ctx.canZoomOut),
    'aria-label': "Zoom out",
    title: "Zoom out",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "none",
    stroke: "currentColor",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "1.5",
    d: "m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M8 11h6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.zoomIn) },
    disabled: (!__VLS_ctx.canZoomIn),
    'aria-label': "Zoom in",
    title: "Zoom in",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "none",
    stroke: "currentColor",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "1.5",
    d: "m21 21l-4.343-4.343m0 0A8 8 0 1 0 5.343 5.343a8 8 0 0 0 11.314 11.314M11 8v6m-3-3h6",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.resetTransform) },
    disabled: (!__VLS_ctx.canReset),
    'aria-label': "Reset",
    title: "Reset",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 1024 1024",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "currentColor",
    d: "M813.176 180.706a60.235 60.235 0 0 1 60.236 60.235v481.883a60.235 60.235 0 0 1-60.236 60.235H210.824a60.235 60.235 0 0 1-60.236-60.235V240.94a60.235 60.235 0 0 1 60.236-60.235h602.352zm0-60.235H210.824A120.47 120.47 0 0 0 90.353 240.94v481.883a120.47 120.47 0 0 0 120.47 120.47h602.353a120.47 120.47 0 0 0 120.471-120.47V240.94a120.47 120.47 0 0 0-120.47-120.47zm-120.47 180.705a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 0 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118m-361.412 0a30.12 30.12 0 0 0-30.118 30.118v301.177a30.118 30.118 0 1 0 60.236 0V331.294a30.12 30.12 0 0 0-30.118-30.118M512 361.412a30.12 30.12 0 0 0-30.118 30.117v30.118a30.118 30.118 0 0 0 60.236 0V391.53A30.12 30.12 0 0 0 512 361.412M512 512a30.12 30.12 0 0 0-30.118 30.118v30.117a30.118 30.118 0 0 0 60.236 0v-30.117A30.12 30.12 0 0 0 512 512",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.toggleThumbs) },
    'aria-label': "Toggle thumbnails",
    title: (__VLS_ctx.thumbnailsVisible ? 'Hide thumbnails' : 'Show thumbnails'),
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 32 32",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "currentColor",
    d: "M8 30H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2m-4-6v4h4v-4zm14 6h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2m-4-6v4h4v-4zm14 6h-4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2m-4-6v4h4v-4zm4-4H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h24a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2M4 4v14h24V4z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.downloadCurrent) },
    'aria-label': "Download",
    title: "Download",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 32 32",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "none",
    stroke: "currentColor",
    'stroke-linecap': "round",
    'stroke-linejoin': "round",
    'stroke-width': "2",
    d: "M9 22c-9 1-8-10 0-9C6 2 23 2 22 10c10-3 10 13 1 12m-12 4l5 4l5-4m-5-10v14",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.close) },
    'aria-label': "Close",
    title: "Close",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    ...{ class: "iv-icon" },
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
});
/** @type {__VLS_StyleScopedClasses['iv-icon']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "currentColor",
    d: "m12 13.4l-4.9 4.9q-.275.275-.7.275t-.7-.275t-.275-.7t.275-.7l4.9-4.9l-4.9-4.9q-.275-.275-.275-.7t.275-.7t.7-.275t.7.275l4.9 4.9l4.9-4.9q.275-.275.7-.275t.7.275t.275.7t-.275.7L13.4 12l4.9 4.9q.275.275.275.7t-.275.7t-.7.275t-.7-.275z",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
    ...{ class: "iv-side-nav" },
});
/** @type {__VLS_StyleScopedClasses['iv-side-nav']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.prevImage) },
    ...{ class: "iv-side iv-side-left" },
    disabled: (!__VLS_ctx.hasPrev),
    'aria-label': "Previous",
});
/** @type {__VLS_StyleScopedClasses['iv-side']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-side-left']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    d: "M22 12H2m9-9l-9 9l9 9",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.button, __VLS_intrinsics.button)({
    ...{ onClick: (__VLS_ctx.nextImage) },
    ...{ class: "iv-side iv-side-right" },
    disabled: (!__VLS_ctx.hasNext),
    'aria-label': "Next",
});
/** @type {__VLS_StyleScopedClasses['iv-side']} */ ;
/** @type {__VLS_StyleScopedClasses['iv-side-right']} */ ;
__VLS_asFunctionalElement1(__VLS_intrinsics.svg, __VLS_intrinsics.svg)({
    xmlns: "http://www.w3.org/2000/svg",
    width: "32",
    height: "32",
    viewBox: "0 0 24 24",
});
__VLS_asFunctionalElement1(__VLS_intrinsics.path)({
    fill: "none",
    stroke: "currentColor",
    'stroke-width': "2",
    d: "M2 12h20m-9-9l9 9l-9 9",
});
let __VLS_12;
/** @ts-ignore @type {typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_13 = __VLS_asFunctionalComponent1(__VLS_12, new __VLS_12({
    name: (__VLS_ctx.imageTransition),
    mode: "out-in",
}));
const __VLS_14 = __VLS_13({
    name: (__VLS_ctx.imageTransition),
    mode: "out-in",
}, ...__VLS_functionalComponentArgsRest(__VLS_13));
const { default: __VLS_17 } = __VLS_15.slots;
if (__VLS_ctx.src) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        key: (__VLS_ctx.src + '-' + __VLS_ctx.selectedIndex),
        ...{ class: "iv-image-wrap" },
    });
    /** @type {__VLS_StyleScopedClasses['iv-image-wrap']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
        ...{ onMousedown: (__VLS_ctx.startDrag) },
        ...{ onTouchstart: (__VLS_ctx.startDrag) },
        ref: "animatedImage",
        src: (__VLS_ctx.src),
        ...(__VLS_ctx.alt ? { alt: __VLS_ctx.alt } : {}),
        ...{ class: "iv-image" },
        ...{ style: (__VLS_ctx.imageStyle) },
        draggable: "false",
    });
    /** @type {__VLS_StyleScopedClasses['iv-image']} */ ;
}
// @ts-ignore
[tryClose, onWheel, visible, displayIndex, totalImages, zoomOut, canZoomOut, zoomIn, canZoomIn, resetTransform, canReset, toggleThumbs, thumbnailsVisible, downloadCurrent, close, prevImage, hasPrev, nextImage, hasNext, imageTransition, src, src, src, selectedIndex, startDrag, startDrag, alt, alt, imageStyle,];
var __VLS_15;
if (!__VLS_ctx.thumbnailsVisible && __VLS_ctx.alt) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "iv-caption" },
        role: "note",
    });
    /** @type {__VLS_StyleScopedClasses['iv-caption']} */ ;
    (__VLS_ctx.alt);
}
let __VLS_18;
/** @ts-ignore @type {typeof __VLS_components.transition | typeof __VLS_components.Transition | typeof __VLS_components.transition | typeof __VLS_components.Transition} */
transition;
// @ts-ignore
const __VLS_19 = __VLS_asFunctionalComponent1(__VLS_18, new __VLS_18({
    name: "iv-slide-up",
}));
const __VLS_20 = __VLS_19({
    name: "iv-slide-up",
}, ...__VLS_functionalComponentArgsRest(__VLS_19));
const { default: __VLS_23 } = __VLS_21.slots;
if (__VLS_ctx.thumbnailsVisible) {
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "iv-thumbs-bottom" },
        role: "region",
        'aria-label': "Thumbnails panel",
    });
    /** @type {__VLS_StyleScopedClasses['iv-thumbs-bottom']} */ ;
    __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
        ...{ class: "iv-thumbs-inner" },
    });
    /** @type {__VLS_StyleScopedClasses['iv-thumbs-inner']} */ ;
    for (const [t, idx] of __VLS_vFor((__VLS_ctx.visibleThumbs))) {
        __VLS_asFunctionalElement1(__VLS_intrinsics.div, __VLS_intrinsics.div)({
            ...{ onClick: (...[$event]) => {
                    if (!(__VLS_ctx.thumbnailsVisible))
                        return;
                    __VLS_ctx.selectByIndex(__VLS_ctx.thumbOffset + idx);
                    // @ts-ignore
                    [thumbnailsVisible, thumbnailsVisible, alt, alt, visibleThumbs, selectByIndex, thumbOffset,];
                } },
            key: (t.src + '_' + (__VLS_ctx.thumbOffset + idx)),
            ...{ class: "iv-thumb" },
            ...{ class: ({ active: __VLS_ctx.thumbOffset + idx === __VLS_ctx.selectedIndex }) },
            role: "button",
            tabindex: "0",
        });
        /** @type {__VLS_StyleScopedClasses['iv-thumb']} */ ;
        /** @type {__VLS_StyleScopedClasses['active']} */ ;
        __VLS_asFunctionalElement1(__VLS_intrinsics.img)({
            src: (t.src),
            ...(t.alt ? { alt: t.alt } : {}),
        });
        // @ts-ignore
        [selectedIndex, thumbOffset, thumbOffset,];
    }
}
// @ts-ignore
[];
var __VLS_21;
// @ts-ignore
[];
var __VLS_9;
// @ts-ignore
[];
var __VLS_3;
// @ts-ignore
[];
const __VLS_export = (await import('vue')).defineComponent({
    setup: () => (__VLS_exposed),
    __typeProps: {},
});
export default {};
