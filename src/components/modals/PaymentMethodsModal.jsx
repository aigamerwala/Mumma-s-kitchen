import React from 'react'

const PaymentMethodsModal = ({ onClose, userId }) => {
  return (
    <div>
      <h2>Payment Methods</h2>
      {/* Fetch and display user's payment methods here */}
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default PaymentMethodsModal