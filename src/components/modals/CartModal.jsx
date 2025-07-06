import React from 'react'

const CartModal = ({ onClose, userId }) => {
  return (
    <div>
      <h2>Shopping Cart</h2>
      {/* Fetch and display user's cart items here */}
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default CartModal