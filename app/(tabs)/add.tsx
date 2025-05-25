"use client"

import { useState, useEffect } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router } from "expo-router"
import { Colors } from "../../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { addTransaction } from "../services/transactionService"
import { getCategories } from "../services/categoryService"
import { addBudget, getBudgetByCategory, updateBudgetSpent } from "../services/budgetService"
import type { Category, TransactionFormData } from "../../types"

export default function AddScreen() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)

  const [formData, setFormData] = useState<TransactionFormData>({
    type: "expense",
    amount: "",
    title: "",
    category: "",
    note: "",
    date: new Date(),
  })

  // Load categories when component mounts or type changes
  useEffect(() => {
    loadCategories()
  }, [formData.type, user])

  const loadCategories = async () => {
    if (!user) return

    try {
      setLoadingCategories(true)
      const userCategories = await getCategories(user.uid, formData.type)
      setCategories(userCategories)

      // Reset selected category when type changes
      setFormData((prev) => ({ ...prev, category: "" }))
    } catch (error) {
      console.error("Error loading categories:", error)
      Alert.alert("Error", "Failed to load categories")
    } finally {
      setLoadingCategories(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to add transactions")
      return
    }

    // Validation
    if (!formData.amount || !formData.title || !formData.category) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    const amount = Number.parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount")
      return
    }

    if (formData.title.trim().length < 2) {
      Alert.alert("Error", "Title must be at least 2 characters long")
      return
    }

    setLoading(true)
    try {
      // Add transaction
      const transactionId = await addTransaction({
        userId: user.uid,
        type: formData.type,
        amount,
        title: formData.title.trim(),
        category: formData.category,
        note: formData.note?.trim() || undefined,
        date: formData.date,
      })

      // Update budget if it's an expense
      if (formData.type === "expense") {
        try {
          const budget = await getBudgetByCategory(user.uid, formData.category)
          if (budget) {
            const newSpentAmount = budget.spent + amount
            await updateBudgetSpent(budget.id!, newSpentAmount)
          }
        } catch (budgetError) {
          console.error("Error updating budget:", budgetError)
          // Don't fail the transaction if budget update fails
        }
      }

      // Reset form
      setFormData({
        type: "expense",
        amount: "",
        title: "",
        category: "",
        note: "",
        date: new Date(),
      })

      Alert.alert("Success", "Transaction added successfully!", [
        {
          text: "Add Another",
          style: "default",
        },
        {
          text: "View Transactions",
          onPress: () => router.push("/(tabs)/logs"),
        },
      ])
    } catch (error: any) {
      console.error("Add transaction error:", error)

      let errorMessage = "Failed to add transaction. Please try again."
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to add transactions."
      } else if (error.code === "network-request-failed") {
        errorMessage = "Network error. Please check your connection."
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (field: keyof TransactionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, "")

    // Ensure only one decimal point
    const parts = numericValue.split(".")
    if (parts.length > 2) {
      return parts[0] + "." + parts.slice(1).join("")
    }

    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      return parts[0] + "." + parts[1].substring(0, 2)
    }

    return numericValue
  }

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Please log in to add transactions</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Transaction</Text>
      </View>

      {/* Transaction Type Selector */}
      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, formData.type === "expense" && styles.typeButtonActive]}
          onPress={() => updateFormData("type", "expense")}
          disabled={loading}
        >
          <Ionicons name="remove-circle" size={20} color={formData.type === "expense" ? "white" : "#EF4444"} />
          <Text style={[styles.typeButtonText, formData.type === "expense" && styles.typeButtonTextActive]}>
            Expense
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, formData.type === "income" && styles.typeButtonActive]}
          onPress={() => updateFormData("type", "income")}
          disabled={loading}
        >
          <Ionicons name="add-circle" size={20} color={formData.type === "income" ? "white" : "#10B981"} />
          <Text style={[styles.typeButtonText, formData.type === "income" && styles.typeButtonTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        {/* Amount Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <View style={styles.amountContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="0.00"
              value={formData.amount}
              onChangeText={(value) => updateFormData("amount", formatCurrency(value))}
              keyboardType="decimal-pad"
              editable={!loading}
            />
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter transaction title"
            value={formData.title}
            onChangeText={(value) => updateFormData("title", value)}
            maxLength={50}
            editable={!loading}
          />
          <Text style={styles.characterCount}>{formData.title.length}/50</Text>
        </View>

        {/* Category Selection */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          {loadingCategories ? (
            <View style={styles.loadingCategories}>
              <Text style={styles.loadingText}>Loading categories...</Text>
            </View>
          ) : (
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
          )}

          {categories.length === 0 && !loadingCategories && (
            <View style={styles.noCategoriesContainer}>
              <Text style={styles.noCategoriesText}>
                No categories available. Default categories will be created automatically.
              </Text>
            </View>
          )}
        </View>

        {/* Note Input */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add a note..."
            value={formData.note}
            onChangeText={(value) => updateFormData("note", value)}
            multiline
            numberOfLines={3}
            maxLength={200}
            editable={!loading}
          />
          <Text style={styles.characterCount}>{(formData.note || "").length}/200</Text>
        </View>

        {/* Date Display */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date</Text>
          <View style={styles.dateDisplay}>
            <Ionicons name="calendar" size={20} color={Colors.primary} />
            <Text style={styles.dateText}>
              {formData.date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading || !formData.amount || !formData.title || !formData.category}
        >
          <Text style={styles.saveButtonText}>{loading ? "Saving..." : "Save Transaction"}</Text>
        </TouchableOpacity>

        {/* Quick Amount Buttons */}
        <View style={styles.quickAmounts}>
          <Text style={styles.quickAmountsLabel}>Quick amounts:</Text>
          <View style={styles.quickAmountButtons}>
            {["5", "10", "25", "50", "100"].map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAmountButton}
                onPress={() => updateFormData("amount", amount)}
                disabled={loading}
              >
                <Text style={styles.quickAmountText}>${amount}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
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
  header: {
    padding: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
  },
  typeSelector: {
    flexDirection: "row",
    margin: 20,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
  },
  typeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
  },
  typeButtonTextActive: {
    color: "white",
  },
  form: {
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
    fontSize: 24,
    fontWeight: "600",
    color: Colors.text,
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    padding: 16,
    paddingLeft: 0,
    fontSize: 24,
    fontWeight: "600",
    textAlign: "left",
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  loadingCategories: {
    padding: 20,
    alignItems: "center",
  },
  loadingText: {
    color: Colors.textSecondary,
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
  noCategoriesContainer: {
    padding: 16,
    backgroundColor: "#FEF3C7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F59E0B",
  },
  noCategoriesText: {
    fontSize: 14,
    color: "#92400E",
    textAlign: "center",
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
    color: Colors.text,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  quickAmounts: {
    marginTop: 20,
  },
  quickAmountsLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  quickAmountButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickAmountButton: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  quickAmountText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: "500",
  },
})
