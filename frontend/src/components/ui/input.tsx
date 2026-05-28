'use client'

import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  placeholderColor?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, backgroundColor, borderColor, textColor, placeholderColor, ...props }, ref) => (
    <input
      type={type}
      className={`flex h-10 w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${className ?? ''}`}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
      }}
      ref={ref}
      {...props}
    />
  )
)
Input.displayName = "Input"

export { Input }
