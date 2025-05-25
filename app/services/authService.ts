import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { auth, db } from "../../firebase/config"

export interface UserProfile {
  uid: string
  name: string
  email: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// 🔹 USERS CRUD FUNCTIONS

// Create: Register new user
export const registerUser = async (email: string, password: string, name: string): Promise<UserProfile> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: name })

    // Create user document in Firestore
    const userProfile: UserProfile = {
      uid: user.uid,
      name,
      email,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)
    return userProfile
  } catch (error) {
    console.error("Registration error:", error)
    throw error
  }
}

// Login user
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password)
    return userCredential.user
  } catch (error) {
    console.error("Login error:", error)
    throw error
  }
}

// Read: Fetch user profile data
export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid))
    if (userDoc.exists()) {
      return userDoc.data() as UserProfile
    }
    return null
  } catch (error) {
    console.error("Get user profile error:", error)
    throw error
  }
}

// Update: Update profile info
export const updateUserProfile = async (userId: string, data: Partial<UserProfile>): Promise<void> => {
  try {
    const userRef = doc(db, "users", userId)
    await updateDoc(userRef, data)
  } catch (error) {
    console.error("Update user profile error:", error)
    throw error
  }
}

// Delete: Delete account
export const deleteUserAccount = async (uid: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "users", uid))
    // Note: Also delete user from Firebase Auth if needed
  } catch (error) {
    console.error("Delete user account error:", error)
    throw error
  }
}

// Logout user
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth)
  } catch (error) {
    console.error("Logout error:", error)
    throw error
  }
}
