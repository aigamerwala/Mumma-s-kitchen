import React from 'react'

const SavedAddressesModal = ({ onClose, userId }) => {
  return (
    <div>
      <h2>Saved Addresses</h2>
      {/* Fetch and display user's saved addresses here */}
      <button onClick={onClose}>Close</button>
    </div>
  )
}

export default SavedAddressesModal