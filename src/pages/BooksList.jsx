import BookCard from "../components/BookCard";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import { apiUrl } from "../config/api";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";

function BooksList({ layout = "vertical" }) {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const carouselRef = useRef(null);
  const scrollFrameRef = useRef(0);
  const [activeBookIndex, setActiveBookIndex] = useState(0);
  const isCarousel = layout === "horizontal" || layout === "carousel";

  useEffect(() => {
    getBooks();
  }, []);

  useEffect(() => {
    return () => {
      if (scrollFrameRef.current) {
        window.cancelAnimationFrame(scrollFrameRef.current);
      }
    };
  }, []);

  const getBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(apiUrl("/api/storybook"));
      setBooks(res.data);
    } catch (error) {
      console.log("Error fetching books:", error);
    } finally {
      setLoading(false);
    }
  };

  const scrollToBook = (targetIndex) => {
    if (books.length === 0) {
      return;
    }

    const nextIndex = (targetIndex + books.length) % books.length;
    const carousel = carouselRef.current;
    const targetSlide = carousel?.children[nextIndex];

    setActiveBookIndex(nextIndex);
    targetSlide?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const handleCarouselScroll = () => {
    const carousel = carouselRef.current;

    if (!carousel || books.length <= 1) {
      return;
    }

    if (scrollFrameRef.current) {
      window.cancelAnimationFrame(scrollFrameRef.current);
    }

    scrollFrameRef.current = window.requestAnimationFrame(() => {
      const firstSlide = carousel.firstElementChild;
      const slideWidth =
        firstSlide?.getBoundingClientRect().width || carousel.clientWidth;
      const gap =
        Number.parseFloat(window.getComputedStyle(carousel).columnGap || "0") ||
        0;
      const nextIndex = Math.round(
        carousel.scrollLeft / Math.max(1, slideWidth + gap),
      );

      setActiveBookIndex(Math.min(books.length - 1, Math.max(0, nextIndex)));
    });
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

  if (!loading && books.length === 0) {
    return (
      <div className={isCarousel ? "px-0 py-4" : "px-4 py-12 sm:px-6"}>
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/80 bg-white/85 px-6 py-10 text-center shadow-[0_16px_44px_rgba(37,99,235,0.12)]">
          <h3 className="text-2xl font-black text-blue-950">
            Storybooks are being prepared.
          </h3>
          <p className="mt-3 text-base font-semibold text-slate-600">
            Please check again in a moment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={isCarousel ? "px-0 py-0" : "py-12 px-4 sm:px-6"}>
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

      <div
        className={`mx-auto rounded-[2rem] border border-white/80 bg-white/50 shadow-[0_16px_44px_rgba(37,99,235,0.12)] backdrop-blur-xl ${
          isCarousel ? "max-w-5xl p-3 sm:p-5" : "max-w-7xl p-3 sm:p-6"
        }`}
      >
        {isCarousel ? (
          <div className="relative">
            <div
              ref={carouselRef}
              onScroll={handleCarouselScroll}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-5"
              aria-label="Storybook selection"
            >
              {books.map((book, idx) => (
                <div
                  key={book._id}
                  className="min-w-full snap-start sm:min-w-[calc(50%_-_0.625rem)]"
                  style={{ animationDelay: `${Math.min(idx * 90, 450)}ms` }}
                  aria-label={`${idx + 1} of ${books.length}`}
                >
                  <BookCard book={book} />
                </div>
              ))}
            </div>

            {books.length > 1 && (
              <div className="mt-4 flex items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() => scrollToBook(activeBookIndex - 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/85 bg-white text-blue-950 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                  aria-label="Previous storybook"
                  title="Previous storybook"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                  {books.map((book, index) => (
                    <button
                      key={book._id}
                      type="button"
                      onClick={() => scrollToBook(index)}
                      aria-label={`Show storybook ${index + 1}`}
                      aria-pressed={index === activeBookIndex}
                      className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-white ${
                        index === activeBookIndex
                          ? "w-7 bg-blue-600"
                          : "w-2.5 bg-blue-200"
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => scrollToBook(activeBookIndex + 1)}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/85 bg-white text-blue-950 shadow-[0_12px_28px_rgba(15,23,42,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-white"
                  aria-label="Next storybook"
                  title="Next storybook"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ) : (
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
        )}
      </div>
    </div>
  );
}

BooksList.propTypes = {
  layout: PropTypes.string,
};

export default BooksList;
