'use client'

import * as React from "react"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  placeholderColor?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, backgroundColor, borderColor, textColor, placeholderColor, ...props }, ref) => (
    <textarea
      className="flex min-h-20 w-full rounded-md border px-3 py-2 text-sm transition-colors placeholder:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
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
Textarea.displayName = "Textarea"

export { Textarea }
