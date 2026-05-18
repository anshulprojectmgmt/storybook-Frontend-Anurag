import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  ArrowUpTrayIcon,
  BookOpenIcon,
  CheckCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import BooksList from "./BooksList";
import { apiUrl } from "../config/api";

const featuredStorybookFallbacks = [
  {
    title: "The Ribbon Of Kindness",
    cover_photo:
      "https://kids-storybooks.s3.ap-south-1.amazonaws.com/original_images/ribbon_book.jpg",
  },
  {
    title: "Future Deciding Stone",
    cover_photo:
      "https://kids-storybooks.s3.ap-south-1.amazonaws.com/storybook_cover_photo/future_deciding_stone.jpg",
  },
  {
    title: "Time Machine",
    cover_photo:
      "https://kids-storybooks.s3.ap-south-1.amazonaws.com/storybook_cover_photo/time+machine.jpg",
  },
];

function useFeaturedStorybooks() {
  const [books, setBooks] = useState(featuredStorybookFallbacks);

  useEffect(() => {
    let isMounted = true;

    async function getBooks() {
      try {
        const response = await axios.get(apiUrl("/api/storybook"));
        const liveBooks = Array.isArray(response.data)
          ? response.data
          : response.data?.value;
        const selectedBooks = Array.isArray(liveBooks)
          ? liveBooks.slice(0, 3).filter((book) => book?.cover_photo)
          : [];

        if (isMounted && selectedBooks.length === 3) {
          setBooks(selectedBooks);
        }
      } catch (error) {
        console.log("Error fetching storybooks for how it works:", error);
      }
    }

    getBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  return books;
}

function StepShell({ number, title, accent, children }) {
  return (
    <li className="relative flex flex-col">
      <div className="relative min-h-[250px] overflow-hidden rounded-[1.75rem] border border-white/90 bg-white/82 px-5 py-6 shadow-[0_20px_52px_rgba(30,64,175,0.13)] sm:min-h-[280px] sm:px-6">
        <div className="pointer-events-none absolute inset-x-6 top-6 h-4 rounded-full bg-white/80 blur-sm" />
        {children}
      </div>

      <div className="mt-5 flex items-center gap-4">
        <span
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-[0_10px_24px_rgba(30,64,175,0.14)] ${accent}`}
        >
          {number}
        </span>
        <h3 className="text-2xl font-black leading-tight text-slate-950 sm:text-[1.65rem]">
          {title}
        </h3>
      </div>
    </li>
  );
}

function PickStorybookArt({ books }) {
  const coverTilt = ["-rotate-6", "scale-110", "rotate-5"];

  return (
    <div className="relative flex h-full min-h-[210px] items-center justify-center">
      <div className="absolute left-1/2 top-1/2 h-40 w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-[2rem] bg-sky-50 shadow-[inset_0_0_0_1px_rgba(125,211,252,0.28)]" />
      <div className="relative flex w-full items-end justify-center gap-2 sm:gap-3">
        {books.map((book, index) => (
          <div
            key={`${book.title}-${book.cover_photo}`}
            className={`relative h-36 w-[31%] max-w-[92px] overflow-hidden rounded-xl border-2 border-white bg-white shadow-[0_14px_26px_rgba(15,23,42,0.2)] ${coverTilt[index]}`}
          >
            <img
              src={book.cover_photo}
              alt={`${book.title} storybook cover`}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/78 to-transparent px-2 pb-2 pt-7">
              <p className="line-clamp-2 text-center text-[10px] font-black leading-tight text-white">
                {book.title}
              </p>
            </div>
          </div>
        ))}
      </div>
      <BookOpenIcon className="absolute bottom-3 right-3 h-9 w-9 rounded-full bg-white p-1.5 text-blue-600 shadow-[0_10px_22px_rgba(37,99,235,0.18)]" />
    </div>
  );
}

function UploadPictureArt() {
  return (
    <div className="relative flex h-full min-h-[210px] items-center justify-center">
      <div className="relative flex h-36 w-full max-w-[260px] items-center justify-between rounded-[1.75rem] border-2 border-dashed border-violet-300 bg-white px-6 shadow-[0_18px_34px_rgba(91,33,182,0.12)]">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 text-violet-700">
          <ArrowUpTrayIcon className="h-8 w-8" />
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5" aria-hidden="true">
          <span className="h-2.5 rounded-full bg-violet-100" />
          <span className="h-2.5 rounded-full bg-sky-100" />
          <span className="h-2.5 w-2/3 rounded-full bg-pink-100" />
        </div>
        <div className="absolute -right-2 top-1/2 h-32 w-32 -translate-y-1/2 border-[7px] border-white bg-white shadow-[0_16px_32px_rgba(15,23,42,0.2)]">
          <img
            src="/guidelines/upload-child-face.jpg"
            alt="Uploaded child face preview"
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}

function PreviewOrderArt() {
  return (
    <div className="relative flex h-full min-h-[210px] items-center justify-center">
      <div className="relative w-full max-w-[275px] -rotate-2 rounded-[1.5rem] bg-white p-3 shadow-[0_18px_34px_rgba(15,23,42,0.18)]">
        <div className="grid grid-cols-2 gap-2 rounded-[1.1rem] border border-sky-100 bg-sky-50 p-2">
          <div className="overflow-hidden rounded-xl bg-white">
            <img
              src="/guidelines/Cinderella.png"
              alt="Cinderella storybook page preview"
              className="aspect-[4/5] h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col justify-center rounded-xl bg-white px-3 py-4">
            <span className="mb-3 inline-flex w-fit rounded-full bg-green-100 px-2 py-1 text-[10px] font-black text-green-700">
              Ready
            </span>
            <span className="mb-2 h-2.5 rounded-full bg-blue-100" />
            <span className="mb-2 h-2.5 rounded-full bg-sky-100" />
            <span className="h-2.5 w-2/3 rounded-full bg-rose-100" />
          </div>
        </div>
        <p className="mt-3 px-1 text-center text-sm font-black leading-snug text-slate-800">
          Your child becomes the hero of a magical adventure.
        </p>
      </div>
    </div>
  );
}

function DeliveryArt() {
  return (
    <div className="relative flex h-full min-h-[210px] items-center justify-center">
      <div
        className="relative h-40 w-52 transform-gpu sm:h-44 sm:w-56"
        style={{
          transform: "perspective(760px) rotateY(-14deg) rotateZ(-5deg)",
        }}
      >
        <div className="absolute left-5 top-5 h-[88%] w-[88%] rounded-[1.1rem] bg-slate-200 shadow-[12px_18px_28px_rgba(15,23,42,0.18)]" />
        <div className="absolute left-3 top-3 h-[88%] w-[88%] rounded-[1.1rem] border border-slate-200 bg-white shadow-[0_14px_22px_rgba(15,23,42,0.16)]">
          <span className="absolute bottom-4 right-3 h-[70%] w-1 rounded-full bg-slate-200" />
          <span className="absolute bottom-4 right-7 h-[70%] w-1 rounded-full bg-slate-200" />
          <span className="absolute bottom-4 right-11 h-[70%] w-1 rounded-full bg-slate-200" />
        </div>
        <div className="absolute inset-0 overflow-hidden rounded-[1.15rem] border-[5px] border-white bg-white shadow-[0_22px_38px_rgba(15,23,42,0.26)]">
          <div className="absolute left-0 top-0 z-10 h-full w-4 bg-gradient-to-r from-slate-950/35 via-white/20 to-transparent" />
          <img
            src="/guidelines/Cinderella.png"
            alt="Printed Cinderella personalized storybook cover"
            className="h-full w-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/82 to-transparent px-3 pb-3 pt-10">
            <p className="text-sm font-black leading-tight text-white">
              Cinderella
            </p>
            <p className="text-[11px] font-bold leading-tight text-white/85">
              Printed book
            </p>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.32)]">
        <TruckIcon className="h-8 w-8" />
      </div>
      <CheckCircleIcon className="absolute left-5 top-6 h-9 w-9 rounded-full bg-white text-emerald-500 shadow-[0_10px_22px_rgba(15,23,42,0.12)]" />
    </div>
  );
}

function HowStorybookWorksSection() {
  const books = useFeaturedStorybooks();

  return (
    <section
      id="how-storybook-works"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#eff7ff_0%,#ffffff_46%,#eef9ff_100%)] px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center reveal-up">
          <h2 className="text-sm font-black uppercase tracking-[0.28em] text-blue-700">
            HOW IT WORKS
          </h2>
        </div>

        <ol className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          <StepShell
            number="1"
            title="Pick Storybook"
            accent="bg-sky-100 text-blue-950"
          >
            <PickStorybookArt books={books} />
          </StepShell>

          <StepShell
            number="2"
            title="Add your Child's Picture"
            accent="bg-violet-100 text-violet-950"
          >
            <UploadPictureArt />
          </StepShell>

          <StepShell
            number="3"
            title="Preview & Order"
            accent="bg-rose-100 text-rose-950"
          >
            <PreviewOrderArt />
          </StepShell>

          <StepShell
            number="4"
            title="Your story is printed with care and delivered with joy."
            accent="bg-sky-100 text-blue-950"
          >
            <DeliveryArt />
          </StepShell>
        </ol>
      </div>
    </section>
  );
}

function Frontpage() {
  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[linear-gradient(130deg,#f7fbff_0%,#ecf6ff_45%,#f3f8ff_100%)]">
      <section className="px-4 pb-6 pt-6 sm:px-6 lg:px-8 lg:pt-8">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[34px] border border-white/75 bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(236,246,255,0.94)_48%,rgba(224,242,254,0.9))] p-3 shadow-[0_28px_70px_rgba(30,64,175,0.16)] sm:p-4 reveal-up">
          <div className="overflow-hidden rounded-[28px] border border-white/80 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(239,248,255,0.94)_55%,rgba(232,244,255,0.9))] lg:mx-auto lg:flex lg:aspect-[4/3] lg:max-w-5xl lg:items-center lg:justify-center lg:rounded-[32px]">
            <img
              src="/guidelines/Cinderella.png"
              alt="Child storybook transformation preview"
              className="aspect-[1.02/1] w-full object-contain object-center px-2 sm:aspect-[1.55/1] sm:px-4 lg:h-full lg:aspect-auto lg:px-8"
              loading="eager"
            />
          </div>

          <div className="mx-auto max-w-4xl px-2 pb-9 pt-8 text-center sm:px-5 sm:pb-12 sm:pt-10 lg:px-7 lg:pb-14 lg:pt-12">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-[#0b2559] sm:text-base">
              Storybook Adventures
            </p>

            <h1 className="mx-auto mt-4 max-w-3xl text-4xl font-black leading-[1.05] text-[#08193f] sm:text-5xl lg:text-[4rem]">
              Surprise your child by making them the main character in their
              very own storybook
            </h1>

            <div className="mt-8 flex items-center justify-center">
              <Link
                to="/books"
                className="relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(115deg,#1d4ed8,#0284c7)] px-6 py-3.5 text-center text-lg font-bold text-white shadow-[0_14px_34px_rgba(30,64,175,0.34)] transition-all duration-300 hover:scale-[1.02] hover:bg-[linear-gradient(115deg,#1e40af,#0369a1)] sm:w-auto sm:min-w-[220px] cta-shimmer"
              >
                Create Your Storybooks
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="explore-storybooks"
        className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="relative mx-auto max-w-7xl">
          <h2 className="text-center text-4xl font-black text-blue-950 reveal-up">
            Explore Our Storybooks
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-lg font-bold text-blue-700 reveal-up delay-150 sm:text-xl">
            Pick a magical adventure for your child
          </p>

          <div className="mt-8">
            <BooksList layout="horizontal" />
          </div>
        </div>
      </section>

      <HowStorybookWorksSection />
    </div>
  );
}

export default Frontpage;
