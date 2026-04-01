import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import UnlockPaymentModal from "../components/UnlockPaymentModal";
import { apiUrl } from "../config/api";

export default function Checkout() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const req_id = params.get("request_id");
  const book_id = params.get("book_id");
  const book_Price = params.get("book_Price");

  const [showPayment, setShowPayment] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [kidName, setKidname] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const saveAndPay = async () => {
    setLoading(true);
    try {
      await axios.post(apiUrl("/api/checkout/save-address"), {
        req_id,
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: {
          line1: form.line1,
          line2: form.line2,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          country: form.country,
        },
        kidName,
      });

      setShowPayment(true);
    } catch {
      alert("Please fill complete address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-4xl font-bold mb-6">Checkout</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          "name",
          "email",
          "phone",
          "line1",
          "line2",
          "city",
          "state",
          "pincode",
          "country",
        ].map((f) => (
          <input
            key={f}
            name={f}
            placeholder={f.replace("_", " ").toUpperCase()}
            value={form[f]}
            onChange={handleChange}
            className="border p-3 rounded"
          />
        ))}
        <input
          className="border p-3 rounded"
          type="text"
          placeholder="Enter the Child name"
          value={kidName}
          onChange={(e) => setKidname(e.target.value)}
        />
      </div>

      <button
        onClick={saveAndPay}
        disabled={loading}
        className="mt-6 w-full bg-blue-600 text-white py-4 rounded-xl text-xl"
      >
        {loading ? "Saving..." : "Proceed to Payment"}
      </button>

      {showPayment && (
        <UnlockPaymentModal
          req_id={req_id}
          amount={book_Price}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            const previewParams = new URLSearchParams({
              request_id: req_id || "",
              book_id: book_id || "",
              paid: "true",
            });

            if (kidName) {
              previewParams.set("name", kidName);
            }

            navigate(`/preview?${previewParams.toString()}`);
          }}
        />
      )}
    </div>
  );
}
