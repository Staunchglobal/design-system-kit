
export type NavItem = {
  id: string
  label: string
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Colors',
    items: [
      { id: 'color-scales', label: 'Color Scales' },
      { id: 'colors', label: 'Colors' },
    ],
  },
  {
    title: 'Buttons & Actions',
    items: [
      { id: 'button', label: 'Button' },
      { id: 'button-group', label: 'Button Group' },
      { id: 'toggle', label: 'Toggle' },
      { id: 'toggle-group', label: 'Toggle Group' },
      { id: 'segmented-control', label: 'Segmented Control' },
      { id: 'kbd', label: 'Kbd' },
      { id: 'spinner', label: 'Spinner' },
    ],
  },
  {
    title: 'Forms & Inputs',
    items: [
      { id: 'input', label: 'Input' },
      { id: 'textarea', label: 'Textarea' },
      { id: 'label', label: 'Label' },
      { id: 'checkbox', label: 'Checkbox' },
      { id: 'radio-group', label: 'Radio Group' },
      { id: 'switch', label: 'Switch' },
      { id: 'select', label: 'Select' },
      { id: 'native-select', label: 'Native Select' },
      { id: 'slider', label: 'Slider' },
      { id: 'input-otp', label: 'Input OTP' },
      { id: 'input-group', label: 'Input Group' },
      { id: 'field', label: 'Field' },
      { id: 'combobox', label: 'Combobox' },
      { id: 'date-picker', label: 'Date Picker' },
      { id: 'phone-input', label: 'Phone Input' },
      { id: 'copy-input', label: 'Copy Input' },
      { id: 'stepper-input', label: 'Stepper Input' },
      { id: 'filter-chips', label: 'Filter Chips' },
      { id: 'password-strength-meter', label: 'Password Strength Meter' },
      { id: 'dropzone', label: 'Dropzone' },
      { id: 'address-autocomplete', label: 'Address Autocomplete' },
      { id: 'time-range-picker', label: 'Time Range Picker' },
      { id: 'payment-method-list', label: 'Payment Method List' },
      { id: 'filter-popover', label: 'Filter Popover' },
      { id: 'tag-input', label: 'Tag Input' },
      { id: 'rating', label: 'Rating' },
      { id: 'segmented-radio-group', label: 'Segmented Radio Group' },
      { id: 'brand-color-picker', label: 'Brand Color Picker' },
      { id: 'stripe-payment-method', label: 'Stripe Payment Method' },
      { id: 'google-sign-in-button', label: 'Google Sign-In Button' },
      { id: 'rich-text-editor', label: 'Rich Text Editor' },
    ],
  },
  {
    title: 'Overlays & Menus',
    items: [
      { id: 'dialog', label: 'Dialog' },
      { id: 'alert-dialog', label: 'Alert Dialog' },
      { id: 'sheet', label: 'Sheet' },
      { id: 'drawer', label: 'Drawer' },
      { id: 'popover', label: 'Popover' },
      { id: 'hover-card', label: 'Hover Card' },
      { id: 'tooltip', label: 'Tooltip' },
      { id: 'dropdown-menu', label: 'Dropdown Menu' },
      { id: 'context-menu', label: 'Context Menu' },
      { id: 'menubar', label: 'Menubar' },
      { id: 'command', label: 'Command' },
      { id: 'notification-center', label: 'Notification Center' },
    ],
  },
  {
    title: 'Data Display',
    items: [
      { id: 'table', label: 'Table' },
      { id: 'card', label: 'Card' },
      { id: 'stat-card', label: 'Stat Card' },
      { id: 'info-row', label: 'Info Row' },
      { id: 'avatar', label: 'Avatar' },
      { id: 'badge', label: 'Badge' },
      { id: 'separator', label: 'Separator' },
      { id: 'aspect-ratio', label: 'Aspect Ratio' },
      { id: 'accordion', label: 'Accordion' },
      { id: 'collapsible', label: 'Collapsible' },
      { id: 'tabs', label: 'Tabs' },
      { id: 'pagination', label: 'Pagination' },
      { id: 'breadcrumb', label: 'Breadcrumb' },
      { id: 'truncate', label: 'Truncate' },
      { id: 'notification-row', label: 'Notification Row' },
      { id: 'field-row', label: 'Field Row' },
      { id: 'count-badge', label: 'Count Badge' },
      { id: 'sortable-list', label: 'Sortable List' },
      { id: 'crud-table', label: 'CRUD Screen' },
    ],
  },
  {
    title: 'Media & Charts',
    items: [
      { id: 'navigation-menu', label: 'Navigation Menu' },
      { id: 'carousel', label: 'Carousel' },
      { id: 'chart', label: 'Chart' },
      { id: 'calendar', label: 'Calendar' },
      { id: 'empty', label: 'Empty' },
      { id: 'error-state', label: 'Error State' },
      { id: 'item', label: 'Item' },
      { id: 'media-gallery', label: 'Media Gallery' },
      { id: 'pdf-document-kit', label: 'PDF Document Kit' },
    ],
  },
  {
    title: 'Feedback & Status',
    items: [
      { id: 'alert', label: 'Alert' },
      { id: 'progress', label: 'Progress' },
      { id: 'stepper', label: 'Stepper' },
      { id: 'skeleton', label: 'Skeleton' },
      { id: 'sonner', label: 'Sonner (Toast)' },
      { id: 'impersonation-banner', label: 'Impersonation Banner' },
    ],
  },
  {
    title: 'Layout & Chat',
    items: [
      { id: 'sidebar', label: 'Sidebar' },
      { id: 'resizable', label: 'Resizable' },
      { id: 'scroll-area', label: 'Scroll Area' },
      { id: 'bubble', label: 'Bubble' },
      { id: 'message', label: 'Message' },
      { id: 'message-scroller', label: 'Message Scroller' },
      { id: 'attachment', label: 'Attachment' },
      { id: 'marker', label: 'Marker' },
      { id: 'direction', label: 'Direction' },
    ],
  },
  {
    title: 'Typography',
    items: [{ id: 'typography', label: 'Typography' }],
  },
  {
    title: 'Patterns',
    items: [{ id: 'patterns', label: 'Date Picker & Data Table' }],
  },
]
