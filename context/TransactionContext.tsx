import { createContext, useContext, useState } from "react"

type TransactionContextType = {
  refreshKey: number
  triggerRefresh: () => void
}

const TransactionContext = createContext<TransactionContextType>({
  refreshKey: 0,
  triggerRefresh: () => {},
})

export function TransactionProvider({ children }: { children: React.ReactNode }) {
  const [refreshKey, setRefreshKey] = useState(0)

  const triggerRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <TransactionContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </TransactionContext.Provider>
  )
}

export const useTransactionRefresh = () => useContext(TransactionContext)