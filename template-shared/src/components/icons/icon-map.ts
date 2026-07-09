/**
 * Semantic icon keys → Lucide icon component names.
 * Edited from /theme-editor; rewritten by POST /api/theme/save.
 */
export const defaultIconMap = {
  'dialog.close': 'X',
  'sheet.close': 'X',
  'accordion.chevron': 'ChevronDown',
  'breadcrumb.separator': 'ChevronRight',
  'breadcrumb.ellipsis': 'MoreHorizontal',
  'pagination.previous': 'ChevronLeft',
  'pagination.next': 'ChevronRight',
  'pagination.ellipsis': 'MoreHorizontal',
  'carousel.previous': 'ChevronLeft',
  'carousel.next': 'ChevronRight',
  'calendar.previous': 'ChevronLeft',
  'calendar.next': 'ChevronRight',
  'calendar.chevron': 'ChevronDown',
  'select.chevron': 'ChevronDown',
  'native-select.chevron': 'ChevronDown',
  'combobox.chevrons': 'ChevronsUpDown',
  'combobox.check': 'Check',
  'combobox.clear': 'X',
  'command.search': 'Search',
  'checkbox.check': 'Check',
  'dropdown.check': 'Check',
  'dropdown.chevron': 'ChevronRight',
  'context.check': 'Check',
  'context.chevron': 'ChevronRight',
  'menubar.check': 'Check',
  'menubar.chevron': 'ChevronRight',
  'navigation-menu.chevron': 'ChevronDown',
  'sidebar.trigger': 'PanelLeft',
  'spinner.loader': 'LoaderCircle',
  'message-scroller.arrow': 'ArrowDown',
  'input-otp.minus': 'Minus',
  'select.check': 'Check',
  'sonner.success': 'CircleCheck',
  'sonner.info': 'Info',
  'sonner.warning': 'TriangleAlert',
  'sonner.error': 'OctagonX',
  'sonner.loading': 'LoaderCircle',
} as const

export type IconKey = keyof typeof defaultIconMap

/** Mutable map used at runtime (overrides applied before save). */
export let iconMap: Record<string, string> = { ...defaultIconMap }

export function setIconMap(next: Record<string, string>) {
  iconMap = { ...next }
}
