import { useState } from "react";
import img1 from "../assets/arivals-img/1-img.webp";
import img2 from "../assets/arivals-img/2-img.jpeg";
import img3 from "../assets/arivals-img/3-img.webp";
import img4 from "../assets/arivals-img/4-img.webp";
import img5 from "../assets/arivals-img/5-img.webp";
import img6 from "../assets/arivals-img/6-img.webp";
import img7 from "../assets/arivals-img/7-img.webp";
import img8 from "../assets/arivals-img/8-img.webp";
import img9 from "../assets/arivals-img/9-img.webp";

const booksData = [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", edition: "1st", category: "Fiction", image: img1 },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", edition: "2nd", category: "Classic", image: img2 },
  { id: 3, title: "1984", author: "George Orwell", edition: "3rd", category: "Dystopian", image: img3},
  { id: 4, title: "Moby Dick", author: "Herman Melville", edition: "1st", category: "Adventure", image: img4 },
  { id: 5, title: "War and Peace", author: "Leo Tolstoy", edition: "5th", category: "Historical", image: img5 },
  { id: 6, title: "Pride and Prejudice", author: "Jane Austen", edition: "4th", category: "Romance", image: img6 },
  { id: 7, title: "Hamlet", author: "William Shakespeare", edition: "3rd", category: "Drama", image: img7 },
  { id: 8, title: "The Hobbit", author: "J.R.R. Tolkien", edition: "1st", category: "Fantasy", image: img8 },
  { id: 9, title: "The Catcher in the Rye", author: "J.D. Salinger", edition: "2nd", category: "Classic", image: img9 },
];

const NewArrivals = () => {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-center text-blue-700">New Arrivals</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {booksData.map((book) => (
          <div key={book.id} className="p-4 bg-white shadow-lg rounded-lg flex flex-col items-center">
            <img src={book.image} alt={book.title} className="w-32 h-40 object-cover rounded-md mb-3" />
            <h3 className="text-lg font-semibold text-center">{book.title}</h3>
            <p className="text-gray-600 text-center">{book.author} | {book.edition} Edition</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default NewArrivals;
