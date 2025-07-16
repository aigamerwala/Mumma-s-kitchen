import React from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function InvoiceTest() {
  const handleGenerate = () => {
    const doc = new jsPDF();

    doc.text("Invoice Example", 14, 20);

    // Ensure autoTable is available
    if (typeof doc.autoTable === "function") {
      doc.autoTable({
        startY: 30,
        head: [["Item", "Qty", "Price"]],
        body: [
          ["Pizza", "2", "₹200"],
          ["Burger", "1", "₹120"],
        ],
      });
    } else {
      console.error("autoTable is not a function");
    }

    doc.save("test-invoice.pdf");
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Test Invoice</h1>
      <button onClick={handleGenerate}>Generate</button>
    </div>
  );
}
// import React from 'react'

// const InvoiceTest = () => {
//   return (
//     <div>InvoiceTest</div>
//   )
// }

// export default InvoiceTest