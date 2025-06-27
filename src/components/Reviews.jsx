import { useState } from "react";

function Testimonials() {
  const [reviews, setReviews] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ img: "", name: "", text: "" });

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    setReviews([...reviews, newReview]);
    setShowForm(false);
    setNewReview({ img: "", name: "", text: "" });
  };

  return (
    <div className="reviews-section p-6 ">
      <h2 className="text-2xl font-bold text-center mb-4">Testimonials</h2>
      <section className="reviews-grid grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((review, index) => (
          <div key={index} className="review-card p-4 border rounded-lg shadow-lg bg-white">
            <div className="person-img w-24 h-24 mx-auto mb-2">
              <img src={review.img} alt={review.name} className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="review-text text-center">
              <h3 className="text-lg font-semibold">{review.name}</h3>
              <p className="text-gray-600">"{review.text}"</p>
            </div>
          </div>
        ))}
      </section>
      <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition">Your Review</button>
      {showForm && (
        <div className="fixed inset-0 flex justify-center items-center bg-gray-900 bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-xl font-bold mb-4">Submit Your Review</h2>
            <form onSubmit={handleReviewSubmit} className="flex flex-col gap-3">
              <input type="file" accept="image/*" onChange={(e) => setNewReview({ ...newReview, img: URL.createObjectURL(e.target.files[0]) })} required className="border p-2 rounded" />
              <input type="text" placeholder="Your Name" value={newReview.name} onChange={(e) => setNewReview({ ...newReview, name: e.target.value })} required className="p-2 border rounded" />
              <textarea placeholder="Your Review" value={newReview.text} onChange={(e) => setNewReview({ ...newReview, text: e.target.value })} required className="p-2 border rounded resize-none"></textarea>
              <div className="flex justify-between">
                <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">Submit</button>
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Testimonials;

