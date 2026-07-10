import { ComponentSection } from '@/design-system/_lib/showcase'

type Swatch = {
  name: string
  cssVar: string
  light: string
  dark: string
}

type SwatchGroup = {
  title: string
  description?: string
  swatches: Swatch[]
}

const GROUPS: SwatchGroup[] = [
  {
    title: 'Base',
    description: 'Page background, surfaces, and borders.',
    swatches: [
      { name: 'Background', cssVar: '--background', light: '#ffffff', dark: '#0a0a0a' },
      { name: 'Foreground', cssVar: '--foreground', light: '#0a0a0a', dark: '#fafafa' },
      { name: 'Card', cssVar: '--card', light: '#ffffff', dark: '#171717' },
      { name: 'Card Foreground', cssVar: '--card-foreground', light: '#0a0a0a', dark: '#fafafa' },
      { name: 'Popover', cssVar: '--popover', light: '#ffffff', dark: '#171717' },
      {
        name: 'Popover Foreground',
        cssVar: '--popover-foreground',
        light: '#0a0a0a',
        dark: '#fafafa',
      },
      { name: 'Border', cssVar: '--border', light: '#e5e5e5', dark: '#ffffff1a' },
      { name: 'Input', cssVar: '--input', light: '#e5e5e5', dark: '#ffffff26' },
      { name: 'Ring', cssVar: '--ring', light: '#a3a3a3', dark: '#737373' },
    ],
  },
  {
    title: 'Brand & Actions',
    description: 'Buttons, links, and other interactive accents.',
    swatches: [
      { name: 'Primary', cssVar: '--primary', light: '#171717', dark: '#e5e5e5' },
      {
        name: 'Primary Foreground',
        cssVar: '--primary-foreground',
        light: '#fafafa',
        dark: '#171717',
      },
      { name: 'Secondary', cssVar: '--secondary', light: '#f5f5f5', dark: '#262626' },
      {
        name: 'Secondary Foreground',
        cssVar: '--secondary-foreground',
        light: '#171717',
        dark: '#fafafa',
      },
      { name: 'Muted', cssVar: '--muted', light: '#f5f5f5', dark: '#262626' },
      {
        name: 'Muted Foreground',
        cssVar: '--muted-foreground',
        light: '#737373',
        dark: '#a3a3a3',
      },
      { name: 'Accent', cssVar: '--accent', light: '#f5f5f5', dark: '#262626' },
      {
        name: 'Accent Foreground',
        cssVar: '--accent-foreground',
        light: '#171717',
        dark: '#fafafa',
      },
    ],
  },
  {
    title: 'Feedback',
    description: 'Destructive / error state.',
    swatches: [{ name: 'Destructive', cssVar: '--destructive', light: '#dc2626', dark: '#f87171' }],
  },
  {
    title: 'Charts',
    description: 'Series colors used by the Chart component.',
    swatches: [
      { name: 'Chart 1', cssVar: '--chart-1', light: '#d4d4d4', dark: '#d4d4d4' },
      { name: 'Chart 2', cssVar: '--chart-2', light: '#737373', dark: '#737373' },
      { name: 'Chart 3', cssVar: '--chart-3', light: '#525252', dark: '#525252' },
      { name: 'Chart 4', cssVar: '--chart-4', light: '#404040', dark: '#404040' },
      { name: 'Chart 5', cssVar: '--chart-5', light: '#262626', dark: '#262626' },
    ],
  },
  {
    title: 'Sidebar',
    description: 'Colors scoped to the Sidebar component.',
    swatches: [
      { name: 'Sidebar', cssVar: '--sidebar', light: '#fafafa', dark: '#171717' },
      {
        name: 'Sidebar Foreground',
        cssVar: '--sidebar-foreground',
        light: '#0a0a0a',
        dark: '#fafafa',
      },
      { name: 'Sidebar Primary', cssVar: '--sidebar-primary', light: '#171717', dark: '#e5e5e5' },
      {
        name: 'Sidebar Primary Foreground',
        cssVar: '--sidebar-primary-foreground',
        light: '#fafafa',
        dark: '#171717',
      },
      { name: 'Sidebar Accent', cssVar: '--sidebar-accent', light: '#f5f5f5', dark: '#262626' },
      {
        name: 'Sidebar Accent Foreground',
        cssVar: '--sidebar-accent-foreground',
        light: '#171717',
        dark: '#fafafa',
      },
      { name: 'Sidebar Border', cssVar: '--sidebar-border', light: '#e5e5e5', dark: '#ffffff1a' },
      { name: 'Sidebar Ring', cssVar: '--sidebar-ring', light: '#a3a3a3', dark: '#737373' },
    ],
  },
]

export default function ColorsSection() {
  return (
    <ComponentSection
      id="colors"
      title="Colors"
      description="Every semantic color token, defined in tokens/colors.css. Each one points at a step from a color scale (see Color Scales) rather than a raw hex value, so light/dark switching keeps working. Light mode values live under :root, dark mode values under .dark."
    >
      {GROUPS.map((group) => (
        <div key={group.title} className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">{group.title}</h3>
            {group.description ? (
              <p className="text-muted-foreground text-xs">{group.description}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {group.swatches.map((swatch) => (
              <div key={swatch.cssVar} className="space-y-2 rounded-lg border p-3">
                <div
                  className="h-14 w-full rounded-md border"
                  style={{ backgroundColor: `var(${swatch.cssVar})` }}
                />
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">{swatch.name}</p>
                  <p className="text-muted-foreground font-mono text-xs">{swatch.cssVar}</p>
                  <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                    <span className="text-muted-foreground">light</span>
                    <span className="font-mono">{swatch.light}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-muted-foreground">dark</span>
                    <span className="font-mono">{swatch.dark}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </ComponentSection>
  )
}
