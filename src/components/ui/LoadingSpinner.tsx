import React from 'react'
import { OrbitalLoader } from './OrbitalLoader'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
  text,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16'
  }
  
  return (
    <OrbitalLoader 
      className={`${sizeClasses[size]} ${className}`}
      message={text}
      messagePlacement="bottom"
    />
  )
}

interface FullPageLoadingProps {
  text?: string
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  text = 'Carregando...',
}) => {
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}