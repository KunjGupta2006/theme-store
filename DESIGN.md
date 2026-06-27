---
name: Aurelian Thread
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#484740'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#79776f'
  outline-variant: '#cac6bd'
  surface-tint: '#605e59'
  primary: '#605e59'
  on-primary: '#ffffff'
  primary-container: '#f5f1ea'
  on-primary-container: '#6f6d68'
  inverse-primary: '#c9c6c0'
  secondary: '#625e56'
  on-secondary: '#ffffff'
  secondary-container: '#e8e2d8'
  on-secondary-container: '#68645c'
  tertiary: '#5f5e5b'
  on-tertiary: '#ffffff'
  tertiary-container: '#f4f1ec'
  on-tertiary-container: '#6e6d6a'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e6e2db'
  primary-fixed-dim: '#c9c6c0'
  on-primary-fixed: '#1c1c18'
  on-primary-fixed-variant: '#484742'
  secondary-fixed: '#e8e2d8'
  secondary-fixed-dim: '#ccc6bc'
  on-secondary-fixed: '#1e1b15'
  on-secondary-fixed-variant: '#4a463f'
  tertiary-fixed: '#e5e2dd'
  tertiary-fixed-dim: '#c8c6c2'
  on-tertiary-fixed: '#1c1c19'
  on-tertiary-fixed-variant: '#474743'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Inter Tight
    fontSize: 84px
    fontWeight: '700'
    lineHeight: 90px
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Inter Tight
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 52px
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Inter Tight
    fontSize: 60px
    fontWeight: '600'
    lineHeight: 68px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter Tight
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter Tight
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0.01em
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.1em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style
The design system is rooted in high-end editorial minimalism, capturing the essence of a premium boutique atelier. It targets a discerning audience that values craft, material integrity, and "quiet luxury." The emotional response is one of calm sophistication, exclusivity, and structural permanence.

The visual style blends **Editorial Minimalism** with **Modernist Architecture**. It prioritizes vast negative space to allow product photography to breathe. Layouts are asymmetric yet balanced, utilizing dramatic typography scales to create a sense of rhythm and hierarchy. Transitions should feel cinematic, employing slow fades and precision-weighted motion to reinforce the premium nature of the brand.

## Colors
The palette is built on a foundation of warm, organic neutrals that evoke the texture of premium cotton and natural fibers. 

- **Primary Canvas**: A soft, warm beige (#F5F1EA) serves as the base for all pages, reducing the harshness of pure white while maintaining high legibility.
- **Surface Hierarchy**: Secondary and tertiary surfaces provide subtle tonal shifts for sectioning and card backgrounds without breaking the monochromatic harmony.
- **Ink & Contrast**: All functional text and primary actions use a deep charcoal/black (#111111) to ensure a commanding presence and absolute clarity against the warm background.
- **Accents**: Use the accent color sparingly for high-intent actions, maintaining a strict "less is more" philosophy.

## Typography
Typography is the primary engine of the brand's character. The design system utilizes **Inter Tight** for headlines to achieve a condensed, vertical authority reminiscent of print fashion magazines. For body copy, the standard **Inter** family is used for its superior legibility and modern technical feel.

- **Dramatic Scale**: Use `display-lg` for hero sections with tight kerning to create impact.
- **Editorial Labels**: Use `label-caps` for eyebrows, categories, and small metadata. The increased letter spacing is essential for maintaining an airy, premium feel at small sizes.
- **Negative Space**: Ensure generous paragraph spacing (1.5x - 2x line height) to prevent text-heavy areas from feeling cluttered.

## Layout & Spacing
The layout follows a **Strict Fluid Grid** with an emphasis on intentional "dead space." 

- **Grid Strategy**: Use a 12-column grid for desktop with wide margins (64px) to center-focus the content.
- **Rhythm**: Spacing is based on a 4px baseline, but larger modules should jump in increments of 16px or 24px to create visible "blocks" of content.
- **Sectioning**: Vertical gaps between major sections should be aggressive (120px+) to ensure each product story or editorial block feels independent and significant.
- **Mobile Adaptation**: On mobile, shift to a 4-column grid. Tighten vertical section gaps to 80px but maintain the 20px edge margins to ensure the "frame" effect remains intact.

## Elevation & Depth
This design system rejects traditional shadows in favor of **Tonal Layering** and **Thin Outlines**. 

- **Planes**: Depth is communicated by placing `Card Surface` (#FAF7F2) elements on top of the `Primary Canvas` (#F5F1EA). 
- **Borders**: Use 1px borders with the specified `border_color_rgba` to define boundaries without adding visual weight. 
- **Focus**: When an element requires focus (like a modal or dropdown), use a subtle backdrop dim (rgba(17, 17, 17, 0.2)) rather than a heavy drop shadow. The aesthetic should remain flat and architectural.

## Shapes
The shape language is **Architectural and Precise**. 

- **Corners**: While the overall impression should be "sharp," apply a global 2px or 4px radius (`roundedness: 1`) to UI elements like buttons and input fields. This removes the "aggressive" digital edge and replaces it with a manufactured, high-quality finish.
- **Media**: Product imagery should remain strictly sharp (0px radius) to maintain the editorial magazine aesthetic. Only functional UI elements receive the subtle softening.

## Components
- **Primary Buttons**: Solid #0F0F0F background with white or #F5F1EA text. Use `label-caps` for the label. The height should be substantial (52px+) with minimal horizontal padding to create a monolithic look.
- **Secondary Buttons**: 1px border of #111111 with no background. Hover state involves a solid fill of #111111 with inverted text.
- **Inputs**: Bottom-border only or very thin 1px full borders. Background should be transparent or `Secondary Surface`. Labels should be `label-caps` placed above the field.
- **Cards**: Minimalist containers using `Card Surface`. Avoid shadows; use the 1px border to define the edge. The content inside should have at least 32px of internal padding.
- **Lists**: Clean horizontal dividers (1px) with generous vertical padding. Use `Inter` Medium for list items to ensure they feel structured.
- **Product Tiles**: Focus on the image first. The price and title should appear in a refined `body-md` or `label-caps` below the image, with significant whitespace between the image and the metadata.