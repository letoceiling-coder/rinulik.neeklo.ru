/**
 * Единый реестр моделей Freepik, используемых в Studio.
 * Отдаётся фронту (без чувствительных полей) — используется для рендера форм,
 * расчёта стоимости и проверки квот на бэке.
 *
 * Кредиты — внутренняя валюта сайта. 1 кредит ≈ 1 дешёвая генерация.
 * Бюджет на пользователя по умолчанию = 50/сутки (настраивается).
 *
 * dailyFreeRPD — лимит на ВЕСЬ ключ Freepik в сутки (из /ratelimits).
 * Для free-тарифа это предел всего проекта, поэтому имеет смысл
 * выводить его в UI и не давать одному юзеру спалить всё.
 */

export type ModelKind = 'IMAGE' | 'VIDEO'

export interface AspectOption {
  id: string
  label: string
}

export interface ModelParam {
  name: string
  type: 'text' | 'textarea' | 'select' | 'number' | 'boolean' | 'image' | 'aspect'
  label: string
  required?: boolean
  placeholder?: string
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  step?: number
  default?: string | number | boolean
  hint?: string
}

export interface ModelDef {
  id: string
  kind: ModelKind
  label: string
  tagline: string
  credits: number
  dailyFreeRPD: number
  durationSec?: number
  params: ModelParam[]
  // true — принимает изображение-референс (image-to-video) и оно обязательно
  requiresReferenceImage?: boolean
}

export const ASPECT_IMAGE: AspectOption[] = [
  { id: 'square_1_1', label: '1:1 квадрат' },
  { id: 'widescreen_16_9', label: '16:9 широкий' },
  { id: 'social_story_9_16', label: '9:16 сторис' },
  { id: 'traditional_3_4', label: '3:4 портрет' },
  { id: 'classic_4_3', label: '4:3 классика' },
  { id: 'standard_3_2', label: '3:2 стандарт' },
  { id: 'portrait_2_3', label: '2:3 портрет' },
  { id: 'horizontal_2_1', label: '2:1 горизонт' },
  { id: 'social_post_4_5', label: '4:5 пост' },
]

export const ASPECT_VIDEO: AspectOption[] = [
  { id: 'widescreen_16_9', label: '16:9' },
  { id: 'social_story_9_16', label: '9:16' },
  { id: 'square_1_1', label: '1:1' },
  { id: 'classic_4_3', label: '4:3' },
  { id: 'traditional_3_4', label: '3:4' },
]

export const MODELS: ModelDef[] = [
  {
    id: 'flux-dev',
    kind: 'IMAGE',
    label: 'Flux Dev',
    tagline: 'Быстрая текст→изображение модель, хороший баланс цены и качества',
    credits: 1,
    dailyFreeRPD: 100,
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true, placeholder: 'опишите сцену подробно' },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'square_1_1' },
    ],
  },
  {
    id: 'mystic',
    kind: 'IMAGE',
    label: 'Mystic',
    tagline: 'Фирменный Freepik workflow, ультра-реалистичный, до 4K',
    credits: 2,
    dailyFreeRPD: 125,
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true, placeholder: 'описание сцены' },
      {
        name: 'model',
        type: 'select',
        label: 'Вариант Mystic',
        default: 'realism',
        options: [
          { value: 'realism', label: 'realism — реалистичная палитра' },
          { value: 'fluid', label: 'fluid — лучший prompt adherence' },
          { value: 'zen', label: 'zen — мягкие, чистые результаты' },
          { value: 'flexible', label: 'flexible — иллюстрации/фэнтези' },
          { value: 'super_real', label: 'super_real — максимальная реальность' },
          { value: 'editorial_portraits', label: 'editorial_portraits — портреты крупным планом' },
        ],
      },
      {
        name: 'resolution',
        type: 'select',
        label: 'Разрешение',
        default: '2k',
        options: [
          { value: '1k', label: '1K' },
          { value: '2k', label: '2K (по умолчанию)' },
          { value: '4k', label: '4K' },
        ],
      },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'square_1_1' },
      { name: 'structure_reference', type: 'image', label: 'Референс структуры (необязательно)', hint: 'Влияет на форму/композицию' },
      { name: 'style_reference', type: 'image', label: 'Референс стиля (необязательно)', hint: 'Влияет на эстетику' },
    ],
  },
  {
    id: 'kling-v2-5-pro',
    kind: 'VIDEO',
    label: 'Kling 2.5 Turbo Pro',
    tagline: 'Кинематографичное видео из изображения — 5 или 10 секунд',
    credits: 10,
    dailyFreeRPD: 11,
    durationSec: 5,
    requiresReferenceImage: true,
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true, hint: 'JPG/PNG, минимум 300×300' },
      { name: 'prompt', type: 'textarea', label: 'Описание движения', placeholder: 'камера медленно наезжает, волосы развеваются на ветру' },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      {
        name: 'duration',
        type: 'select',
        label: 'Длительность',
        default: '5',
        options: [
          { value: '5', label: '5 сек' },
          { value: '10', label: '10 сек' },
        ],
      },
      {
        name: 'cfg_scale',
        type: 'number',
        label: 'Следование промпту (cfg_scale)',
        min: 0,
        max: 1,
        step: 0.05,
        default: 0.5,
        hint: 'Больше — строже к тексту',
      },
    ],
  },
  {
    id: 'seedance-pro-1080p',
    kind: 'VIDEO',
    label: 'Seedance Pro 1080p',
    tagline: 'ByteDance video model — 1080p, 5/10 сек',
    credits: 10,
    dailyFreeRPD: 125,
    durationSec: 5,
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение (необязательно)', hint: 'Для image-to-video' },
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      {
        name: 'duration',
        type: 'select',
        label: 'Длительность',
        default: '5',
        options: [
          { value: '5', label: '5 сек' },
          { value: '10', label: '10 сек' },
        ],
      },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
      { name: 'camera_fixed', type: 'boolean', label: 'Фиксированная камера', default: false },
    ],
  },
]

export function findModel(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id)
}

/** Отдаём фронту безопасный каталог (без серверных деталей). */
export function publicCatalog() {
  return {
    models: MODELS,
    aspectImage: ASPECT_IMAGE,
    aspectVideo: ASPECT_VIDEO,
  }
}
