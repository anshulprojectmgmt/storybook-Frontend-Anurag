import { Link } from "react-router-dom";
import {
  ArrowUpTrayIcon,
  BookOpenIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import BooksList from "./BooksList";

const storybookWorkSteps = [
  {
    number: "1",
    title: "Pick Storybook",
    variant: "pick",
    accent: "bg-blue-100 text-blue-950",
  },
  {
    number: "2",
    title: "Add your Child's Picture",
    variant: "upload",
    accent: "bg-cyan-100 text-blue-950",
  },
  {
    number: "3",
    title: "Preview & Order",
    variant: "preview",
    accent: "bg-sky-100 text-blue-950",
  },
  {
    number: "4",
    title: "Your story is printed with care and delivered with joy.",
    variant: "delivery",
    accent: "bg-indigo-100 text-blue-950",
  },
];

function StorybookStepArt({ variant }) {
  if (variant === "pick") {
    return (
      <div className="relative flex h-full items-center justify-center">
        <div className="absolute inset-x-4 top-7 h-24 rounded-[2rem] bg-white/80 shadow-[0_16px_36px_rgba(30,64,175,0.12)]" />
        <div className="relative flex items-end justify-center gap-2">
          {["-rotate-6", "scale-110", "rotate-6"].map((tilt, index) => (
            <div
              key={tilt}
              className={`h-24 w-16 overflow-hidden rounded-xl border border-white/90 bg-white shadow-[0_10px_24px_rgba(30,64,175,0.18)] ${tilt}`}
            >
              <img
                src="/guidelines/Cinderella.png"
                alt={`Storybook cover option ${index + 1}`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
        <BookOpenIcon className="absolute bottom-6 right-8 h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (variant === "upload") {
    return (
      <div className="relative flex h-full items-center justify-center">
        <div className="absolute inset-x-5 top-8 h-28 rounded-[2rem] border-2 border-dashed border-blue-300 bg-white/82 shadow-[0_16px_36px_rgba(30,64,175,0.1)]" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-[0_12px_30px_rgba(30,64,175,0.18)]">
          <img
            src="/guidelines/Cinderella.png"
            alt="Child photo upload preview"
            className="h-20 w-20 rounded-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute left-8 top-12 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_12px_24px_rgba(37,99,235,0.28)]">
          <ArrowUpTrayIcon className="h-6 w-6" />
        </div>
      </div>
    );
  }

  if (variant === "preview") {
    return (
      <div className="relative flex h-full items-center justify-center">
        <div className="relative flex h-28 w-52 -rotate-3 overflow-hidden rounded-xl border border-blue-100 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.2)]">
          <div className="w-1/2 border-r border-blue-100 bg-sky-50 p-2">
            <img
              src="/guidelines/Cinderella.png"
              alt="Storybook page preview"
              className="h-full w-full rounded-lg object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex w-1/2 flex-col justify-center gap-2 bg-white p-3">
            <span className="h-2 rounded-full bg-blue-200" />
            <span className="h-2 rounded-full bg-sky-200" />
            <span className="h-2 w-2/3 rounded-full bg-blue-100" />
          </div>
        </div>
        <div className="absolute bottom-5 right-9 rounded-full bg-white px-3 py-1 text-xs font-black text-blue-700 shadow-[0_8px_20px_rgba(30,64,175,0.16)]">
          Ready
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-full items-center justify-center">
      <div className="relative h-28 w-44 rotate-[-7deg] overflow-hidden rounded-xl border border-white/90 bg-white shadow-[0_18px_38px_rgba(30,64,175,0.18)]">
        <img
          src="/guidelines/Cinderella.png"
          alt="Printed storybook"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="absolute bottom-5 right-7 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_14px_28px_rgba(37,99,235,0.3)]">
        <TruckIcon className="h-7 w-7" />
      </div>
    </div>
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

      <section
        id="how-storybook-works"
        className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-sky-50 px-4 py-16 sm:px-6 sm:py-20 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center reveal-up">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-blue-700">
              How it works
            </p>
            <h2 className="mt-4 text-3xl font-black leading-tight text-blue-950 sm:text-4xl">
              How Storybook Works
            </h2>
          </div>

          <ol className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-4 lg:gap-5">
            {storybookWorkSteps.map((step) => (
              <li
                key={step.number}
                className="relative flex flex-col items-center text-center lg:items-start lg:text-left"
              >
                <div className="relative h-48 w-full overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.94),rgba(224,242,254,0.78))] shadow-[0_18px_45px_rgba(30,64,175,0.14)]">
                  <StorybookStepArt variant={step.variant} />
                </div>

                <div className="mt-5 flex w-full items-center justify-center gap-4 lg:justify-start">
                  <span
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-xl font-black shadow-[0_10px_24px_rgba(30,64,175,0.12)] ${step.accent}`}
                  >
                    {step.number}
                  </span>
                  <h3 className="text-2xl font-black leading-tight text-slate-950">
                    {step.title}
                  </h3>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

export default Frontpage;
