export const colors = {
  // Primary colors
  background: '#020E21', // Derin Gece Mavisi (Klasik siyah yerine daha premium durur)
  primary: '#FFD700',    // TAM ALTIN SARISI (En önemli renk)
  
  // Text colors
  text: '#FFFFFF',       // Beyaz
  textSecondary: '#B4C5E4', // Hafif mavimsi gümüş (Gri yerine daha şık)
  textTertiary: '#64748B',  // Daha koyu detaylar
  textDisabled: '#334155',

  // Background variations
  card: '#0B1C38',       // Kartlar için bir ton açık lacivert
  cardDark: '#051226',   // Daha koyu kartlar

  // Border colors
  border: '#1E293B',     // İnce ayırıcılar
  borderDark: '#0F172A',
  borderLight: '#334155',

  // Status colors
  success: '#10B981',    // Zümrüt Yeşili (Para/Giriş)
  danger: '#EF4444',     // Kırmızı (Çıkış/Hata)
  warning: '#F59E0B',    // Turuncu (Bekleyen işlem)
  error: '#FF6B6B',

  // Transparent backgrounds
  overlay: 'rgba(2, 14, 33, 0.85)', // Arka planın lacivert transparan hali
  warningBackground: 'rgba(245, 158, 11, 0.15)',
  warningBorder: 'rgba(245, 158, 11, 0.4)',
  dangerBackground: 'rgba(239, 68, 68, 0.15)',
  dangerBorder: 'rgba(239, 68, 68, 0.4)',
  tintedBackground: 'rgba(255, 215, 0, 0.1)', // Altın sarısı hafif zemin (Vurgular için)

  // Pure colors
  black: '#000000',
  white: '#FFFFFF',
  gold: '#FFD700',       // Ekstra: Saf Altın rengi
  silver: '#C0C0C0',     // Ekstra: Gümüş rengi
} as const;