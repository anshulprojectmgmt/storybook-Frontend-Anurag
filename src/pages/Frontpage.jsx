import { Link } from "react-router-dom";
import BooksList from "./BooksList";

function Frontpage() {
  const highlights = [
    {
      title: "Personalized Adventures",
      text: "Your child becomes the lead character in every page and scene.",
    },
    {
      title: "Fast to Create",
      text: "Build a complete custom storybook in just a few guided steps.",
    },
    {
      title: "Keepsake Quality",
      text: "Memorable artwork and storytelling families love to revisit.",
    },
  ];

  const premiumTags = [
    "Photo-to-Character Magic",
    "Guided 3-Step Creation",
    "Gift-Ready Story Design",
  ];

  return (
    <div className="min-h-screen w-full">
      <section className="relative w-full min-h-[92vh] px-6 py-20 overflow-hidden bg-[linear-gradient(130deg,#f7fbff_0%,#ecf6ff_45%,#f3f8ff_100%)]">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -left-24 w-[560px] h-[560px] rounded-full bg-cyan-300/35 blur-[150px] float-drift" />
          <div className="absolute top-10 right-0 w-[540px] h-[540px] rounded-full bg-blue-300/28 blur-[150px] float-drift-delayed" />
          <div className="absolute -bottom-36 left-1/3 w-[460px] h-[460px] rounded-full bg-sky-200/45 blur-[150px]" />
          <div className="absolute inset-0 hero-aurora" />
          <div className="absolute inset-0 hero-grid opacity-45" />
          <div className="absolute inset-0 hero-noise" />
        </div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <div className="relative reveal-up group">
            <div className="absolute -inset-6 rounded-[2.7rem] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(14,165,233,0.12),rgba(37,99,235,0.24),rgba(8,145,178,0.12),rgba(14,165,233,0.12))] blur-2xl" />
            <div className="absolute -inset-0.5 rounded-[2.4rem] border border-white/60 bg-white/35 backdrop-blur-xl shadow-[0_35px_95px_rgba(8,47,73,0.22)]" />

            <div className="relative rounded-[2.3rem] p-[2px] bg-gradient-to-br from-cyan-100 via-blue-300/85 to-blue-200">
              <div className="relative rounded-[2.2rem] overflow-hidden bg-gradient-to-br from-white to-sky-50">
                <img
                  src="/guidelines/Cinderella.png"
                  alt="Child storybook transformation preview"
                  className="w-full h-fit object-contain image-pan px-2 sm:px-3 transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(8,47,73,0.14)_0%,transparent_40%,rgba(34,211,238,0.14)_100%)]" />

                <div className="absolute left-5 right-5 bottom-5 rounded-2xl bg-white/82 backdrop-blur-lg px-5 py-4 border border-white/70 shadow-[0_10px_24px_rgba(15,23,42,0.16)]">
                  <p className="text-slate-800 font-semibold text-lg">
                    From a single photo to a magical character in minutes.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative reveal-up delay-150">
            <div className="absolute inset-0 rounded-[2.8rem] bg-sky-300/20 blur-2xl float-drift" />
            <div className="relative rounded-[2.5rem] bg-white/[0.82] backdrop-blur-2xl shadow-[0_30px_90px_rgba(15,23,42,0.16)] p-8 sm:p-12 border border-white/80">
              <div className="inline-flex items-center rounded-[1.7rem] bg-white/82 px-5 py-3 border border-white/80 shadow-[0_16px_38px_rgba(14,116,144,0.12)] mb-6">
                <p className="text-sm sm:text-base font-bold uppercase tracking-[0.26em] text-[#0b2559]">
                  Storybook Adventures
                </p>
              </div>
              <h1 className="text-4xl xl:text-6xl font-black text-[#08193f] mb-6 leading-[1.06]">
                Turn your child into the{" "}
                <span className="text-transparent bg-clip-text bg-[linear-gradient(120deg,#0c4a6e,#2563eb,#0891b2)]">
                  hero of every adventure
                </span>
                .
              </h1>
              <p className="text-lg xl:text-xl text-slate-700 mb-8 leading-relaxed">
                Upload a photo, choose a world, and craft a beautifully
                personalized storybook where imagination meets memory.
              </p>

              <div className="flex flex-wrap gap-2.5 mb-8">
                {premiumTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white/75 border border-sky-100 shadow-[0_6px_18px_rgba(14,116,144,0.08)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="space-y-5 mb-10">
                {highlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 items-start rounded-2xl p-3 bg-white/55 border border-white/70"
                  >
                    <span className="mt-1 h-3 w-3 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600 shadow-[0_0_20px_rgba(14,165,233,0.7)] shrink-0" />
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-slate-600">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/books"
                  className="relative overflow-hidden inline-flex items-center justify-center bg-[linear-gradient(115deg,#1d4ed8,#0284c7)] hover:bg-[linear-gradient(115deg,#1e40af,#0369a1)] text-white px-5 py-3.5 rounded-full text-center text-lg font-bold transition-all duration-300 hover:scale-[1.03] shadow-[0_14px_34px_rgba(30,64,175,0.38)] cta-shimmer"
                >
                  Create Your Storybook
                </Link>
                <a
                  href="#storybook-why"
                  className="inline-flex items-center justify-center px-5 py-3.5 rounded-full text-lg font-bold text-blue-900 bg-white/80 border border-white/90 hover:bg-white transition-colors text-center shadow-[0_8px_22px_rgba(14,116,144,0.1)]"
                >
                  Why Families Love It
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="storybook-why"
        className="relative py-16 sm:py-24 px-6 overflow-hidden bg-gradient-to-b from-sky-50 to-white"
      >
        <div className="absolute top-0 left-0 h-full w-full bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.16),transparent_45%),radial-gradient(circle_at_bottom_right,rgba(37,99,235,0.1),transparent_45%)]" />
        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="reveal-up">
            <h2 className="text-3xl sm:text-4xl font-black text-blue-950 leading-tight mb-5">
              A magical gift your child can read, hold, and remember.
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-6">
              StoryBook combines personal photos, beautiful illustrations, and
              heartwarming storylines to create books children feel proud of.
              Every page celebrates confidence, imagination, and family moments.
            </p>
            <p className="text-lg text-slate-700 leading-relaxed">
              Perfect for birthdays, milestones, and bedtime rituals, each
              storybook is designed to feel special from the first page to the
              final smile.
            </p>
          </div>
          <div className="reveal-up delay-150 rounded-3xl p-7 sm:p-9 bg-[#081736] text-blue-50 shadow-[0_20px_60px_rgba(8,23,54,0.45)] border border-blue-400/20">
            <h3 className="text-2xl sm:text-3xl font-black mb-6">
              What makes it extraordinary?
            </h3>
            <div className="space-y-5 text-base sm:text-lg">
              <p className="flex gap-3">
                <span className="text-cyan-300">01</span>
                <span>Every book is tailored to your child's identity.</span>
              </p>
              <p className="flex gap-3">
                <span className="text-cyan-300">02</span>
                <span>High-quality visuals crafted for lasting memories.</span>
              </p>
              <p className="flex gap-3">
                <span className="text-cyan-300">03</span>
                <span>Simple workflow with delightful final results.</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-b from-blue-50 via-blue-100 to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
        <div className="relative">
          <h2 className="text-4xl font-black text-center text-blue-900 pt-4 reveal-up">
            Explore Our Storybooks
          </h2>
          <p className="text-xl text-center text-blue-700 mt-4 mb-10 reveal-up delay-150">
            Pick a magical adventure for your child
          </p>

          <BooksList layout="horizontal" />
        </div>
      </section>
    </div>
  );
}

export default Frontpage;
