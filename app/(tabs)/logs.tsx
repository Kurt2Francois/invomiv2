"use client"

import { useState, useMemo, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { useTransactions } from "../hooks/useTransactions"
import { useAuth } from "../hooks/useAuth"
import { convertToDate, formatDate, formatTime, getDateKey } from "../../utils/dateUtils"
import type { Transaction } from "../../types"
import { Timestamp } from "firebase/firestore"
import { useTransactionRefresh } from "../../context/TransactionContext"

export default function LogsScreen() {
  const { user } = useAuth()
  const { refreshKey } = useTransactionRefresh()
  const { transactions, loading, error, refetch } = useTransactions(user?.uid)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "income" | "expense">("all")

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetch()
    } catch (err) {
      console.error("Refresh error:", err)
      Alert.alert("Error", "Failed to refresh transactions")
    } finally {
      setRefreshing(false)
    }
  }

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    if (selectedFilter === "all") return transactions
    return transactions.filter(t => t.type === selectedFilter)
  }, [transactions, selectedFilter])

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}

    filteredTransactions.forEach(transaction => {
      const date = transaction.date instanceof Timestamp ? transaction.date.toDate() : transaction.date
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }

      groups[dateKey].push(transaction)
    })

    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
  }, [filteredTransactions])

  // Calculate daily totals
  const dailyTotals = useMemo(() => {
    const today = new Date()
    const todayTransactions = transactions.filter(t => {
      const tDate = t.date instanceof Timestamp ? t.date.toDate() : t.date
      const isToday = tDate.getDate() === today.getDate() &&
                      tDate.getMonth() === today.getMonth() &&
                      tDate.getFullYear() === today.getFullYear()
      return isToday
    })

    const dailyIncome = todayTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0)

    const dailyExpenses = todayTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0)

    return { dailyIncome, dailyExpenses }
  }, [transactions])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const sumTransactions = (transactions: Transaction[]) => {
    return transactions.reduce((sum: number, t: Transaction) => sum + t.amount, 0)
  }

  // Add type for transaction parameter
  const renderTransaction = (transaction: Transaction) => (
    <TouchableOpacity
      key={transaction.id}
      style={styles.transactionItem}
      onPress={() => {
        // Navigate to transaction details or edit
        console.log("Transaction tapped:", transaction.id)
      }}
    >
      <View style={styles.transactionLeft}>
        <View style={[styles.categoryIcon, { backgroundColor: transaction.type === "income" ? "#10B981" : "#EF4444" }]}>
          <Ionicons name={transaction.type === "income" ? "add" : "remove"} size={16} color="white" />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionMeta}>
            {transaction.category} • {formatTime(convertToDate(transaction.date))}
          </Text>
          {transaction.note && (
            <Text style={styles.transactionNote} numberOfLines={1}>
              {transaction.note}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.transactionRight}>
        <Text style={[styles.transactionAmount, { color: transaction.type === "income" ? "#10B981" : "#EF4444" }]}>
          {transaction.type === "income" ? "+" : "-"}
          {formatCurrency(transaction.amount)}
        </Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
      </View>
    </TouchableOpacity>
  )

  useEffect(() => {
    const handleTransactionAdded = () => {
      refetch()
    }

    window.addEventListener('TRANSACTION_ADDED', handleTransactionAdded)
    return () => window.removeEventListener('TRANSACTION_ADDED', handleTransactionAdded)
  }, [refetch])

  useEffect(() => {
    refetch()
  }, [refreshKey])

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please log in to view transactions</Text>
      </View>
    )
  }

  // Show error state if there's an error
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load transactions</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Transaction Logs</Text>
        <TouchableOpacity style={styles.dateSelector}>
          <Text style={styles.dateText}>All Time</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {(["all", "income", "expense"] as const).map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[styles.filterButton, selectedFilter === filter && styles.filterButtonActive]}
            onPress={() => setSelectedFilter(filter)}
          >
            <Text style={[styles.filterButtonText, selectedFilter === filter && styles.filterButtonTextActive]}>
              {filter === "all" ? "All" : filter === "income" ? "Income" : "Expenses"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Summary */}
      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>Today's Income</Text>
          <Text style={styles.incomeAmount}>{formatCurrency(dailyTotals.dailyIncome)}</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Today's Expenses</Text>
          <Text style={styles.expenseAmount}>{formatCurrency(dailyTotals.dailyExpenses)}</Text>
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView
        style={styles.transactionsList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : groupedTransactions.length > 0 ? (
          groupedTransactions.map(([dateString, dayTransactions]) => (
            <View key={dateString} style={styles.dateGroup}>
              <View style={styles.dateHeader}>
                <Text style={styles.dateTitle}>{formatDate(dateString)}</Text>
                <Text style={styles.dateCount}>
                  {dayTransactions.length} transaction{dayTransactions.length !== 1 ? "s" : ""}
                </Text>
              </View>
              {dayTransactions.map(renderTransaction)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No transactions found</Text>
            <Text style={styles.emptyStateSubtext}>
              {selectedFilter === "all"
                ? "Start by adding your first transaction"
                : `No ${selectedFilter} transactions yet`}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: Colors.error,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  dateSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  dateText: {
    color: Colors.primary,
    fontWeight: "500",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "white",
    alignItems: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  filterButtonTextActive: {
    color: "white",
  },
  summaryCards: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  incomeCard: {
    borderTopWidth: 3,
    borderTopColor: "#10B981",
  },
  expenseCard: {
    borderTopWidth: 3,
    borderTopColor: "#EF4444",
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  incomeAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#10B981",
  },
  expenseAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: "#EF4444",
  },
  transactionsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  dateGroup: {
    marginBottom: 24,
  },
  dateHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  dateCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  transactionMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  transactionRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 60,
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
})
