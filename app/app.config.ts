export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      neutral: 'slate',
    },
    button: {
      defaultVariants: {
        size: 'md',
        color: 'primary',
        variant: 'solid',
      },
    },
    card: {
      defaultVariants: {
        variant: 'outline',
      },
      slots: {
        root: 'border-neutral-800 bg-neutral-950',
      },
    },
    input: {
      defaultVariants: {
        size: 'md',
        color: 'neutral',
        variant: 'outline',
      },
    },
  },
})
