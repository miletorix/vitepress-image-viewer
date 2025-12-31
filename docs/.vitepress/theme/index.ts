import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'

import 'virtual:group-icons.css'

import { ImageGroup } from '@miletorix/vitepress-image-group'
import '@miletorix/vitepress-image-group/style.css'

import BackToTopButton from '@miletorix/vitepress-back-to-top-button'
import '@miletorix/vitepress-back-to-top-button/style.css'

import ImageViewerP from '@miletorix/vitepress-image-viewer'
import '@miletorix/vitepress-image-viewer/style.css'

// import ImageViewerP from '../../../packages/src/index'

import { Card, CardsGroup } from '@miletorix/vitepress-enhanced-site-links'
import '@miletorix/vitepress-enhanced-site-links/style.css'

export default {
  extends: DefaultTheme,
  // @ts-ignore
  enhanceApp(ctx) {
    BackToTopButton(ctx.app) 
    ImageViewerP(ctx.app)
    ctx.app.component('ImageGroup', ImageGroup)
    ctx.app.component('Card', Card)
    ctx.app.component('CardsGroup', CardsGroup)
  }
}