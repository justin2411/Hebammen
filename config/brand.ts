export const BRAND = {
  cream: '#FAF3EB',
  creamDark: '#F5EDE3',
  berry: '#6B3343',
  berryDeep: '#4A1E2A',
  berryLight: '#8B4A5B',
  orange: '#E89977',
  orangeSoft: '#F2C4AC',
  orangeDeep: '#C77658',
  green: '#A8B9A1',
  text: '#2A2225',
  muted: '#8A7A72',
  rule: '#E5DCD2',
  white: '#FFFFFF',
  danger: '#B85450',
  warning: '#D4A574',
  success: '#6B8E6F',
} as const;

export type BrandColor = keyof typeof BRAND;
