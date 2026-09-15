import { createElement, type HTMLAttributes, type JSX, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type TypographyVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'body1'
  | 'body2'
  | 'body3'
  | 'caption'
  | 'footer'

export type TypographySize =
  | 'xxs'
  | 'xs'
  | 'sm'
  | 'base'
  | 'lg'
  | 'xl'
  | '2xl'
  | '3xl'
  | '4xl'
  | '5xl'
  | '6xl'
  | '7xl'
  | '8xl'
  | '9xl'

export type TypographyFontWeight = 'regular' | 'medium' | 'semibold' | 'bold'

export type TypographySizeScale = {
  base: TypographySize
  sm?: TypographySize
  md?: TypographySize
  lg?: TypographySize
  xl?: TypographySize
}

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: keyof JSX.IntrinsicElements
  children: ReactNode
  fontWeight?: TypographyFontWeight
  size?: TypographySize | TypographySizeScale
  variant?: TypographyVariant
}

const HEADING_VARIANTS = new Set<TypographyVariant>(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])

const variantStyles: Record<TypographyVariant, string> = {
  h1: 'font-heading',
  h2: 'font-heading',
  h3: 'font-heading',
  h4: 'font-heading',
  h5: 'font-heading',
  h6: 'font-heading',
  body1: 'font-body',
  body2: 'font-body',
  body3: 'font-body',
  caption: 'font-body',
  footer: 'font-body',
}

const variantSize: Record<TypographyVariant, TypographySize> = {
  h1: '6xl',
  h2: '5xl',
  h3: '4xl',
  h4: '3xl',
  h5: '2xl',
  h6: 'xl',
  body1: 'lg',
  body2: 'base',
  body3: 'sm',
  caption: 'xs',
  footer: 'xxs',
}

const variantMapping: Record<TypographyVariant, keyof JSX.IntrinsicElements> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  body1: 'p',
  body2: 'p',
  body3: 'p',
  caption: 'span',
  footer: 'p',
}

const fontWeightClass: Record<TypographyFontWeight, string> = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
}

const sizeClass: Record<TypographySize, string> = {
  xxs: 'text-xxs',
  xs: 'text-xs',
  sm: 'text-sm',
  base: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
  '3xl': 'text-3xl',
  '4xl': 'text-4xl',
  '5xl': 'text-5xl',
  '6xl': 'text-6xl',
  '7xl': 'text-7xl',
  '8xl': 'text-8xl',
  '9xl': 'text-9xl',
}

const smSizeClass: Record<TypographySize, string> = {
  xxs: 'sm:text-xxs',
  xs: 'sm:text-xs',
  sm: 'sm:text-sm',
  base: 'sm:text-base',
  lg: 'sm:text-lg',
  xl: 'sm:text-xl',
  '2xl': 'sm:text-2xl',
  '3xl': 'sm:text-3xl',
  '4xl': 'sm:text-4xl',
  '5xl': 'sm:text-5xl',
  '6xl': 'sm:text-6xl',
  '7xl': 'sm:text-7xl',
  '8xl': 'sm:text-8xl',
  '9xl': 'sm:text-9xl',
}

const mdSizeClass: Record<TypographySize, string> = {
  xxs: 'md:text-xxs',
  xs: 'md:text-xs',
  sm: 'md:text-sm',
  base: 'md:text-base',
  lg: 'md:text-lg',
  xl: 'md:text-xl',
  '2xl': 'md:text-2xl',
  '3xl': 'md:text-3xl',
  '4xl': 'md:text-4xl',
  '5xl': 'md:text-5xl',
  '6xl': 'md:text-6xl',
  '7xl': 'md:text-7xl',
  '8xl': 'md:text-8xl',
  '9xl': 'md:text-9xl',
}

const lgSizeClass: Record<TypographySize, string> = {
  xxs: 'lg:text-xxs',
  xs: 'lg:text-xs',
  sm: 'lg:text-sm',
  base: 'lg:text-base',
  lg: 'lg:text-lg',
  xl: 'lg:text-xl',
  '2xl': 'lg:text-2xl',
  '3xl': 'lg:text-3xl',
  '4xl': 'lg:text-4xl',
  '5xl': 'lg:text-5xl',
  '6xl': 'lg:text-6xl',
  '7xl': 'lg:text-7xl',
  '8xl': 'lg:text-8xl',
  '9xl': 'lg:text-9xl',
}

const xlSizeClass: Record<TypographySize, string> = {
  xxs: 'xl:text-xxs',
  xs: 'xl:text-xs',
  sm: 'xl:text-sm',
  base: 'xl:text-base',
  lg: 'xl:text-lg',
  xl: 'xl:text-xl',
  '2xl': 'xl:text-2xl',
  '3xl': 'xl:text-3xl',
  '4xl': 'xl:text-4xl',
  '5xl': 'xl:text-5xl',
  '6xl': 'xl:text-6xl',
  '7xl': 'xl:text-7xl',
  '8xl': 'xl:text-8xl',
  '9xl': 'xl:text-9xl',
}

function getFontFamilyClass(variant?: TypographyVariant) {
  if (variant && HEADING_VARIANTS.has(variant)) {
    return 'font-heading'
  }

  return 'font-body'
}

function getFontWeightClass(variant?: TypographyVariant, fontWeight?: TypographyFontWeight) {
  if (fontWeight) {
    return fontWeightClass[fontWeight]
  }

  if (variant && HEADING_VARIANTS.has(variant)) {
    return 'font-bold'
  }

  return 'font-normal'
}

function getResolvedSize(variant?: TypographyVariant, size?: TypographySize | TypographySizeScale) {
  return size ?? (variant ? variantSize[variant] : 'base')
}

function getSizeClassName(size: TypographySize | TypographySizeScale) {
  if (typeof size === 'string') {
    return sizeClass[size]
  }

  return cn(
    sizeClass[size.base],
    size.sm && smSizeClass[size.sm],
    size.md && mdSizeClass[size.md],
    size.lg && lgSizeClass[size.lg],
    size.xl && xlSizeClass[size.xl]
  )
}

function getTypographyClassName(
  variant?: TypographyVariant,
  size?: TypographySize | TypographySizeScale,
  fontWeight?: TypographyFontWeight,
  className?: string
) {
  const fontClass = variant ? variantStyles[variant] : getFontFamilyClass(variant)
  const resolvedSize = getResolvedSize(variant, size)

  return cn(fontClass, getSizeClassName(resolvedSize), getFontWeightClass(variant, fontWeight), className)
}

function Typography({ as, children, className, fontWeight, size, variant, ...props }: TypographyProps) {
  const Component = as ?? (variant ? variantMapping[variant] : 'p')

  return createElement(
    Component,
    {
      'data-slot': 'typography',
      className: getTypographyClassName(variant, size, fontWeight, className),
      ...props,
    },
    children
  )
}

export { Typography }
