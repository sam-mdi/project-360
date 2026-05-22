import type { BlockColor } from './types';

export const BLOCK_COLORS: Record<BlockColor, { bg: string; text: string; light: string; hex: string; name: string }> = {
  watermelon:  { bg: '#e63946', text: '#fff', light: '#fde8e9', hex: '#e63946', name: 'Watermelon' },
  strawberry:  { bg: '#e84393', text: '#fff', light: '#fce8f3', hex: '#e84393', name: 'Strawberry' },
  rust:        { bg: '#c0392b', text: '#fff', light: '#fde9e7', hex: '#c0392b', name: 'Rust' },
  salmon:      { bg: '#fa8072', text: '#fff', light: '#fde8e6', hex: '#fa8072', name: 'Salmon' },
  mandarin:    { bg: '#f4631e', text: '#fff', light: '#fde9e0', hex: '#f4631e', name: 'Mandarin' },
  pumpkin:     { bg: '#e97b00', text: '#fff', light: '#fdefd9', hex: '#e97b00', name: 'Pumpkin' },
  apricot:     { bg: '#ffb347', text: '#7c4a00', light: '#fff3e0', hex: '#ffb347', name: 'Apricot' },
  honey:       { bg: '#f5a623', text: '#7c4a00', light: '#fff3db', hex: '#f5a623', name: 'Honey' },
  mustard:     { bg: '#d4a017', text: '#5a3e00', light: '#fdf5d9', hex: '#d4a017', name: 'Mustard' },
  butter:      { bg: '#f7e06b', text: '#6b5a00', light: '#fffce0', hex: '#f7e06b', name: 'Butter' },
  lime:        { bg: '#7bc67e', text: '#1a4a1d', light: '#e8f5e9', hex: '#7bc67e', name: 'Lime' },
  sage:        { bg: '#87a878', text: '#1e3a18', light: '#edf4ea', hex: '#87a878', name: 'Sage' },
  teal:        { bg: '#26a69a', text: '#fff', light: '#e0f2f1', hex: '#26a69a', name: 'Teal' },
  sky:         { bg: '#38bdf8', text: '#0c3a5c', light: '#e0f7ff', hex: '#38bdf8', name: 'Sky' },
  periwinkle:  { bg: '#7b8cde', text: '#fff', light: '#eaecfb', hex: '#7b8cde', name: 'Periwinkle' },
  lavender:    { bg: '#b39ddb', text: '#3e1f7a', light: '#f0ebfb', hex: '#b39ddb', name: 'Lavender' },
  amethyst:    { bg: '#9c27b0', text: '#fff', light: '#f3e5f5', hex: '#9c27b0', name: 'Amethyst' },
  lilac:       { bg: '#d4a0e0', text: '#4a1a6b', light: '#f7eefa', hex: '#d4a0e0', name: 'Lilac' },
  orchid:      { bg: '#da70d6', text: '#5a1a5a', light: '#fae8fa', hex: '#da70d6', name: 'Orchid' },
  fuchsia:     { bg: '#e91e8c', text: '#fff', light: '#fce4f3', hex: '#e91e8c', name: 'Fuchsia' },
  carnation:   { bg: '#ff7b9c', text: '#5a0020', light: '#ffe4ec', hex: '#ff7b9c', name: 'Carnation' },
  ultra:       { bg: '#4f46e5', text: '#fff', light: '#e0e7ff', hex: '#4f46e5', name: 'Ultra' },
  slate:       { bg: '#64748b', text: '#fff', light: '#e2e8f0', hex: '#64748b', name: 'Slate' },
  stone:       { bg: '#78716c', text: '#fff', light: '#e7e5e4', hex: '#78716c', name: 'Stone' },
};

export function getColor(color: BlockColor) {
  return BLOCK_COLORS[color] ?? BLOCK_COLORS.slate;
}
