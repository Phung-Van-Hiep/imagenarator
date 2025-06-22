import userModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import jwt from 'jsonwebtoken'
import Stripe from 'stripe'
import paymentModel from "../models/paymentModel.js";

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({ success: false, message: 'Missing Details' })
        }
        const existingUser  = await userModel.findOne({ email })
        if(existingUser){
            return res.json({ success: false, message: 'Email already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const userData = {
            name,
            email,
            password: hashedPassword
        }

        const newUser = new userModel(userData)
        const user = await newUser.save()
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)

        res.json({ success: true, token, user: { name: user.name, } })
    }
    catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email })

        if (!user) {
            return res.json({ success: false, message: 'User does not exist' })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (isMatch) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET)
            res.json({ success: true, token, user: { name: user.name, } })
        } else {
            return res.json({ success: false, message: 'Invalid credentials' })
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

const userCredit =  async (req,res) =>{
    try {
        const userId = req.user.id; 
        const user = await userModel.findById(userId)
        res.json({success:true, credits:user.creditBalance, user:{
            name:user.name
        }})
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message})
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET);

/* ---------- hàm payment / createPaymentIntent ---------- */
const createPaymentIntent = async (req, res) => {
  try {
    const userId = req.user.id;                    // lấy từ middleware
    const { amount, currency = 'usd', credits } = req.body;
    const user = await userModel.findById(userId)

    if (!amount || amount <= 0 || !credits || credits <= 0) {
      return res.json({ success: false, message: 'Error amount' });
    }

    /* 1. Tạo PaymentIntent */
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { userId, credits }                // lưu kèm để webhook dùng
    });

    /* 2. Lưu bản ghi Payment ở trạng thái pending */
    await paymentModel.create({
      user: userId,
      paymentIntentId: paymentIntent.id,
      amount,
      currency,
      status: paymentIntent.status,                // thường = "requires_payment_method"
      description: `Mua ${credits} credit`
    });

    /* 3. Gửi clientSecret cho FE */
    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      balance:user.creditBalance
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export {registerUser, loginUser, userCredit, createPaymentIntent}