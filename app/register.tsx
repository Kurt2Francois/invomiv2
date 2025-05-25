"use client"

import { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { Link, router } from "expo-router"
import { Colors } from "../constants/colors"
import { registerUser } from "./services/authService"
import { initializeDefaultCategories } from "./services/categoryService"

export default function RegisterScreen() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async () => {
    // Validation
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields")
      return
    }

    if (name.trim().length < 2) {
      Alert.alert("Error", "Name must be at least 2 characters long")
      return
    }

    if (!isValidEmail(email)) {
      Alert.alert("Error", "Please enter a valid email address")
      return
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long")
      return
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match")
      return
    }

    setLoading(true)
    try {
      // Register user
      const userProfile = await registerUser(email.trim(), password, name.trim())

      // Initialize default categories for new user
      await initializeDefaultCategories(userProfile.uid)

      // Clear form
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")

      // Navigate to main app
      router.replace("/login")

      Alert.alert("Success", `Welcome to INCOMI, ${userProfile.name}!`)
    } catch (error: any) {
      console.error("Registration error:", error)

      // Handle specific Firebase auth errors
      let errorMessage = "Registration failed. Please try again."

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists."
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address format."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak. Please choose a stronger password."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Email/password accounts are not enabled."
      }

      Alert.alert("Registration Failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const getPasswordStrength = (password: string) => {
    if (password.length === 0) return ""
    if (password.length < 6) return "Weak"
    if (password.length < 8) return "Fair"
    if (password.match(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)) return "Strong"
    return "Good"
  }

  const getPasswordColor = (strength: string) => {
    switch (strength) {
      case "Weak":
        return "#ef4444"
      case "Fair":
        return "#f59e0b"
      case "Good":
        return "#3b82f6"
      case "Strong":
        return "#10b981"
      default:
        return Colors.textSecondary
    }
  }

  const passwordStrength = getPasswordStrength(password)

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join INCOMI today</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          editable={!loading}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />

        <View>
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />
          {password.length > 0 && (
            <Text style={[styles.passwordStrength, { color: getPasswordColor(passwordStrength) }]}>
              Password strength: {passwordStrength}
            </Text>
          )}
        </View>

        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          editable={!loading}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? "Creating Account..." : "Create Account"}</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/login" asChild>
            <TouchableOpacity disabled={loading}>
              <Text style={[styles.linkText, loading && styles.linkDisabled]}>Sign In</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.termsText}>
          By creating an account, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
  },
  form: {
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "white",
  },
  passwordStrength: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: "500",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: {
    color: Colors.textSecondary,
  },
  linkText: {
    color: Colors.primary,
    fontWeight: "600",
  },
  linkDisabled: {
    opacity: 0.5,
  },
  termsText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 16,
  },
})
