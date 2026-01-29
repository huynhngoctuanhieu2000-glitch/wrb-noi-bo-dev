// File: src/services/user/checkUserEmail.ts
import { collection, query, where, getDocs, Firestore } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const checkUserEmail = async (email: string): Promise<boolean> => {
    try {
        if (!db) {
            console.error("Firebase chưa được khởi tạo!");
            return false;
        }

        // 🔴 SỬA Ở ĐÂY: Đổi "users" thành "orders"
        // Vì ảnh của bạn cho thấy dữ liệu nằm trong collection 'orders'
        const ordersRef = collection(db as Firestore, "orders");

        // Tìm xem trong bảng orders có đơn nào chứa email này không
        const q = query(ordersRef, where("email", "==", email));

        const querySnapshot = await getDocs(q);

        // Debug log để bạn yên tâm
        console.log(`🔎 Tìm trong 'orders' với email: ${email}`);
        console.log(`✅ Kết quả: tìm thấy ${querySnapshot.size} đơn hàng cũ.`);

        return !querySnapshot.empty;
    } catch (error) {
        console.error("Lỗi check email:", error);
        return false;
    }
};