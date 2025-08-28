import React from 'react'

interface AccountBlockedAlertProps {
  isVisible: boolean
  onClose: () => void
  message: string
}

export const AccountBlockedAlert: React.FC<AccountBlockedAlertProps> = ({
  isVisible,
  onClose,
  message
}) => {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conta Bloqueada</h3>
            <p className="text-sm text-gray-600">Problema de acesso detectado</p>
          </div>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">{message}</p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
            <p className="text-sm text-yellow-800">
              <strong>O que fazer:</strong>
            </p>
            <ul className="text-sm text-yellow-700 mt-2 list-disc list-inside">
              <li>Verifique sua conexão com a internet</li>
              <li>Tente fazer logout e login novamente</li>
              <li>Se o problema persistir, entre em contato com o suporte</li>
            </ul>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Tentar Novamente
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AccountBlockedAlert