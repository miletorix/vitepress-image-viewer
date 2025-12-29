import { createApp, h, ref, nextTick } from 'vue';
import ImageViewer from './ImageViewer.vue';
function enhanceImages(viewerRef) {
    const imgs = document.querySelectorAll('img:not(.no-viewer)');
    imgs.forEach(img => {
        if (img.dataset.viewerBound === 'true')
            return;
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            if (viewerRef &&
                typeof viewerRef.open === 'function' &&
                !viewerRef.visible) {
                viewerRef.open(img.src, img.alt || '', img);
            }
        });
        img.dataset.viewerBound = 'true';
    });
}
export default function ImageViewerP(app, options = {}) {
    if (typeof window === 'undefined')
        return;
    if (window.__vitepress_image_viewer_installed)
        return;
    window.__vitepress_image_viewer_installed = true;
    const mountNode = document.createElement('div');
    document.body.appendChild(mountNode);
    const rootStyle = document.documentElement.style;
    if (options.transparentBg) {
        rootStyle.setProperty('--iv-overlay-bg', 'rgba(0, 0, 0, 0.75)');
    }
    const viewerRef = ref(null);
    const viewerApp = createApp({
        render: () => h(ImageViewer, { ref: viewerRef })
    });
    viewerApp.mount(mountNode);
    const runEnhance = () => {
        nextTick(() => {
            enhanceImages(viewerRef.value);
        });
    };
    // Инициализация при первой загрузке
    runEnhance();
    // Типизация import.meta.env для Vite
    const isDev = typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.DEV;
    if (isDev) {
        // В dev-режиме используем useRouter, если доступен
        import('vitepress').then(mod => {
            const router = mod.useRouter?.();
            router?.afterEach?.(() => {
                runEnhance();
            });
        }).catch(() => {
            setTimeout(runEnhance, 100);
        });
    }
    else {
        // В продакшене наблюдаем за #app
        const observer = new MutationObserver(() => {
            runEnhance();
        });
        observer.observe(document.querySelector('#app'), {
            childList: true,
            subtree: true,
        });
    }
}
