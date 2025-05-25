"use client"

import { useState, useEffect } from "react"
import { getBudgets } from "../services/budgetService"
import type { Budget } from "../../types"

export const useBudgets = (userId?: string) => {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refetch = async () => {
    if (!userId) return
    
    setLoading(true)
    try {
      const data = await getBudgets(userId)
      setBudgets(data)
      setError(null)
    } catch (err) {
      console.error("Error fetching budgets:", err)
      setError("Failed to load budgets")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refetch()
  }, [userId])

  return {
    budgets,
    loading,
    error,
    refetch
  }
}
