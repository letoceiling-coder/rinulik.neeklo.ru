import 'dotenv/config'
import { PrismaClient, Role, VideoCategory, ChatSide } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@admin.local' },
    update: { passwordHash, role: Role.ADMIN },
    create: {
      email: 'admin@admin.local',
      passwordHash,
      role: Role.ADMIN,
    },
  })

  await prisma.heroBanner.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      headline: 'Создаём видео, которые продают за вас',
      subheadline:
        'AI генерация рекламных роликов, контента и видео для бизнеса за минуты',
      ctaPrimaryLabel: 'Создать видео',
      ctaPrimaryHref: '/videos',
      ctaSecondaryLabel: 'Смотреть демо',
      ctaSecondaryHref: '#demo-videos',
      ctaBoxTitle: 'Начать бесплатно',
      ctaBoxSubtitle: 'Оставьте контакт — пришлём доступ в песочницу',
    },
  })

  const demoClip =
    'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4'
  const vCount = await prisma.video.count()
  if (vCount === 0) {
    await prisma.video.createMany({
      data: [
        {
          title: 'Скидка 24 часа — косметика',
          category: VideoCategory.AD,
          posterUrl: 'https://picsum.photos/seed/v1/640/360',
          videoUrl: demoClip,
          sortOrder: 0,
        },
        {
          title: 'Обзор офиса за 30 секунд',
          category: VideoCategory.BUSINESS,
          posterUrl: 'https://picsum.photos/seed/v2/640/360',
          videoUrl: demoClip,
          sortOrder: 1,
        },
      ],
    })
  }

  if ((await prisma.service.count()) === 0) {
    await prisma.service.createMany({
      data: [
        {
          title: 'Генерация рекламных видео',
          description: 'Креативы под таргет, короткие офферы и A/B варианты.',
          iconKey: 'Megaphone',
          sortOrder: 0,
        },
        {
          title: 'Видео для маркетплейсов',
          description: 'Карточки товара, упаковка преимуществ, динамичный монтаж.',
          iconKey: 'ShoppingBag',
          sortOrder: 1,
        },
        {
          title: 'Видео подарки',
          description: 'Персональные поздравления и сюжеты «под ключ».',
          iconKey: 'Gift',
          sortOrder: 2,
        },
        {
          title: 'Видео для бизнеса',
          description: 'О компании, онбординг, внутренние коммуникации.',
          iconKey: 'Video',
          sortOrder: 3,
        },
        {
          title: 'AI ассистенты',
          description: 'Чат на сайте + сбор лидов и квалификация в CRM.',
          iconKey: 'Bot',
          sortOrder: 4,
        },
      ],
    })
  }

  if ((await prisma.advantage.count()) === 0) {
    await prisma.advantage.createMany({
      data: [
        {
          title: 'Быстро',
          description: '1–3 минуты до черновика ролика',
          iconKey: 'Sparkles',
          sortOrder: 0,
        },
        {
          title: 'Дешевле продакшена',
          description: 'Без съёмочной группы и студии',
          iconKey: 'Wallet',
          sortOrder: 1,
        },
        {
          title: 'AI сценарии',
          description: 'Структура, кадры и тексты автоматически',
          iconKey: 'Wand2',
          sortOrder: 2,
        },
        {
          title: 'Автоматические продажи',
          description: 'Чат-бот и лиды в одной воронке',
          iconKey: 'TrendingUp',
          sortOrder: 3,
        },
      ],
    })
  }

  if ((await prisma.tariff.count()) === 0) {
    await prisma.tariff.createMany({
      data: [
        {
          name: 'Starter',
          price: '0 ₽',
          description: 'Попробовать пайплайн и чат-виджет',
          features: JSON.stringify([
            '3 ролика в месяц',
            '1 ассистент',
            'Базовые шаблоны',
          ]),
          highlighted: false,
          sortOrder: 0,
        },
        {
          name: 'Pro',
          price: '4 990 ₽',
          description: 'Для маркетинга и маркетплейсов',
          features: JSON.stringify([
            '50 роликов',
            '5 ассистентов',
            'Приоритетная очередь',
            'Экспорт без вотермарка',
          ]),
          highlighted: true,
          sortOrder: 1,
        },
        {
          name: 'Business',
          price: 'от 29 990 ₽',
          description: 'Команда, CRM и кастомные модели',
          features: JSON.stringify([
            'Безлимит роликов',
            'SSO',
            'SLA',
            'Персональный менеджер',
          ]),
          highlighted: false,
          sortOrder: 2,
        },
      ],
    })
  }

  if ((await prisma.chatDemoLine.count()) === 0) {
    await prisma.chatDemoLine.createMany({
      data: [
        { sortOrder: 0, side: ChatSide.USER, text: 'Нужен ролик для маркетплейса за 1 минуту' },
        { sortOrder: 1, side: ChatSide.BOT, text: 'Соберу структуру, визуал и озвучку. Какой товар и УТП?' },
        { sortOrder: 2, side: ChatSide.USER, text: 'Наушники, акцент на шумодав' },
        { sortOrder: 3, side: ChatSide.BOT, text: 'Готово: 3 варианта сценария. Запускаю генерацию превью…' },
      ],
    })
  }

  if ((await prisma.product.count()) === 0) {
    await prisma.product.createMany({
      data: [
        {
          title: 'Пакет «Старт»',
          description: 'Быстрый старт с шаблонами и одним ассистентом.',
          sortOrder: 0,
        },
      ],
    })
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    void prisma.$disconnect()
    process.exit(1)
  })
