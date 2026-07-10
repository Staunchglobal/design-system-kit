import { ComponentSection } from '@/design-system/_lib/showcase'

const SHADE_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const

type ShadeScale = {
  name: string
  prefix: string
  values: Record<(typeof SHADE_STEPS)[number], string>
}

const SHADE_SCALES: ShadeScale[] = [
  {
    name: 'Neutral',
    prefix: 'neutral',
    values: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  {
    name: 'Primary',
    prefix: 'primary',
    values: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  {
    name: 'Secondary',
    prefix: 'secondary',
    values: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  {
    name: 'Accent',
    prefix: 'accent',
    values: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  {
    name: 'Muted',
    prefix: 'muted',
    values: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0a0a0a',
    },
  },
  {
    name: 'Destructive',
    prefix: 'destructive',
    values: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
      950: '#450a0a',
    },
  },
]

export default function ColorScalesSection() {
  return (
    <ComponentSection
      id="color-scales"
      title="Color Scales"
      description="50–950 ramps for each brand color, defined once in tokens/color-scales.css under :root (theme-invariant — same value in light and dark). Also usable directly as Tailwind utilities, e.g. bg-primary-500, text-destructive-600. Every semantic color token (see Colors) points at one of these steps."
    >
      <div className="space-y-4">
        {SHADE_SCALES.map((scale) => (
          <div key={scale.prefix} className="space-y-1.5">
            <p className="text-sm font-medium">{scale.name}</p>
            <div className="grid grid-cols-11 gap-1.5">
              {SHADE_STEPS.map((step) => (
                <div key={step} className="space-y-1 text-center">
                  <div
                    className="h-12 w-full rounded-md border"
                    style={{ backgroundColor: `var(--${scale.prefix}-${step})` }}
                  />
                  <p className="text-muted-foreground text-[10px] leading-none">{step}</p>
                  <p className="text-muted-foreground font-mono text-[9px] leading-none">
                    {scale.values[step]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ComponentSection>
  )
}
