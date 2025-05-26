"use client"

import { useState, useMemo, useEffect } from "react"
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, Modal } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { router, useNavigation } from "expo-router"
import { Colors } from "../../constants/colors"
import { useAuth } from "../hooks/useAuth"
import { useTransactions } from "../hooks/useTransactions"
import { useBudgets } from "../hooks/useBudgets"
import { 
  updateUserProfile, 
  logoutUser 
} from "../services/authService"
import { 
  generateMonthlyReport,
  type CategorySummary,
  type BudgetComparison 
} from "../services/reportService"
import type { UserProfileFormData } from "../../types"
import type { Transaction } from "../../types"

// Add type interfaces
interface MonthlyReport {
  totalIncome: number
  totalExpenses: number
  balance: number
  expensesByCategory: CategorySummary[]
  budgetComparison: BudgetComparison[]
}

export default function ProfileScreen() {
  const { user, userProfile } = useAuth()
  const { transactions, loading: transactionsLoading, refetch: refetchTransactions } = useTransactions(user?.uid)
  const { budgets, loading: budgetsLoading, refetch: refetchBudgets } = useBudgets(user?.uid)
  const navigation = useNavigation()
  
  const [showEditModal, setShowEditModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<UserProfileFormData>({
    name: userProfile?.name || "",
    email: userProfile?.email || "",
    avatar: userProfile?.avatar || "",
  })

  // Replace router.addListener with useEffect focus handling
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refetchTransactions()
      refetchBudgets()
    })

    return unsubscribe
  }, [])

  // Update stats calculation with proper filtering and counting
  const stats = useMemo(() => {
    const activeCategories = new Set(transactions.map(t => t.category))
    const activeBudgets = budgets.filter(b => b.isActive) // Changed from isArchived

    return {
      totalTransactions: transactions.length,
      totalCategories: activeCategories.size,
      totalBudgets: activeBudgets.length,
      joinDate: userProfile?.createdAt
        ? new Date(userProfile.createdAt).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
        : "Unknown",
    }
  }, [transactions, budgets, userProfile?.createdAt])

  const menuItems = [
    {
      id: 1,
      title: "Account Settings",
      icon: "person-outline",
      action: () => setShowEditModal(true),
    },
    {
      id: 2,
      title: "Notifications",
      icon: "notifications-outline",
      action: () => handleNotifications(),
    },
    {
      id: 3,
      title: "Export Data",
      icon: "download-outline",
      action: () => handleExportData(),
    },
    {
      id: 4,
      title: "Generate Report",
      icon: "document-text-outline",
      action: () => handleGenerateReport(),
    },
    {
      id: 5,
      title: "Privacy Policy",
      icon: "shield-outline",
      action: () => handlePrivacyPolicy(),
    },
    {
      id: 6,
      title: "Help & Support",
      icon: "help-circle-outline",
      action: () => handleHelpSupport(),
    },
  ]

  const handleUpdateProfile = async () => {
    if (!user || !userProfile) {
      Alert.alert("Error", "User not found")
      return
    }

    if (!formData.name.trim()) {
      Alert.alert("Error", "Name is required")
      return
    }

    if (formData.name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters long")
      return
    }

    setLoading(true)
    try {
      await updateUserProfile(user.uid, {
        name: formData.name.trim(),
        // Note: Email updates require re-authentication in Firebase
        // avatar: formData.avatar
      })

      setShowEditModal(false)
      Alert.alert("Success", "Profile updated successfully!")
    } catch (error: any) {
      console.error("Update profile error:", error)

      let errorMessage = "Failed to update profile. Please try again."
      if (error.code === "permission-denied") {
        errorMessage = "You don't have permission to update this profile."
      }

      Alert.alert("Error", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser()
            // Change this line to redirect to app root
            router.replace("/login")
          } catch (error) {
            console.error("Logout error:", error)
            Alert.alert("Error", "Failed to logout. Please try again.")
          }
        },
      },
    ])
  }

  const handleNotifications = () => {
    Alert.alert("Notifications", "Notification settings feature coming soon!")
  }

  const handleExportData = async () => {
    try {
      const data = {
        user: userProfile,
        transactions: transactions,
        budgets: budgets,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      }

      // In a real app, you would use a file system library to save this
      Alert.alert(
        "Export Data",
        `Your data has been prepared for export.\n\nTransactions: ${transactions.length}\nBudgets: ${budgets.length}\n\nIn a production app, this would be saved to your device.`,
        [{ text: "OK" }],
      )
    } catch (error) {
      console.error("Export error:", error)
      Alert.alert("Error", "Failed to export data")
    }
  }

  const handleGenerateReport = async () => {
    if (!user) {
      Alert.alert("Error", "Please log in to generate reports")
      return
    }

    try {
      const now = new Date()
      const report: MonthlyReport = await generateMonthlyReport(user.uid, now.getFullYear(), now.getMonth() + 1)

      const reportText = `
Monthly Report - ${now.toLocaleDateString("en-US", { month: "long", year: "numeric" })}

💰 Financial Summary:
• Total Income: $${report.totalIncome.toFixed(2)}
• Total Expenses: $${report.totalExpenses.toFixed(2)}
• Net Balance: $${report.balance.toFixed(2)}

📊 Top Expense Categories:
${report.expensesByCategory
  .slice(0, 3)
  .map((cat: CategorySummary) => `• ${cat.category}: $${cat.amount.toFixed(2)} (${cat.percentage.toFixed(1)}%)`)
  .join("\n")}

📈 Budget Performance:
${report.budgetComparison
  .slice(0, 3)
  .map((budget: BudgetComparison) => `• ${budget.category}: ${budget.percentage.toFixed(1)}% used`)
  .join("\n")}
      `

      Alert.alert("Monthly Report", reportText.trim())
    } catch (error) {
      console.error("Generate report error:", error)
      Alert.alert("Error", "Failed to generate report")
    }
  }

  const handlePrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "Your privacy is important to us. We collect and use your financial data solely to provide expense tracking services. Your data is encrypted and stored securely. We never share your personal information with third parties without your consent.",
      [{ text: "OK" }],
    )
  }

  const handleHelpSupport = () => {
    Alert.alert(
      "Help & Support",
      "Need help with INCOMI?\n\n• Check our FAQ section\n• Contact support: support@incomi.app\n• Visit our website: www.incomi.app\n\nWe're here to help you manage your finances better!",
      [{ text: "OK" }],
    )
  }

  const updateFormData = (field: keyof UserProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (!user || !userProfile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading profile...</Text>
      </View>
    )
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          {userProfile.avatar ? (
            <Image source={{ uri: userProfile.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={40} color="white" />
            </View>
          )}
        </View>
        <Text style={styles.userName}>{userProfile.name}</Text>
        <Text style={styles.userEmail}>{userProfile.email}</Text>
        <Text style={styles.joinDate}>Member since {stats.joinDate}</Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {transactionsLoading ? "..." : stats.totalTransactions}
          </Text>
          <Text style={styles.statLabel}>Transactions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {transactionsLoading ? "..." : stats.totalCategories}
          </Text>
          <Text style={styles.statLabel}>Categories</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {budgetsLoading ? "..." : stats.totalBudgets}
          </Text>
          <Text style={styles.statLabel}>Budgets</Text>
        </View>
      </View>

      {/* Menu Section */}
      <View style={styles.menuSection}>
        {menuItems.map((item) => (
          <TouchableOpacity key={item.id} style={styles.menuItem} onPress={item.action}>
            <View style={styles.menuLeft}>
              <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
              <Text style={styles.menuTitle}>{item.title}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      {/* App Version */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>INCOMI v1.0.0</Text>
        <Text style={styles.footerText}>Made with ❤️ for better financial management</Text>
      </View>

      {/* Edit Profile Modal */}
      <Modal visible={showEditModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={handleUpdateProfile} disabled={loading || !formData.name.trim()}>
              <Text style={[styles.modalSave, (loading || !formData.name.trim()) && styles.modalSaveDisabled]}>
                {loading ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                value={formData.name}
                onChangeText={(value) => updateFormData("name", value)}
                maxLength={50}
                editable={!loading}
              />
              <Text style={styles.characterCount}>{formData.name.length}/50</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={formData.email} editable={false} />
              <Text style={styles.inputNote}>
                Email cannot be changed. Contact support if you need to update your email.
              </Text>
            </View>

            <View style={styles.infoContainer}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>Profile changes will be reflected across all your devices.</Text>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
  profileCard: {
    backgroundColor: "white",
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  joinDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsCard: {
    backgroundColor: "white",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.border,
  },
  menuSection: {
    backgroundColor: "white",
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuTitle: {
    fontSize: 16,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    margin: 20,
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#EF4444",
  },
  footer: {
    alignItems: "center",
    padding: 20,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
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
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  inputDisabled: {
    backgroundColor: "#F9FAFB",
    color: Colors.textSecondary,
  },
  characterCount: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  inputNote: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    fontStyle: "italic",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F0F9FF",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0EA5E9",
    marginTop: 20,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: "#0369A1",
    lineHeight: 20,
  },
})
