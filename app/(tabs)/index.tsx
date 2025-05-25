"use client"

import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useTransactions } from "../hooks/useTransactions"
import { useBudgets } from "../hooks/useBudgets"
import { useState, useMemo } from "react"
import { router } from "expo-router"
import type { Transaction, Budget } from "../../types"

export default function HomeScreen() {
  const { user } = useAuth()
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions()
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets(user?.uid)
  const [refreshing, setRefreshing] = useState(false)
  const [userProfile, setUserProfile] = useState<{ name?: string }>({})

  // Calculate financial summary
  const financialSummary = useMemo(() => {
    const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

    const currentBalance = totalIncome - totalExpenses

    return { totalIncome, totalExpenses, currentBalance }
  }, [transactions])

  // Get recent transactions (last 5)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 5)
  }, [transactions])

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    return "Good evening"
  }

  const onRefresh = async () => {
    await Promise.all([
      refetchTransactions(),
      refetchBudgets()
    ])
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatDate = (date: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString()
    }
  }

  const renderTransactionItem = (transaction: any) => (
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
        <View>
          <Text style={styles.transactionTitle}>{transaction.title}</Text>
          <Text style={styles.transactionCategory}>
            {transaction.category} • {formatDate(transaction.date)}
          </Text>
        </View>
      </View>
      <Text style={[styles.transactionAmount, { color: transaction.type === "income" ? "#10B981" : "#EF4444" }]}>
        {transaction.type === "income" ? "+" : "-"}
        {formatCurrency(transaction.amount)}
      </Text>
    </TouchableOpacity>
  )

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please log in to continue</Text>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getGreeting()}
          {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}!
        </Text>
        <Text style={styles.subtitle}>Here's your financial overview</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>{formatCurrency(financialSummary.currentBalance)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Ionicons name="trending-up" size={24} color="#10B981" />
          <View>
            <Text style={styles.summaryLabel}>Income</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(financialSummary.totalIncome)}</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="trending-down" size={24} color="#EF4444" />
          <View>
            <Text style={styles.summaryLabel}>Expenses</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(financialSummary.totalExpenses)}</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/(tabs)/add")}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.quickActionText}>Add Transaction</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push("/(tabs)/budgets")}>
          <Ionicons name="pie-chart" size={24} color={Colors.primary} />
          <Text style={styles.quickActionText}>View Budgets</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/logs")}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {transactionsLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </View>
        ) : recentTransactions.length > 0 ? (
          recentTransactions.map(renderTransactionItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No transactions yet</Text>
            <Text style={styles.emptyStateSubtext}>Start by adding your first income or expense</Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={() => router.push("/(tabs)/add")}>
              <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Budget Overview */}
      {budgets.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Budget Overview</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/budgets")}>
              <Text style={styles.seeAllText}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.budgetOverview}>
            {budgets.slice(0, 3).map((budget) => {
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
              const isOverBudget = budget.spent > budget.amount

              return (
                <View key={budget.id} style={styles.budgetItem}>
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                  <View style={styles.budgetProgress}>
                    <View style={styles.budgetProgressBar}>
                      <View
                        style={[
                          styles.budgetProgressFill,
                          {
                            width: `${Math.min(percentage, 100)}%`,
                            backgroundColor: isOverBudget ? "#EF4444" : "#10B981",
                          },
                        ]}
                      />
                    </View>
                    <Text style={[styles.budgetPercentage, { color: isOverBudget ? "#EF4444" : Colors.text }]}>
                      {percentage.toFixed(0)}%
                    </Text>
                  </View>
                  <Text style={styles.budgetAmount}>
                    {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                  </Text>
                </View>
              )
            })}
          </View>
        </View>
      )}
    </ScrollView>
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: Colors.primary,
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  balanceLabel: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: "white",
    fontSize: 32,
    fontWeight: "bold",
  },
  summaryRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  incomeCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  expenseCard: {
    borderLeftWidth: 4,
    borderLeftColor: "#EF4444",
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 2,
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  seeAllText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: "500",
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
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  transactionCategory: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "white",
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  emptyStateButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: "white",
    fontWeight: "600",
  },
  budgetOverview: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
  },
  budgetItem: {
    marginBottom: 16,
  },
  budgetCategory: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  budgetProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  budgetProgressBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 3,
  },
  budgetPercentage: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 30,
  },
  budgetAmount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
})
