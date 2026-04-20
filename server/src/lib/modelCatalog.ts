/**
 * Единый реестр моделей Freepik, используемых в Studio.
 * Отдаётся фронту (без чувствительных полей) — используется для рендера форм,
 * расчёта стоимости и проверки квот на бэке.
 *
 * Кредиты — внутренняя валюта сайта. 1 кредит ≈ 1 дешёвая генерация.
 * Бюджет на пользователя по умолчанию = 50/сутки (настраивается).
 *
 * dailyFreeRPD — лимит на ВЕСЬ ключ Freepik в сутки (оценочно).
 * Для free-тарифа это предел всего проекта, поэтому имеет смысл
 * выводить его в UI и не давать одному юзеру спалить всё.
 *
 * endpoint — путь Freepik API без префикса `/v1/ai/` (или `mystic` для `/v1/ai/mystic`).
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
  /** Путь Freepik API: "mystic", "text-to-image/flux-dev", "image-to-video/kling-v2-5-pro" */
  endpoint: string
  credits: number
  dailyFreeRPD: number
  durationSec?: number
  params: ModelParam[]
  /** true — модель обязательно требует изображение-референс (image-to-video) */
  requiresReferenceImage?: boolean
  /** Whitelist полей, которые уйдут во Freepik (остальные будут отброшены). */
  allowedParams?: string[]
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

const DURATION_5_10 = [
  { value: '5', label: '5 сек' },
  { value: '10', label: '10 сек' },
]

/** ---- IMAGE models ---- */
const IMAGE_MODELS: ModelDef[] = [
  {
    id: 'flux-dev',
    kind: 'IMAGE',
    label: 'Flux Dev',
    tagline: 'Быстрая text→image модель, отличный баланс цены и качества',
    endpoint: 'text-to-image/flux-dev',
    credits: 1,
    dailyFreeRPD: 100,
    allowedParams: ['prompt', 'aspect_ratio', 'seed', 'styling'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true, placeholder: 'опишите сцену подробно' },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'square_1_1' },
    ],
  },
  {
    id: 'hyperflux',
    kind: 'IMAGE',
    label: 'Hyperflux',
    tagline: 'Бюджетная sub-секундная модель для быстрых черновиков',
    endpoint: 'text-to-image/hyperflux',
    credits: 1,
    dailyFreeRPD: 200,
    allowedParams: ['prompt', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true, placeholder: 'кратко опишите сцену' },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'square_1_1' },
    ],
  },
  {
    id: 'flux-pro-v1-1',
    kind: 'IMAGE',
    label: 'Flux Pro 1.1',
    tagline: 'Премиум текст→изображение: высокая детализация и реализм',
    endpoint: 'text-to-image/flux-pro-v1-1',
    credits: 3,
    dailyFreeRPD: 50,
    allowedParams: ['prompt', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
    ],
  },
  {
    id: 'flux-2-klein',
    kind: 'IMAGE',
    label: 'Flux 2 Klein',
    tagline: 'Свежая Flux 2 линейка, более точное следование промпту',
    endpoint: 'text-to-image/flux-2-klein',
    credits: 2,
    dailyFreeRPD: 60,
    allowedParams: ['prompt', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'square_1_1' },
    ],
  },
  {
    id: 'mystic',
    kind: 'IMAGE',
    label: 'Mystic',
    tagline: 'Фирменный Freepik workflow: ультра-реалистично, до 4K',
    endpoint: 'mystic',
    credits: 2,
    dailyFreeRPD: 125,
    allowedParams: [
      'prompt',
      'model',
      'resolution',
      'aspect_ratio',
      'structure_reference',
      'style_reference',
      'structure_strength',
      'adherence',
      'hdr',
    ],
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
    id: 'seedream-v4',
    kind: 'IMAGE',
    label: 'Seedream v4',
    tagline: 'ByteDance Seedream — сильная стилистика и композиция',
    endpoint: 'text-to-image/seedream-v4',
    credits: 2,
    dailyFreeRPD: 80,
    allowedParams: ['prompt', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
    ],
  },
  {
    id: 'seedream-v4-5',
    kind: 'IMAGE',
    label: 'Seedream v4.5',
    tagline: 'Обновлённый Seedream — лучшее лицо/анатомия, чище детали',
    endpoint: 'text-to-image/seedream-v4-5',
    credits: 3,
    dailyFreeRPD: 60,
    allowedParams: ['prompt', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
    ],
  },
]

/** ---- VIDEO models ---- */
const VIDEO_MODELS: ModelDef[] = [
  {
    id: 'kling-v2-1-pro',
    kind: 'VIDEO',
    label: 'Kling 2.1 Pro',
    tagline: 'Предыдущее поколение Kling — дешевле, надёжный i2v',
    endpoint: 'image-to-video/kling-v2-1-pro',
    credits: 8,
    dailyFreeRPD: 15,
    durationSec: 5,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'negative_prompt', 'duration', 'cfg_scale'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true, hint: 'JPG/PNG, минимум 300×300' },
      { name: 'prompt', type: 'textarea', label: 'Описание движения', placeholder: 'плавный наезд камеры, развевающиеся волосы' },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      { name: 'cfg_scale', type: 'number', label: 'Следование промпту (cfg_scale)', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
  },
  {
    id: 'kling-v2-5-pro',
    kind: 'VIDEO',
    label: 'Kling 2.5 Turbo Pro',
    tagline: 'Кинематографичное видео из изображения — 5 или 10 секунд',
    endpoint: 'image-to-video/kling-v2-5-pro',
    credits: 10,
    dailyFreeRPD: 11,
    durationSec: 5,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'negative_prompt', 'duration', 'cfg_scale'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true, hint: 'JPG/PNG, минимум 300×300' },
      { name: 'prompt', type: 'textarea', label: 'Описание движения', placeholder: 'камера медленно наезжает, волосы развеваются на ветру' },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      { name: 'cfg_scale', type: 'number', label: 'Следование промпту (cfg_scale)', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
  },
  {
    id: 'kling-v2-6-pro',
    kind: 'VIDEO',
    label: 'Kling 2.6 Pro',
    tagline: 'Свежее поколение Kling — улучшенная детализация и движение',
    endpoint: 'image-to-video/kling-v2-6-pro',
    credits: 12,
    dailyFreeRPD: 10,
    durationSec: 5,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'negative_prompt', 'duration', 'cfg_scale'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true, hint: 'JPG/PNG, минимум 300×300' },
      { name: 'prompt', type: 'textarea', label: 'Описание движения' },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      { name: 'cfg_scale', type: 'number', label: 'cfg_scale', min: 0, max: 1, step: 0.05, default: 0.5 },
    ],
  },
  {
    id: 'minimax-hailuo-02-1080p',
    kind: 'VIDEO',
    label: 'Hailuo 02 1080p',
    tagline: 'MiniMax Hailuo-02 — 1080p image-to-video, реалистичная физика',
    endpoint: 'image-to-video/minimax-hailuo-02-1080p',
    credits: 10,
    dailyFreeRPD: 20,
    durationSec: 6,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'duration', 'prompt_optimizer'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true },
      { name: 'prompt', type: 'textarea', label: 'Описание движения', required: true },
      {
        name: 'duration',
        type: 'select',
        label: 'Длительность',
        default: '6',
        options: [
          { value: '6', label: '6 сек' },
          { value: '10', label: '10 сек' },
        ],
      },
      { name: 'prompt_optimizer', type: 'boolean', label: 'Оптимизатор промпта', default: true },
    ],
  },
  {
    id: 'pixverse-v5',
    kind: 'VIDEO',
    label: 'PixVerse V5',
    tagline: 'Яркое стилизованное видео, быстрый рендер',
    endpoint: 'image-to-video/pixverse-v5',
    credits: 6,
    dailyFreeRPD: 30,
    durationSec: 5,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'negative_prompt', 'duration', 'style', 'motion_mode'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true },
      { name: 'prompt', type: 'textarea', label: 'Описание движения' },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      {
        name: 'style',
        type: 'select',
        label: 'Стиль',
        default: 'anime',
        options: [
          { value: 'anime', label: 'anime' },
          { value: 'realistic', label: 'realistic' },
          { value: '3d_animation', label: '3D animation' },
          { value: 'clay', label: 'clay' },
          { value: 'cyberpunk', label: 'cyberpunk' },
          { value: 'comic', label: 'comic' },
        ],
      },
      {
        name: 'motion_mode',
        type: 'select',
        label: 'Тип движения',
        default: 'normal',
        options: [
          { value: 'normal', label: 'normal' },
          { value: 'fast', label: 'fast' },
        ],
      },
    ],
  },
  {
    id: 'wan-v2-6-1080p',
    kind: 'VIDEO',
    label: 'WAN 2.6 1080p',
    tagline: 'Alibaba WAN 2.6 — 1080p image-to-video с фотореализмом',
    endpoint: 'image-to-video/wan-v2-6-1080p',
    credits: 10,
    dailyFreeRPD: 15,
    durationSec: 5,
    requiresReferenceImage: true,
    allowedParams: ['image', 'prompt', 'negative_prompt', 'duration'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение', required: true },
      { name: 'prompt', type: 'textarea', label: 'Описание движения', required: true },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
    ],
  },
  {
    id: 'seedance-pro-1080p',
    kind: 'VIDEO',
    label: 'Seedance Pro 1080p',
    tagline: 'ByteDance Seedance — 1080p, 5/10 сек, text/image → video',
    endpoint: 'image-to-video/seedance-pro-1080p',
    credits: 10,
    dailyFreeRPD: 125,
    durationSec: 5,
    allowedParams: ['image', 'prompt', 'duration', 'camera_fixed', 'aspect_ratio', 'seed'],
    params: [
      { name: 'image', type: 'image', label: 'Исходное изображение (необязательно)', hint: 'Для image-to-video' },
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
      { name: 'camera_fixed', type: 'boolean', label: 'Фиксированная камера', default: false },
    ],
  },
  {
    id: 'ltx-2-pro',
    kind: 'VIDEO',
    label: 'LTX 2.0 Pro',
    tagline: 'Text→video от Lightricks — быстрые черновики из текста',
    endpoint: 'text-to-video/ltx-2-pro',
    credits: 8,
    dailyFreeRPD: 30,
    durationSec: 5,
    allowedParams: ['prompt', 'negative_prompt', 'duration', 'aspect_ratio', 'seed'],
    params: [
      { name: 'prompt', type: 'textarea', label: 'Описание', required: true },
      { name: 'negative_prompt', type: 'textarea', label: 'Что исключить' },
      { name: 'duration', type: 'select', label: 'Длительность', default: '5', options: DURATION_5_10 },
      { name: 'aspect_ratio', type: 'aspect', label: 'Соотношение сторон', default: 'widescreen_16_9' },
    ],
  },
]

export const MODELS: ModelDef[] = [...IMAGE_MODELS, ...VIDEO_MODELS]

export function findModel(id: string): ModelDef | undefined {
  return MODELS.find((m) => m.id === id)
}

/** Отдаём фронту безопасный каталог (без серверных деталей). */
export function publicCatalog() {
  return {
    // endpoint всё равно не секрет — это публичный путь Freepik API,
    // но лишнего на фронт не гоняем.
    models: MODELS.map(({ endpoint: _endpoint, allowedParams: _allowed, ...m }) => m),
    aspectImage: ASPECT_IMAGE,
    aspectVideo: ASPECT_VIDEO,
  }
}
