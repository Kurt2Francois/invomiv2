import type { Timestamp } from "firebase/firestore"

export interface User {
  uid: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: "income" | "expense"
  amount: number
  title: string
  category: string
  note?: string
  date: Date | Timestamp
  createdAt: Date | Timestamp
  updatedAt?: Date | Timestamp
}
export interface Category {
  id?: string
  userId: string
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Budget {
  id?: string
  userId: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  startDate: Date
  endDate: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Report {
  totalIncome: number
  totalExpenses: number
  balance: number
  categoryBreakdown: {
    category: string
    amount: number
    percentage: number
  }[]
  period: {
    start: Date
    end: Date
  }
}

// Firestore-compatible types (with Timestamp)
export interface FirestoreTransaction {
  id?: string
  userId: string
  type: "income" | "expense"
  amount: number
  title: string
  category: string
  note?: string
  date: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreBudget {
  id?: string
  userId: string
  category: string
  amount: number
  spent: number
  period: "monthly" | "weekly" | "yearly"
  startDate: Timestamp
  endDate: Timestamp
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreCategory {
  id?: string
  userId: string
  name: string
  type: "income" | "expense"
  icon?: string
  color?: string
  isDefault: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

// UI State types
export interface LoadingState {
  isLoading: boolean
  error: string | null
}

export interface TransactionFilters {
  type?: "income" | "expense" | "all"
  category?: string
  dateRange?: {
    start: Date
    end: Date
  }
}

// Form types
export interface TransactionFormData {
  type: "income" | "expense"
  amount: string
  title: string
  category: string
  note: string
  date: Date
}

export interface BudgetFormData {
  category: string
  amount: string
  period: "monthly" | "weekly" | "yearly"
}

export interface UserProfileFormData {
  name: string
  email: string
  avatar?: string
}
