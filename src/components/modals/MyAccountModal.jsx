import React from 'react'

const MyAccountModal = ({ onClose, userId }) => {
  return (
    <div>
      <h2>My Account</h2>
      {/* Fetch and display user's account information here */}
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default MyAccountModal