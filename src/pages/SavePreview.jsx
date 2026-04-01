import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import heroImg from "../assets/magic_icon.svg";
import useChildStore from "../store/childStore";
import axios from "axios";
import { apiUrl } from "../config/api";

function SavePreview() {
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const request_id = queryParams.get("request_id");
  const book_id = queryParams.get("book_id");
  const notify = queryParams.get("notify") === "true";

  const childName = useChildStore((state) => state.childName);
  const kidName =
    queryParams.get("name") || useChildStore((state) => state.childName);

  const [formData, setFormData] = useState({
    email: "",
    name: "",
  });

  const [showThankYou, setShowThankYou] = useState(false);

  /* =====================================================
     🚫 STEP 1: REMOVE PREVIOUS HISTORY (EMAIL MODE)
     ===================================================== */
  useEffect(() => {
    if (notify) {
      navigate(location.pathname + location.search, {
        replace: true,
      });
    }
  }, [notify, navigate, location.pathname, location.search]);

  /* =====================================================
     🔒 STEP 2: HARD BLOCK BROWSER BACK BUTTON
     ===================================================== */
  useEffect(() => {
    if (!notify) return;

    const blockBack = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", blockBack);

    return () => {
      window.removeEventListener("popstate", blockBack);
    };
  }, [notify]);

  /* =====================================================
     📧 SEND PREVIEW LINK
     ===================================================== */
  const sendPreviewLink = async () => {
    try {
      const response = await axios.post(apiUrl("/api/photo/send_preview"), {
        email: formData.email,
        name: formData.name,
        req_id: request_id,
        kidName,
        book_id,
        notify,
      });

      return response.data;
    } catch (error) {
      console.error("Error sending preview link:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await sendPreviewLink();

      if (notify) {
        setShowThankYou(true);
      } else {
        navigate(
          `/preview?request_id=${request_id}&book_id=${book_id}&name=${kidName}&openPayment=true`,
        );
      }
    } catch (error) {
      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Preview email could not be sent. Please check your email setup and try again.";

      alert(message);
    }
  };

  /* =====================================================
     🧠 UI
     ===================================================== */
  return (
    <>
      {!showThankYou ? (
        <div className="max-w-2xl mx-auto mt-10 p-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h1 className="text-3xl font-bold text-center text-blue-900 mb-2">
              {notify
                ? "Where should we send the preview link?"
                : `Email ${childName}'s preview & see price`}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6 mt-8">
              <div>
                <label className="block text-gray-700 text-lg mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-lg mb-2">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:outline-none"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter your name"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-secondary text-white py-4 px-6 rounded-full text-xl font-semibold hover:bg-blue-600 transition"
              >
                {notify ? "Send Preview Link" : "Save Preview & Show Price"}
              </button>
            </form>

            <div className="mt-12 text-center">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Rated 4.9 out of 5
              </h2>
              <p className="text-gray-600">
                Based on verified reviews on Yotpo.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-3xl w-full bg-white rounded-3xl shadow-2xl p-10">
            <div className="flex flex-col items-center mb-4">
              <img src={heroImg} alt="logo" className="w-20 h-20 mb-3" />
              <div className="text-3xl font-extrabold text-teal-500">
                Thank You
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 text-lg mb-6">
                We’ve received your request. The preview link will be emailed to
                you shortly.
              </p>

              <p className="text-gray-600 mb-6">
                Meanwhile, you can{" "}
                <Link
                  to="/books"
                  className="text-teal-600 underline font-medium"
                >
                  explore other books
                </Link>
                .
              </p>

              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-block bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-full shadow"
                >
                  Go to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SavePreview;
