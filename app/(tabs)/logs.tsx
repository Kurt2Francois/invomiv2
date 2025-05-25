"use client"

import { useState } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"

export default function LogsScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date())

  const transactions = [
    { id: 1, title: "Morning Coffee", amount: -4.5, category: "Food", time: "08:30 AM", type: "expense" },
    { id: 2, title: "Uber Ride", amount: -12.75, category: "Transport", time: "09:15 AM", type: "expense" },
    { id: 3, title: "Lunch", amount: -15.2, category: "Food", time: "12:30 PM", type: "expense" },
    { id: 4, title: "Freelance Payment", amount: 250.0, category: "Income", time: "02:45 PM", type: "income" },
    { id: 5, title: "Grocery Shopping", amount: -85.5, category: "Food", time: "06:20 PM", type: "expense" },
  ]

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)
  const totalExpenses = Math.abs(transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0))

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Logs</Text>
        <TouchableOpacity style={styles.dateSelector}>
          <Text style={styles.dateText}>Today</Text>
          <Ionicons name="chevron-down" size={16} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryCards}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.incomeAmount}>+${totalIncome.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.expenseAmount}>-${totalExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <ScrollView style={styles.transactionsList}>
        <Text style={styles.sectionTitle}>Transactions</Text>

        {transactions.map((transaction) => (
          <TouchableOpacity key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View
                style={[
                  styles.categoryIcon,
                  { backgroundColor: transaction.type === "income" ? "#10B981" : "#EF4444" },
                ]}
              >
                <Ionicons name={transaction.type === "income" ? "add" : "remove"} size={16} color="white" />
              </View>
              <View>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionMeta}>
                  {transaction.category} • {transaction.time}
                </Text>
              </View>
            </View>
            <View style={styles.transactionRight}>
              <Text
                style={[styles.transactionAmount, { color: transaction.type === "income" ? "#10B981" : "#EF4444" }]}
              >
                {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
              </Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
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
  transactionMeta: {
    fontSize: 12,
    color: Colors.textSecondary,
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
})
