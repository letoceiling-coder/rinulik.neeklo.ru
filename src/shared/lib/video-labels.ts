const LABELS: Record<string, string> = {
  ad: 'Реклама',
  business: 'Бизнес',
  entertainment: 'Развлечения',
  gifts: 'Подарки',
  products: 'Товары',
}

export function videoCategoryLabel(category: string): string {
  return LABELS[category.toLowerCase()] ?? category
}
