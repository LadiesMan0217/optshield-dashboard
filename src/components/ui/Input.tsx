import React, { forwardRef } from 'react'
import { LucideIcon } from 'lucide-react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: LucideIcon
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>((
  {
    label,
    error,
    icon: Icon,
    iconPosition = 'left',
    fullWidth = false,
    rightElement,
    className = '',
    ...props
  },
  ref
) => {
  const baseClasses = 'block w-full rounded-lg border bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-400 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-950 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const errorClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
    : 'border-zinc-700 focus:border-blue-500 focus:ring-blue-500'
  
  const paddingClasses = Icon
    ? iconPosition === 'left'
      ? 'pl-10'
      : 'pr-10'
    : ''
  
  const inputClasses = `
    ${baseClasses}
    ${errorClasses}
    ${paddingClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label className="block text-sm font-medium text-zinc-200 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && (
          <div className={`absolute inset-y-0 ${iconPosition === 'left' ? 'left-0 pl-3' : 'right-0 pr-3'} flex items-center pointer-events-none`}>
            <Icon className="w-4 h-4 text-zinc-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={inputClasses}
          {...props}
        />
        
        {rightElement && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'