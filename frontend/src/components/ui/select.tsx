'use client'

import * as React from "react"
import * as SelectPrimitive from "@radix-ui/react-select"
import { Check, ChevronDown } from "lucide-react"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    backgroundColor?: string
    borderColor?: string
    textColor?: string
  }
>(({ className, children, backgroundColor, borderColor, textColor, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    style={{
      backgroundColor,
      borderColor,
      color: textColor,
    }}
    className={`flex h-10 w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition-colors disabled:opacity-50 ${className ?? ''}`}
    {...props}
  >
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDown className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content> & {
    backgroundColor?: string
    borderColor?: string
    textColor?: string
  }
>(({ className, children, position = "popper", backgroundColor, borderColor, textColor, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      position={position}
      style={{
        backgroundColor,
        borderColor,
        color: textColor,
      }}
      className={`relative z-[120] max-h-96 min-w-32 overflow-hidden rounded-md border shadow-md ${className ?? ''}`}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-1">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item> & {
    textColor?: string
    hoverColor?: string
  }
>(({ className, children, textColor, hoverColor, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    style={{
      color: textColor,
    }}
    className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors hover:opacity-80 ${className ?? ''}`}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="h-4 w-4" />
      </SelectPrimitive.ItemIndicator>
    </span>

    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ ...props }, ref) => (
  <SelectPrimitive.Separator ref={ref} className="-mx-1 my-1 h-px" {...props} />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectSeparator,
}
