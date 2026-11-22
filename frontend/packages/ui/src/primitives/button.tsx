import type { ComponentProps } from 'react'
import { Button as UiButton, buttonVariants } from '../components/ui/button'

export { UiButton as Button, buttonVariants }
export type ButtonProps = ComponentProps<typeof UiButton>