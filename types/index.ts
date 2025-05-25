export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
}

export interface Transaction {
  id: string
  userId: string
  type: "income" | "expense"
  amount: number
  title: string
  category: string
  note?: string
  date: Date
  createdAt: Date
}

export interface Category {
  id: string
  name: string
  icon?: string
  color?: string
  type: "income" | "expense"
}

export interface Budget {
  id: string
  userId: string
  category: string
  amount: number
  period: "monthly" | "weekly" | "yearly"
  createdAt: Date
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
