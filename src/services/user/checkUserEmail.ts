// File: src/services/user/checkUserEmail.ts
import { collection, query, where, getDocs, orderBy, limit, Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

export interface CheckUserResult {
    exists: boolean;
    customer: {
        name: string;
        phone: string;
        email: string;
    } | null;
}

export const checkUserEmail = async (email: string): Promise<CheckUserResult> => {
    try {
        if (!db) {
            console.error("Firebase chưa được khởi tạo!");
            return { exists: false, customer: null };
        }

        const ordersRef = collection(db as Firestore, "orders");

        // Tìm đơn hàng gần nhất của email này để lấy thông tin mới nhất
        const q = query(
            ordersRef,
            where("email", "==", email),
            // orderBy("created_at", "desc"), // Cần composite index, tạm thời bỏ qua sort nếu chưa có index
            // limit(1) 
        );

        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // Lấy doc đầu tiên (hoặc logic sort JS nếu cần chính xác nhất)
            // Tạm thời lấy doc đầu tiên tìm thấy
            const docData = querySnapshot.docs[0].data();

            return {
                exists: true,
                customer: {
                    name: docData.cus_name || "",
                    phone: docData.phone || "",
                    email: docData.email || email
                }
            };
        }

        return { exists: false, customer: null };
    } catch (error) {
        console.error("Lỗi check email:", error);
        return { exists: false, customer: null };
    }
};