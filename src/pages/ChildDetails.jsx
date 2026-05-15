import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useChildStore from "../store/childStore";
import {
  UserCircleIcon,
  CalendarIcon,
  CakeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { getStorybookEventParams, trackMetaEvent } from "../utils/metaPixel";

const getParsedAgeGroup = (value) => {
  if (!value) {
    return { min: null, max: null };
  }

  const normalized = value.toLowerCase().trim();
  const matchedNumbers = normalized.match(/\d+/g);
  const numbers = matchedNumbers ? matchedNumbers.map(Number) : [];

  if (numbers.length === 0) {
    return { min: null, max: null };
  }

  if (
    normalized.includes("+") ||
    normalized.includes("and up") ||
    normalized.includes("or more") ||
    normalized.includes("above")
  ) {
    return { min: numbers[0], max: null };
  }

  if (
    normalized.includes("under") ||
    normalized.includes("below") ||
    normalized.includes("up to")
  ) {
    return { min: null, max: numbers[0] };
  }

  if (numbers.length >= 2) {
    return {
      min: Math.min(numbers[0], numbers[1]),
      max: Math.max(numbers[0], numbers[1]),
    };
  }

  return { min: numbers[0], max: numbers[0] };
};

const getAgeRangeLabel = (min, max, fallback) => {
  if (min !== null && max !== null) {
    if (min === max) {
      return `${min} year${min === 1 ? "" : "s"}`;
    }
    return `${min}-${max} years`;
  }

  if (min !== null) {
    return `${min}+ years`;
  }

  if (max !== null) {
    return `up to ${max} years`;
  }

  return fallback || "selected age group";
};

const normalizeGender = (value) => (value || "").toLowerCase().trim();

const getGenderLabel = (value) => {
  const normalizedGender = normalizeGender(value);

  if (normalizedGender === "boy") {
    return "Boys";
  }

  if (normalizedGender === "girl") {
    return "Girls";
  }

  if (normalizedGender === "unisex") {
    return "Boys & Girls";
  }

  return "Any Gender";
};

function ChildDetails() {
  const navigate = useNavigate();
  const setChildName = useChildStore((state) => state.setChildName);
  const [formData, setFormData] = useState({
    name: "",
    gender: "",
    age: "",
    birthMonth: "",
  });

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const book_id = queryParams.get("book_id");
  const page_count = queryParams.get("page_count");
  const min_photos = queryParams.get("min_photos");
  const age_group = queryParams.get("age_group");
  const bookGender = normalizeGender(queryParams.get("gender"));
  const hasGenderRestriction = bookGender === "boy" || bookGender === "girl";
  const bookGenderLabel = getGenderLabel(bookGender);
  const [ageError, setAgeError] = useState("");
  const [genderError, setGenderError] = useState("");
  const parsedAgeGroup = useMemo(
    () => getParsedAgeGroup(age_group),
    [age_group],
  );
  const ageRangeLabel = useMemo(
    () => getAgeRangeLabel(parsedAgeGroup.min, parsedAgeGroup.max, age_group),
    [parsedAgeGroup.min, parsedAgeGroup.max, age_group],
  );

  const validateAge = (selectedAge) => {
    if (selectedAge === "") {
      setAgeError("");
      return true;
    }

    const age = Number(selectedAge);
    if (Number.isNaN(age)) {
      setAgeError("Please select a valid age.");
      return false;
    }

    const { min, max } = parsedAgeGroup;
    const isBelowRange = min !== null && age < min;
    const isAboveRange = max !== null && age > max;

    if (isBelowRange || isAboveRange) {
      setAgeError(
        `Please select an appropriate age within ${ageRangeLabel} for this book.`,
      );
      return false;
    }

    setAgeError("");
    return true;
  };

  const validateGender = (selectedGender, showRequiredError = false) => {
    if (!selectedGender) {
      if (hasGenderRestriction && showRequiredError) {
        setGenderError(`Please select ${bookGenderLabel} for this book.`);
        return false;
      }
      setGenderError("");
      return true;
    }

    const normalizedSelectedGender = normalizeGender(selectedGender);
    if (!hasGenderRestriction) {
      setGenderError("");
      return true;
    }

    if (normalizedSelectedGender !== bookGender) {
      const selectedGenderLabel = getGenderLabel(normalizedSelectedGender);
      setGenderError(
        `This book is designed for ${bookGenderLabel}. If you pick ${selectedGenderLabel}, the printed result may not match that gender.`,
      );
      return false;
    }

    setGenderError("");
    return true;
  };

  const handleAgeChange = (e) => {
    const selectedAge = e.target.value;
    setFormData({ ...formData, age: selectedAge });
    validateAge(selectedAge);
  };

  const handleGenderChange = (e) => {
    const selectedGender = e.target.value;
    setFormData({ ...formData, gender: selectedGender });
    validateGender(selectedGender);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isAgeValid = validateAge(formData.age);
    const isGenderValid = validateGender(formData.gender, true);

    if (!isAgeValid || !isGenderValid) {
      return;
    }

    setChildName(formData.name);
    trackMetaEvent(
      "CustomizeProduct",
      getStorybookEventParams({
        bookId: book_id,
        category: age_group
          ? `Personalized Storybook - Ages ${age_group}`
          : "Personalized Storybook",
      }),
    );

    const uploadParams = new URLSearchParams({
      book_id: book_id,
      name: formData.name,
      gender: formData.gender,
      age: formData.age,
      birthMonth: formData.birthMonth,
      page_count: page_count,
      min_photos: min_photos,
    });

    navigate(`/upload?${uploadParams.toString()}`);
  };

  const hasRestrictionError = Boolean(ageError || genderError);

  return (
    <div className="max-w-2xl mx-auto mt-6 sm:mt-10 px-3 sm:px-6 lg:px-8 pb-10 sm:pb-12">
      <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-blue-50">
        <div className="flex justify-center mb-4 sm:mb-6">
          <UserCircleIcon className="h-16 w-16 text-primary" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 sm:mb-8 text-gray-800">
          Tell us about your little star!
        </h2>
        {(age_group || bookGender) && (
          <div className="mb-6 rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50 via-sky-50 to-cyan-50 px-4 py-4">
            <p className="text-sm sm:text-base font-semibold text-blue-900 mb-3">
              This book is designed for:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-white/80 border border-blue-100 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold">
                  Age Group
                </p>
                <p className="text-sm sm:text-base font-bold text-blue-900">
                  {age_group ? age_group : "Not specified"}
                </p>
              </div>
              <div className="rounded-xl bg-white/80 border border-blue-100 px-3 py-2">
                <p className="text-[11px] uppercase tracking-wide text-blue-600 font-semibold">
                  Gender
                </p>
                <p className="text-sm sm:text-base font-bold text-blue-900">
                  {bookGenderLabel}
                </p>
              </div>
            </div>
          </div>
        )}

        {hasRestrictionError && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-red-300 bg-gradient-to-r from-red-50 to-rose-50 px-4 py-3"
          >
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm sm:text-base font-semibold text-red-800">
                  This book is only designed for {ageRangeLabel} and{" "}
                  {bookGenderLabel}.
                </p>
                <p className="text-xs sm:text-sm text-red-700 mt-1">
                  Please choose matching age and gender to avoid incorrect print
                  output.
                </p>
              </div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-gray-700 text-base sm:text-lg mb-2">
              Child's First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition duration-300"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              placeholder="Enter child's name"
            />
          </div>

          <div>
            <label className="block text-gray-700 text-base sm:text-lg mb-2">
              Gender
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Boy", "Girl"].map((genderOption) => (
                <label
                  key={genderOption}
                  className={`flex items-center space-x-3 cursor-pointer px-4 py-3 rounded-xl border transition ${
                    genderError
                      ? "border-red-300 bg-red-50/50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="gender"
                    value={genderOption.toLowerCase()}
                    checked={formData.gender === genderOption.toLowerCase()}
                    onChange={handleGenderChange}
                    className="w-5 h-5 text-blue-600"
                  />
                  <span className="text-gray-700">{genderOption}</span>
                </label>
              ))}
            </div>
            {genderError && (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {genderError}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-base sm:text-lg mb-2">
              Current Age
            </label>
            <div className="relative">
              <select
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition duration-300 appearance-none ${
                  ageError
                    ? "border-red-400 bg-red-50/40 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                }`}
                value={formData.age}
                onChange={handleAgeChange}
              >
                <option value="">Select Age</option>
                {[...Array(12)].map((_, i) => (
                  <option key={i} value={i}>
                    {i} years
                  </option>
                ))}
              </select>
              <CakeIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
            {ageError && (
              <div
                role="alert"
                className="mt-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {ageError}
              </div>
            )}
          </div>

          <div className="relative">
            <label className="block text-gray-700 text-base sm:text-lg mb-2">
              Birth Month
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none transition duration-300 appearance-none"
                value={formData.birthMonth}
                onChange={(e) =>
                  setFormData({ ...formData, birthMonth: e.target.value })
                }
              >
                <option value="">Select Month</option>
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </select>
              <CalendarIcon className="h-5 w-5 text-gray-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-secondary text-white py-4 px-6 rounded-full text-base sm:text-lg font-semibold hover:bg-blue-600 transition duration-300 mt-8"
          >
            Next Step -&gt; Upload Photos
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChildDetails;
