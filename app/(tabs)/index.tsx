import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"

export default function HomeScreen() {
  const currentBalance = 2450.75
  const monthlyIncome = 3500.0
  const monthlyExpenses = 1049.25

  const recentTransactions = [
    { id: 1, title: "Grocery Shopping", amount: -85.5, category: "Food", date: "Today" },
    { id: 2, title: "Salary", amount: 3500.0, category: "Income", date: "Yesterday" },
    { id: 3, title: "Coffee", amount: -4.5, category: "Food", date: "Yesterday" },
    { id: 4, title: "Gas", amount: -45.0, category: "Transport", date: "2 days ago" },
  ]

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Good morning!</Text>
        <Text style={styles.subtitle}>Here's your financial overview</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${currentBalance.toFixed(2)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, styles.incomeCard]}>
          <Ionicons name="trending-up" size={24} color="#10B981" />
          <Text style={styles.summaryLabel}>Income</Text>
          <Text style={styles.summaryAmount}>+${monthlyIncome.toFixed(2)}</Text>
        </View>

        <View style={[styles.summaryCard, styles.expenseCard]}>
          <Ionicons name="trending-down" size={24} color="#EF4444" />
          <Text style={styles.summaryLabel}>Expenses</Text>
          <Text style={styles.summaryAmount}>-${monthlyExpenses.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((transaction) => (
          <View key={transaction.id} style={styles.transactionItem}>
            <View style={styles.transactionLeft}>
              <View style={[styles.categoryIcon, { backgroundColor: transaction.amount > 0 ? "#10B981" : "#EF4444" }]}>
                <Ionicons name={transaction.amount > 0 ? "add" : "remove"} size={16} color="white" />
              </View>
              <View>
                <Text style={styles.transactionTitle}>{transaction.title}</Text>
                <Text style={styles.transactionCategory}>
                  {transaction.category} • {transaction.date}
                </Text>
              </View>
            </View>
            <Text style={[styles.transactionAmount, { color: transaction.amount > 0 ? "#10B981" : "#EF4444" }]}>
              {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
    alignItems: "center",
    gap: 8,
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
    fontSize: 18,
    fontWeight: "600",
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
})
