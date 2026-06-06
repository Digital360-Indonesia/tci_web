const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'] as const;

const CATEGORY_LABELS: Record<string, string> = {
  edukasi: 'Edukasi',
  promosi: 'Promosi',
  'tips-trik': 'Tips & Trik',
};

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function getCategoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category;
}

export { MONTHS, CATEGORY_LABELS };
