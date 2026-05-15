import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { getStorybookEventParams, trackMetaEvent } from "../utils/metaPixel";

function BookCard({ book }) {
  const navigate = useNavigate();

  const openForm = () => {
    trackMetaEvent(
      "ViewContent",
      getStorybookEventParams({
        bookId: book._id,
        bookTitle: book.title,
        category: book.age_group
          ? `Personalized Storybook - Ages ${book.age_group}`
          : "Personalized Storybook",
      }),
    );

    navigate(
      `/details?book_id=${book._id}&page_count=${book.page_count}&min_photos=${book.min_required_photos}&age_group=${
        book.age_group
      }&gender=${book.gender}`,
    );
  };

  const genderBadgeClass =
    book.gender === "boy"
      ? "bg-blue-600 text-white"
      : book.gender === "girl"
        ? "bg-pink-500 text-white"
        : "bg-amber-300 text-slate-900";

  const genderLabel =
    book.gender === "boy"
      ? "For Boys"
      : book.gender === "girl"
        ? "For Girls"
        : "Unisex";

  return (
    <div className="group relative flex flex-col h-full rounded-3xl overflow-hidden border border-white/80 bg-white/[0.88] backdrop-blur-md shadow-[0_18px_45px_rgba(15,23,42,0.14)] hover:shadow-[0_28px_65px_rgba(30,64,175,0.3)] hover:-translate-y-1.5 transition-all duration-500 reveal-up">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.26),transparent_36%)]" />
      <div className="pointer-events-none absolute -left-[130%] top-0 h-full w-[65%] card-shine group-hover:animate-card-shine" />

      <div className="relative h-[220px] overflow-hidden">
        <img
          src={book.cover_photo}
          alt={book.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/45 via-transparent to-transparent" />

        <div
          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow ${genderBadgeClass}`}
        >
          {genderLabel}
        </div>
      </div>

      <div className="relative p-5 flex flex-col flex-1">
        <span className="inline-flex items-center gap-2 mb-3 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold w-fit">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          Ages {book.age_group}
        </span>

        <h3 className="text-xl font-black text-slate-800 mb-2 line-clamp-2">
          {book.title}
        </h3>

        <p className="text-sm text-slate-600 mb-5 line-clamp-3">
          {book.description}
        </p>

        <div className="mt-auto pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={openForm}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.01] cursor-pointer"
          >
            Personalize
          </button>
        </div>
      </div>
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    cover_photo: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    gender: PropTypes.string.isRequired,
    age_group: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    page_count: PropTypes.number.isRequired,
    min_required_photos: PropTypes.number.isRequired,
  }).isRequired,
};

export default BookCard;
