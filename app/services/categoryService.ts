import { collection, doc, addDoc, getDocs, updateDoc, deleteDoc, query, where, Timestamp, writeBatch } from "firebase/firestore"
import { db } from "../../firebase/config"
import type { Category, FirestoreCategory } from "../../types"

// 🔹 CATEGORIES CRUD FUNCTIONS

// Create: Add custom category
export const addCategory = async (category: Omit<Category, "id" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const categoryData = {
      ...category,
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    }

    const docRef = await addDoc(collection(db, "categories"), categoryData)
    return docRef.id
  } catch (error) {
    console.error("Add category error:", error)
    throw error
  }
}

// Read: Get available categories
export const getCategories = async (userId: string, type?: "income" | "expense"): Promise<Category[]> => {
  try {
    let q = query(collection(db, "categories"), where("userId", "==", userId))

    if (type) {
      q = query(collection(db, "categories"), where("userId", "==", userId), where("type", "==", type))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Category[]
  } catch (error) {
    console.error("Get categories error:", error)
    throw error
  }
}

// Read: Get default categories (system-wide)
export const getDefaultCategories = async (type?: "income" | "expense"): Promise<Category[]> => {
  try {
    let q = query(collection(db, "categories"), where("isDefault", "==", true))

    if (type) {
      q = query(collection(db, "categories"), where("isDefault", "==", true), where("type", "==", type))
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Category[]
  } catch (error) {
    console.error("Get default categories error:", error)
    throw error
  }
}

// Update: Edit category name/icon
export const updateCategory = async (
  categoryId: string,
  updates: Partial<Omit<Category, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    await updateDoc(doc(db, "categories", categoryId), {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    })
  } catch (error) {
    console.error("Update category error:", error)
    throw error
  }
}

// Delete: Remove category
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "categories", categoryId))
  } catch (error) {
    console.error("Delete category error:", error)
    throw error
  }
}

// Initialize default categories for new user
export const initializeDefaultCategories = async (userId: string) => {
  try {
    const batch = writeBatch(db)
    const categoriesRef = collection(db, "categories")

    const defaultCategories: Omit<FirestoreCategory, "id">[] = [
      { 
        name: "Salary", 
        type: "income", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Investments", 
        type: "income", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Freelance", 
        type: "income", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Food", 
        type: "expense", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Transport", 
        type: "expense", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Utilities", 
        type: "expense", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Shopping", 
        type: "expense", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
      { 
        name: "Healthcare", 
        type: "expense", 
        userId,
        isDefault: true,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date())
      },
    ]

    for (const category of defaultCategories) {
      const docRef = doc(categoriesRef)
      batch.set(docRef, category)
    }

    await batch.commit()
  } catch (error) {
    console.error("Initialize default categories error:", error)
    throw error
  }
}
