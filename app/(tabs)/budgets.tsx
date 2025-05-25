"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"

export default function BudgetsScreen() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [newBudgetCategory, setNewBudgetCategory] = useState("")
  const [newBudgetAmount, setNewBudgetAmount] = useState("")

  const budgets = [
    { id: 1, category: "Food", budget: 500, spent: 320, color: "#FF6B6B" },
    { id: 2, category: "Transport", budget: 200, spent: 150, color: "#4ECDC4" },
    { id: 3, category: "Entertainment", budget: 150, spent: 80, color: "#45B7D1" },
    { id: 4, category: "Shopping", budget: 300, spent: 280, color: "#96CEB4" },
    { id: 5, category: "Bills", budget: 800, spent: 750, color: "#FFEAA7" },
  ]

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)

  const getProgressPercentage = (spent: number, budget: number) => {
    return Math.min((spent / budget) * 100, 100)
  }

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 90) return "#EF4444"
    if (percentage >= 70) return "#F59E0B"
    return "#10B981"
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Budgets</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Ionicons name="add" size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.overviewCard}>
        <Text style={styles.overviewTitle}>Monthly Overview</Text>
        <View style={styles.overviewStats}>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewLabel}>Total Budget</Text>
            <Text style={styles.overviewAmount}>${totalBudget.toFixed(2)}</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewLabel}>Total Spent</Text>
            <Text style={[styles.overviewAmount, { color: "#EF4444" }]}>${totalSpent.toFixed(2)}</Text>
          </View>
          <View style={styles.overviewStat}>
            <Text style={styles.overviewLabel}>Remaining</Text>
            <Text style={[styles.overviewAmount, { color: "#10B981" }]}>${(totalBudget - totalSpent).toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.budgetsList}>
        <Text style={styles.sectionTitle}>Category Budgets</Text>

        {budgets.map((budget) => {
          const progressPercentage = getProgressPercentage(budget.spent, budget.budget)
          const progressColor = getProgressColor(budget.spent, budget.budget)

          return (
            <TouchableOpacity key={budget.id} style={styles.budgetItem}>
              <View style={styles.budgetHeader}>
                <View style={styles.budgetLeft}>
                  <View style={[styles.categoryDot, { backgroundColor: budget.color }]} />
                  <Text style={styles.budgetCategory}>{budget.category}</Text>
                </View>
                <Text style={styles.budgetAmount}>
                  ${budget.spent.toFixed(2)} / ${budget.budget.toFixed(2)}
                </Text>
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
                <Text style={[styles.progressText, { color: progressColor }]}>{progressPercentage.toFixed(0)}%</Text>
              </View>

              <Text style={styles.remainingText}>${(budget.budget - budget.spent).toFixed(2)} remaining</Text>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Budget</Text>
            <TouchableOpacity>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Category</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={newBudgetCategory}
                onChangeText={setNewBudgetCategory}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Budget Amount</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                value={newBudgetAmount}
                onChangeText={setNewBudgetAmount}
                keyboardType="numeric"
              />
            </View>
          </View>
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
  budgetsList: {
    flex: 1,
    paddingHorizontal: 20,
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
  budgetAmount: {
    fontSize: 14,
    color: Colors.textSecondary,
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
  remainingText: {
    fontSize: 12,
    color: Colors.textSecondary,
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
  modalForm: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
})
