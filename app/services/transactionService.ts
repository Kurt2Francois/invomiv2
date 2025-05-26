import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore"
import { db } from "../../firebase/config"

export interface Transaction {
  id?: string
  userId: string
  type: "income" | "expense"
  amount: number
  title: string
  category: string
  note?: string
  date: Date
  createdAt: Date
  updatedAt: Date
}

// 🔹 EXPENSES & INCOME CRUD FUNCTIONS

// Create: Add transaction (expense or income)
export const addTransaction = async (
  transaction: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
): Promise<string> => {
  try {
    const transactionData = {
      ...transaction,
      date: Timestamp.fromDate(transaction.date),
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    }

    const docRef = await addDoc(collection(db, "transactions"), transactionData)
    return docRef.id
  } catch (error) {
    console.error("Add transaction error:", error)
    throw error
  }
}

// Read: Fetch transactions with filters
export const getTransactions = async (
  userId: string,
  type?: "income" | "expense",
  limitCount = 50,
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      orderBy("date", "desc"),
      limit(limitCount),
    )

    if (type) {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("type", "==", type),
        orderBy("date", "desc"),
        limit(limitCount),
      )
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Transaction[]
  } catch (error) {
    console.error("Get transactions error:", error)
    throw error
  }
}

// Read: Fetch transactions by date range
export const getTransactionsByDateRange = async (
  userId: string,
  startDate: Date,
  endDate: Date,
  type?: "income" | "expense",
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("date", ">=", Timestamp.fromDate(startDate)),
      where("date", "<=", Timestamp.fromDate(endDate)),
      orderBy("date", "desc"),
    )

    if (type) {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("type", "==", type),
        where("date", ">=", Timestamp.fromDate(startDate)),
        where("date", "<=", Timestamp.fromDate(endDate)),
        orderBy("date", "desc"),
      )
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Transaction[]
  } catch (error) {
    console.error("Get transactions by date range error:", error)
    throw error
  }
}

// Read: Get single transaction
export const getTransaction = async (transactionId: string): Promise<Transaction | null> => {
  try {
    const docSnap = await getDoc(doc(db, "transactions", transactionId))
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
        date: docSnap.data().date.toDate(),
        createdAt: docSnap.data().createdAt.toDate(),
        updatedAt: docSnap.data().updatedAt.toDate(),
      } as Transaction
    }
    return null
  } catch (error) {
    console.error("Get transaction error:", error)
    throw error
  }
}

// Update: Edit transaction
export const updateTransaction = async (id: string, data: Partial<Transaction>): Promise<void> => {
  const transactionRef = doc(db, "transactions", id)
  await updateDoc(transactionRef, {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  })
}

// Delete: Remove transaction
export const deleteTransaction = async (id: string): Promise<void> => {
  const transactionRef = doc(db, "transactions", id)
  await deleteDoc(transactionRef)
}

// Get transactions by category
export const getTransactionsByCategory = async (
  userId: string,
  category: string,
  type?: "income" | "expense",
): Promise<Transaction[]> => {
  try {
    let q = query(
      collection(db, "transactions"),
      where("userId", "==", userId),
      where("category", "==", category),
      orderBy("date", "desc"),
    )

    if (type) {
      q = query(
        collection(db, "transactions"),
        where("userId", "==", userId),
        where("category", "==", category),
        where("type", "==", type),
        orderBy("date", "desc"),
      )
    }

    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      createdAt: doc.data().createdAt.toDate(),
      updatedAt: doc.data().updatedAt.toDate(),
    })) as Transaction[]
  } catch (error) {
    console.error("Get transactions by category error:", error)
    throw error
  }
}
