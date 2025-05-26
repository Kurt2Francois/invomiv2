"use client"

import { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  RefreshControl,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useBudgets } from "../hooks/useBudgets"
import { useTransactions } from "../hooks/useTransactions"
import { deleteBudget, createMonthlyBudget } from "../services/budgetService"
import { getCategories } from "../services/categoryService"
import type { Category, BudgetFormData, Budget } from "../../types"
import { useTransactionRefresh } from "../../context/TransactionContext"

export default function BudgetsScreen() {
  const { user } = useAuth()
  const { refreshKey } = useTransactionRefresh()
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets(user?.uid)
  const { transactions } = useTransactions("expense")
  const [showAddModal, setShowAddModal] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState<BudgetFormData>({
    category: "",
    amount: "",
    period: "monthly",
  })

  useEffect(() => {
    loadCategories()
  }, [user])

  useEffect(() => {
    const handleTransactionAdded = () => {
      refetchBudgets()
    }

    window.addEventListener("TRANSACTION_ADDED", handleTransactionAdded)
    return () => window.removeEventListener("TRANSACTION_ADDED", handleTransactionAdded)
  }, [refetchBudgets])

  useEffect(() => {
    refetchBudgets()
  }, [refreshKey])

  const loadCategories = async () => {
    if (!user) return

    try {
      const expenseCategories = await getCategories(user.uid, "expense")
      setCategories(expenseCategories)
    } catch (error) {
      console.error("Error loading categories:", error)
    }
  }

  // Calculate budget totals
  const totalBudget = budgets.reduce((sum: number, b: Budget) => sum + b.amount, 0)
  const totalSpent = budgets.reduce((sum: number, b: Budget) => sum + b.spent, 0)
  const budgetTotals = {
    totalBudget,
    totalSpent,
    get totalRemaining() {
      return this.totalBudget - this.totalSpent
    },
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      await refetchBudgets()
    } catch (error) {
      console.error("Refresh error:", error)
    } finally {
      setRefreshing(false)
    }
  }

  const handleAddBudget = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to create budgets")
      return
    }

    // Validation
    if (!formData.category || !formData.amount) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid budget amount")
      return
    }

    // Check if budget already exists for this category
    const existingBudget = budgets.find((b) => b.category === formData.category && b.isActive)
    if (existingBudget) {
      Alert.alert("Error", "A budget for this category already exists")
      return
    }

    setLoading(true)
    try {
      await createMonthlyBudget(user.uid, formData.category, amount)
      setFormData({ category: "", amount: "", period: "monthly" })
      setShowAddModal(false)
      await refetchBudgets()

      Alert.alert("Success", "Budget created successfully!")
    } catch (error: any) {
      console.error("Add budget error:", error)

      let errorMessage = "Failed to create budget. Please try again."
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to create budgets."
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBudget = async (budgetId: string, categoryName: string) => {
    Alert.alert("Delete Budget", `Are you sure you want to delete the budget for ${categoryName}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudget(budgetId)
            await refetchBudgets()
            Alert.alert("Success", "Budget deleted successfully!")
          } catch (error) {
            console.error("Delete budget error:", error)
            Alert.alert("Error", "Failed to delete budget")
          }
        },
      },
    ])
  }

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 90) return "#EF4444"
    if (percentage >= 70) return "#F59E0B"
    return "#10B981"
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/[^0-9.]/g, "")
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("")
    }
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2)
    }
    return numericValue
  }

  const updateFormData = (field: keyof BudgetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please log in to view budgets</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Budget Overview */}
        <View style={styles.overviewCard}>
          <Text style={styles.overviewTitle}>Monthly Overview</Text>
          <View style={styles.overviewStats}>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>Total Budget</Text>
              <Text style={styles.overviewAmount}>{formatCurrency(budgetTotals.totalBudget)}</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>Total Spent</Text>
              <Text style={[styles.overviewAmount, styles.spentAmount]}>{formatCurrency(budgetTotals.totalSpent)}</Text>
            </View>
            <View style={styles.overviewStat}>
              <Text style={styles.overviewLabel}>Remaining</Text>
              <Text style={[styles.overviewAmount, styles.remainingAmount]}>
                {formatCurrency(budgetTotals.totalRemaining)}
              </Text>
            </View>
          </View>
        </View>

        {/* Budgets List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Category Budgets</Text>

          {budgetsLoading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading budgets...</Text>
            </View>
          ) : budgets.length > 0 ? (
            budgets.map((budget) => {
              const progressPercentage = getProgressPercentage(budget.spent, budget.amount)
              const progressColor = getProgressColor(budget.spent, budget.amount)
              const remaining = budget.amount - budget.spent
              const isOverBudget = budget.spent > budget.amount

              // Add type for budget parameter
              const renderBudget = (budget: Budget) => {
                return (
                  <View key={budget.id} style={styles.budgetItem}>
                    <View style={styles.budgetHeader}>
                      <View style={styles.budgetLeft}>
                        <View style={[styles.categoryDot, { backgroundColor: progressColor }]} />
                        <Text style={styles.budgetCategory}>{budget.category}</Text>
                      </View>
                      <View style={styles.budgetActions}>
                        <Text style={styles.budgetAmount}>
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </Text>
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDeleteBudget(budget.id!, budget.category)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    <View style={styles.progressContainer}>
                      <View style={styles.progressBar}>
                        <View
                          style={[
                            styles.progressFill,
                            {
                              width: `${progressPercentage}%`,
                              backgroundColor: progressColor,
                            },
                          ]}
                        />
                      </View>
                      <Text style={[styles.progressText, { color: progressColor }]}>
                        {progressPercentage.toFixed(0)}%
                      </Text>
                    </View>

                    <View style={styles.budgetFooter}>
                      <Text style={[styles.remainingText, { color: isOverBudget ? "#EF4444" : "#10B981" }]}>
                        {isOverBudget
                          ? `Over budget by ${formatCurrency(Math.abs(remaining))}`
                          : `${formatCurrency(remaining)} remaining`}
                      </Text>
                      {isOverBudget && (
                        <View style={styles.warningBadge}>
                          <Ionicons name="warning" size={12} color="#EF4444" />
                          <Text style={styles.warningText}>Over Budget</Text>
                        </View>
                      )}
                    </View>
                  </View>
                )
              }

              return renderBudget(budget)
            })
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="pie-chart-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No budgets set</Text>
              <Text style={styles.emptyStateSubtext}>Create your first budget to start tracking your spending</Text>
              <TouchableOpacity style={styles.emptyStateButton} onPress={() => setShowAddModal(true)}>
                <Text style={styles.emptyStateButtonText}>Create Budget</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Budget Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Budget</Text>
            <TouchableOpacity onPress={handleAddBudget} disabled={loading || !formData.category || !formData.amount}>
              <Text
                style={[
                  styles.modalSave,
                  (loading || !formData.category || !formData.amount) && styles.modalSaveDisabled,
                ]}
              >
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryChip, formData.category === category.name && styles.categoryChipActive]}
                    onPress={() => updateFormData("category", category.name)}
                    disabled={loading}
                  >
                    <Text
                      style={[
                        styles.categoryChipText,
                        formData.category === category.name && styles.categoryChipTextActive,
                      ]}
                    >
                      {category.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Amount *</Text>
              <View style={styles.amountContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  value={formData.amount}
                  onChangeText={(value) => updateFormData("amount", formatCurrencyInput(value))}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Period</Text>
              <View style={styles.periodSelector}>
                <TouchableOpacity
                  style={[styles.periodButton, formData.period === "monthly" && styles.periodButtonActive]}
                  onPress={() => updateFormData("period", "monthly")}
                  disabled={loading}
                >
                  <Text
                    style={[styles.periodButtonText, formData.period === "monthly" && styles.periodButtonTextActive]}
                  >
                    Monthly
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.periodNote}>Currently only monthly budgets are supported</Text>
            </View>

            {/* Budget Tips */}
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>💡 Budget Tips</Text>
              <Text style={styles.tipText}>• Start with the 50/30/20 rule: 50% needs, 30% wants, 20% savings</Text>
              <Text style={styles.tipText}>• Review and adjust your budgets monthly</Text>
              <Text style={styles.tipText}>• Set realistic goals to avoid overspending</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: Colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    flex: 1,
  },
  overviewCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 20,
    borderRadius: 16,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  overviewStats: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  overviewStat: {
    alignItems: "center",
  },
  overviewLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  overviewAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  spentAmount: {
    color: "#EF4444",
  },
  remainingAmount: {
    color: "#10B981",
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  budgetItem: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  budgetLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  budgetCategory: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  budgetActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  budgetAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  deleteButton: {
    padding: 4,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: "#F3F4F6",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    minWidth: 30,
  },
  budgetFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  remainingText: {
    fontSize: 12,
    fontWeight: "500",
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  warningText: {
    fontSize: 10,
    color: "#EF4444",
    fontWeight: "500",
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
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: "white",
  },
  modalCancel: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  modalSave: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveDisabled: {
    opacity: 0.5,
  },
  modalForm: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: "row",
  },
  categoryChip: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    color: Colors.text,
  },
  categoryChipTextActive: {
    color: "white",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    backgroundColor: "white",
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 18,
    fontWeight: "600",
  },
  periodSelector: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
  },
  periodButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  periodButtonTextActive: {
    color: "white",
  },
  periodNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 8,
    fontStyle: "italic",
  },
  tipsContainer: {
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    marginTop: 20,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0369A1",
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: "#0369A1",
    marginBottom: 8,
    lineHeight: 20,
  },
})
