"use client"

import { useState, useEffect } from "react"
import { collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../../firebase/config"
import type { Transaction } from "../../types"

export const useTransactions = (userId?: string, type?: "income" | "expense") => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const transactionsRef = collection(db, "transactions")
      let q = query(transactionsRef, where("userId", "==", userId))
      
      if (type) {
        q = query(q, where("type", "==", type))
      }

      const snapshot = await getDocs(q)
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[]

      setTransactions(data)
      setError(null)
    } catch (err) {
      console.error("Fetch transactions error:", err)
      setError("Failed to load transactions")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactions()
  }, [userId, type])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
}
