"use server"

// Ini adalah jembatan untuk mengubah status pengiriman di Dashboard Admin
export const markOrderDeliveredAction = async (orderId: string) => {
  try {
    // Di sini Bos tinggal masukkan fungsi Medusa untuk Mark as Delivered / Complete Order.
    // Contoh untuk Medusa v2 (Tergantung arsitektur workflow admin Bos):
    // await sdk.admin.order.complete(orderId, { headers: { Authorization: `Bearer ${SECRET_API_KEY}` } });
    
    console.log(`✅ Pesanan ${orderId} resmi diubah menjadi Delivered di Admin Dashboard!`);
    return true;
  } catch (error) {
    console.error("Gagal mengupdate status pesanan:", error);
    return false;
  }
}