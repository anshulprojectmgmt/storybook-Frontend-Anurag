import BookCard from "../components/BookCard";
import { useEffect, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { apiUrl } from "../config/api";

function BooksList({ layout = "vertical" }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getBooks();
  }, []);

  const getBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/storybook"));
      setBooks(res.data);
      console.log(res.data);
    } catch (error) {
      console.log("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-center reveal-up">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin" />
          <h2 className="text-xl font-bold text-blue-900">Loading Books...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6">
      {layout === "vertical" && (
        <>
          <h1 className="text-5xl font-black text-center mb-4 text-blue-900 reveal-up">
            Books for Kids
          </h1>
          <p className="text-2xl text-blue-800 text-center mb-12 reveal-up delay-150">
            Choose a magical story for your little one
          </p>
        </>
      )}

      <div className="max-w-7xl mx-auto rounded-[2rem] p-3 sm:p-6 bg-white/50 backdrop-blur-xl border border-white/80 shadow-[0_16px_44px_rgba(37,99,235,0.12)]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((book, idx) => (
            <div
              key={book._id}
              className="min-w-auto md:min-w-auto flex-shrink-0"
              style={{ animationDelay: `${Math.min(idx * 90, 450)}ms` }}
            >
              <BookCard book={book} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

BooksList.propTypes = {
  layout: PropTypes.string,
};

export default BooksList;
