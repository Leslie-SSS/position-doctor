import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

interface Props {
  children: ReactNode
}

export function ErrorBoundary({ children }: Props) {
  return <>{children}</>
}
