import express from "express"
import {registerUser, loginUser, userCredit, createPaymentIntent} from "../controllers/userController.js"
import userAuth from "../middleware/auth.js"

const userRouter = express.Router()

userRouter.post('/register', registerUser)
userRouter.post('/login', loginUser)
userRouter.get('/credits',userAuth,userCredit)
userRouter.post('/payment-intent', userAuth, createPaymentIntent);

export default userRouter