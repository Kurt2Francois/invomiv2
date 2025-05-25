"use client"

import { useState } from "react"
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { Colors } from "../../constants/colors"

export default function AddScreen() {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [title, setTitle] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [note, setNote] = useState("")

  const categories = {
    expense: ["Food", "Transport", "Shopping", "Bills", "Entertainment", "Health", "Other"],
    income: ["Salary", "Freelance", "Investment", "Gift", "Other"],
  }

  const handleSave = () => {
    if (!amount || !title || !selectedCategory) {
      Alert.alert("Error", "Please fill in all required fields")
      return
    }

    // TODO: Save to Firebase
    console.log("Saving transaction:", {
      type,
      amount: Number.parseFloat(amount),
      title,
      category: selectedCategory,
      note,
      date: new Date().toISOString(),
    })

    Alert.alert("Success", "Transaction added successfully!", [
      {
        text: "OK",
        onPress: () => {
          setAmount("")
          setTitle("")
          setSelectedCategory("")
          setNote("")
        },
      },
    ])
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Transaction</Text>
      </View>

      <View style={styles.typeSelector}>
        <TouchableOpacity
          style={[styles.typeButton, type === "expense" && styles.typeButtonActive]}
          onPress={() => {
            setType("expense")
            setSelectedCategory("")
          }}
        >
          <Ionicons name="remove-circle" size={20} color={type === "expense" ? "white" : "#EF4444"} />
          <Text style={[styles.typeButtonText, type === "expense" && styles.typeButtonTextActive]}>Expense</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.typeButton, type === "income" && styles.typeButtonActive]}
          onPress={() => {
            setType("income")
            setSelectedCategory("")
          }}
        >
          <Ionicons name="add-circle" size={20} color={type === "income" ? "white" : "#10B981"} />
          <Text style={[styles.typeButtonText, type === "income" && styles.typeButtonTextActive]}>Income</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount *</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput style={styles.input} placeholder="Enter transaction title" value={title} onChangeText={setTitle} />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
            {categories[type].map((category) => (
              <TouchableOpacity
                key={category}
                style={[styles.categoryChip, selectedCategory === category && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[styles.categoryChipText, selectedCategory === category && styles.categoryChipTextActive]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Note (Optional)</Text>
          <TextInput
            style={[styles.input, styles.noteInput]}
            placeholder="Add a note..."
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Transaction</Text>
        </TouchableOpacity>
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
  amountInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 24,
    fontWeight: "600",
    backgroundColor: "white",
    textAlign: "center",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
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
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
})
