import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc,
  doc,
  query, 
  where, 
  updateDoc, 
  deleteDoc, 
  Timestamp 
} from "firebase/firestore"
import { db } from "../../firebase/config"
import type { Budget, FirestoreBudget } from "../../types"

// 🔹 BUDGETS CRUD FUNCTIONS

// Create: Set a budget
export const addBudget = async (budget: Omit<Budget, "id" | "spent" | "createdAt" | "updatedAt">): Promise<string> => {
  try {
    const budgetData = {
      ...budget,
      spent: 0,
      startDate: Timestamp.fromDate(budget.startDate),
      endDate: Timestamp.fromDate(budget.endDate),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    }

    const docRef = await addDoc(collection(db, "budgets"), budgetData)
    return docRef.id
  } catch (error) {
    console.error("Add budget error:", error)
    throw error
  }
}

// Read: View active budgets
export const getBudgets = async (userId: string): Promise<Budget[]> => {
  try {
    const q = query(collection(db, "budgets"), where("userId", "==", userId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      startDate: doc.data().startDate.toDate(),
      endDate: doc.data().endDate.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate()
    })) as Budget[]
  } catch (error) {
    console.error("Get budgets error:", error)
    throw error
  }
}

// Read: Get single budget
export const getBudget = async (budgetId: string): Promise<Budget | null> => {
  try {
    const docSnap = await getDoc(doc(db, "budgets", budgetId))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        startDate: docSnap.data().startDate.toDate(),
        endDate: docSnap.data().endDate.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Budget
    }
    return null
  } catch (error) {
    console.error("Get budget error:", error)
    throw error
  }
}

// Read: Get budget by category
export const getBudgetByCategory = async (userId: string, category: string): Promise<Budget | null> => {
  try {
    const budgetRef = doc(db, "budgets", category)
    const budgetSnap = await getDoc(budgetRef)
    
    if (!budgetSnap.exists()) return null
    
    const data = budgetSnap.data()
    return {
      id: budgetSnap.id,
      ...data,
      startDate: data.startDate.toDate(),
      endDate: data.endDate.toDate(),
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate()
    } as Budget
  } catch (error) {
    console.error("Get budget error:", error)
    throw error
  }
}

// Update: Adjust budget limit
export const updateBudget = async (
  budgetId: string,
  updates: Partial<Omit<Budget, "id" | "createdAt" | "updatedAt">>,
): Promise<void> => {
  try {
    const updateData: any = {
      ...updates,
      updatedAt: Timestamp.fromDate(new Date()),
    }

    if (updates.startDate) {
      updateData.startDate = Timestamp.fromDate(updates.startDate)
    }
    if (updates.endDate) {
      updateData.endDate = Timestamp.fromDate(updates.endDate)
    }

    await updateDoc(doc(db, "budgets", budgetId), updateData)
  } catch (error) {
    console.error("Update budget error:", error)
    throw error
  }
}

// Update: Update spent amount
export const updateBudgetSpent = async (budgetId: string, spent: number): Promise<void> => {
  try {
    const budgetRef = doc(db, "budgets", budgetId)
    await updateDoc(budgetRef, { 
      spent,
      updatedAt: Timestamp.fromDate(new Date())
    })
  } catch (error) {
    console.error("Update budget error:", error)
    throw error
  }
}

// Delete: Remove budget
export const deleteBudget = async (budgetId: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "budgets", budgetId))
  } catch (error) {
    console.error("Delete budget error:", error)
    throw error
  }
}

// Create monthly budget
export const createMonthlyBudget = async (userId: string, category: string, amount: number): Promise<string> => {
  try {
    const now = new Date()
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)

    return await addBudget({
      userId,
      category,
      amount,
      period: "monthly",
      startDate,
      endDate,
      isActive: true,
    })
  } catch (error) {
    console.error("Create monthly budget error:", error)
    throw error
  }
}

export type { Budget }
