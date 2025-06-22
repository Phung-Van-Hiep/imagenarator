import React, { useContext, useState } from 'react'
import { assets, plans } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { motion } from 'framer-motion'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { toast } from 'react-toastify';
import { useEffect } from 'react'
const BuyCredit = () => {
  const { user, purchaseCredit, loadCreditData  } = useContext(AppContext)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async (plan) => {
    if (!user) {
      toast.error('Please login to purchase credits!!!')
      return
    }

    setLoading(true)
    const clientSecret = await purchaseCredit(plan.price * 100, plan.credits) // amount tính bằng cent
    setLoading(false)

    if (!clientSecret) return
    setSelectedPlan({ ...plan, clientSecret })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    const { paymentIntent, error } = await stripe.confirmCardPayment(
      selectedPlan.clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)
        }
      }
    )
    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    if (paymentIntent.status === 'succeeded') {
      toast.success('Payment successful!')
      setSelectedPlan(null)
      console.log('✅ PaymentIntent:', paymentIntent)
      // reload credit
      if (typeof loadCreditData  === 'function') 
        setTimeout(() => loadCreditData(), 1500);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0.2, y: 100 }}
      transition={{ duration: 1 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className='min-h-[80vh] text-center pt-14 mb-10'>
      <button className='border border-gray-400 px-10 py-2
      rounded-full mb-6'>Our Plans</button>
      <h1 className='text-center text-3xl font-medium mb-6 sm:mb-10
      '>Choose the plan</h1>
      <div className='flex flex-wrap justify-center gap-6 text-left'>
        {plans.map((item, index) => (
          <div key={index}
            className='bg-white drop-shadow-sm border rounded-lg
          py-12 px-8 text-gray-600 hover:scale-105 transition-all duration-500'
          >
            <img width={40} src={assets.logo_icon} alt="" />
            <p className='mt-3 mb-1 font-semibold'>{item.id}</p>
            <p className='text-sm'>{item.desc}</p>
            <p className='mt-6'>
              <span className='text-3xl font-medium'>${item.price}</span>/{item.credits} credits</p>
            <button onClick={() => handlePurchase(item)} className='bg-gray-800 text-white mt-8 text-sm rounded-md w-full min-w-52 py-2.5 cursor-pointer'>
              {user ? 'Purchase' : 'Get Started'}</button>
          </div>
        ))}
      </div>
      {selectedPlan && (
        <form
          onSubmit={handleSubmit}
          className='bg-white border p-8 rounded-xl shadow-lg max-w-md mx-auto mt-16 text-left'
        >
          <h2 className='text-xl font-semibold mb-4'>Pay with Card</h2>
          <CardElement className='p-3 border rounded-md mb-6' />
          <button
            type='submit'
            className='bg-black text-white w-full py-2 rounded-md disabled:opacity-50'
            disabled={!stripe || loading}
          >
            {loading ? 'Processing…' : `Pay $${selectedPlan.price}`}
          </button>
        </form>
      )}
    </motion.div>
  )
}

export default BuyCredit
