import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    /* --- liên kết tới user --- */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',            // đúng tên collection (userModel)
      required: true
    },

    /* --- thông tin thanh toán --- */
    paymentIntentId: {        // ID từ Stripe (hoặc cổng khác)
      type: String,
      required: true,
      unique: true
    },
    amount: {                 // số tiền (đơn vị nhỏ nhất: cent, VND…)
      type: Number,
      required: true
    },
    currency: {               // “usd”, “vnd”…
      type: String,
      default: 'usd'
    },
    status: {                 // succeeded, pending, failed…
      type: String,
      required: true
    },

    /* --- metadata tùy ý --- */
    description: String,      // mô tả đơn hàng
    method: String,           // loại thẻ / ví
    extra: Object             // trường mở rộng
  },
  { timestamps: true }        // tự tạo createdAt, updatedAt
);

/* --- xuất model, tránh đăng ký trùng --- */

const paymentModel =  mongoose.models.payment || mongoose.model('payment', paymentSchema);
export default paymentModel