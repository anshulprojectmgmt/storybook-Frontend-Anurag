import { useEffect, useRef, useState } from "react";
import { loadRazorpay } from "../utils/loadRazorpay";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../services/paymentApi";
import { apiRequest } from "../utils/api";
import { getStorybookEventParams, trackMetaEvent } from "../utils/metaPixel";

function UnlockPaymentModal({
  req_id,
  book_id,
  amount,
  token,
  isAuthenticated,
  couponAvailable = false,
  initialMode = "payment",
  onSuccess,
  onCouponSuccess,
  onRequireAuth,
  onClose,
}) {
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [paying, setPaying] = useState(false);
  const couponInputRef = useRef(null);

  useEffect(() => {
    if (initialMode === "coupon" && couponAvailable) {
      setTimeout(() => couponInputRef.current?.focus(), 150);
    }
  }, [couponAvailable, initialMode]);

  const modalDescription = isAuthenticated
    ? couponAvailable
      ? "Use your active coupon or pay once to unlock every page and download the PDF."
      : "Pay once to unlock every page and download the PDF."
    : "Log in to choose coupon access or payment and unlock every page.";

  const startPayment = async () => {
    if (!isAuthenticated) {
      onRequireAuth?.("unlock");
      return;
    }

    setPaymentError("");
    setPaying(true);

    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) {
      setPaymentError("Razorpay SDK failed to load. Please try again.");
      setPaying(false);
      return;
    }

    try {
      const orderRes = await createRazorpayOrder(req_id, amount, book_id, token);
      const eventParams = getStorybookEventParams({
        bookId: book_id,
        value: amount,
      });

      trackMetaEvent("AddPaymentInfo", eventParams);

      const options = {
        key: orderRes.key,
        amount: orderRes.order.amount,
        currency: "INR",
        name: "StoryBook",
        description: "Unlock Full Storybook",
        order_id: orderRes.order.id,
        handler: async function (response) {
          try {
            await verifyRazorpayPayment(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                req_id,
              },
              token,
            );

            trackMetaEvent("Purchase", eventParams);
            onSuccess();
          } catch (error) {
            setPaymentError(
              error?.response?.data?.message ||
                error?.response?.data?.error ||
                error.message ||
                "Payment verification failed. Please contact support.",
            );
            setPaying(false);
          }
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            onClose();
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setPaymentError(
        error?.response?.data?.message ||
          error.message ||
          "Unable to start payment. Please try again.",
      );
      setPaying(false);
    }
  };

  const applyCoupon = async () => {
    if (!isAuthenticated) {
      onRequireAuth?.("coupon");
      return;
    }

    if (!couponCode.trim()) {
      setCouponError("Please enter your coupon code.");
      return;
    }

    setCouponError("");
    setApplyingCoupon(true);

    try {
      const response = await apiRequest("/api/coupons/apply-book", {
        method: "POST",
        token,
        body: {
          code: couponCode.trim(),
          req_id,
          book_id,
        },
      });

      onCouponSuccess?.(response);
    } catch (error) {
      setCouponError(error.message || "Unable to apply coupon.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[1.75rem] border border-blue-100 bg-white p-6 text-center shadow-2xl sm:p-8">
        <h2 className="text-2xl font-black text-[#0b2559]">Unlock Full Book</h2>
        <p className="mb-6 mt-2 text-sm font-medium text-slate-600 sm:text-base">
          {modalDescription}
        </p>

        {couponAvailable && (
          <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-left">
            <label className="mb-2 block text-sm font-black text-[#12326f]">
              Apply Coupon
            </label>
            <div className="flex gap-2">
              <input
                ref={couponInputRef}
                value={couponCode}
                onChange={(event) => setCouponCode(event.target.value)}
                placeholder="Enter coupon"
                className="min-w-0 flex-1 rounded-xl border border-blue-100 bg-white px-3 py-2 text-sm font-bold uppercase text-[#0b2559] outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={applyCoupon}
                disabled={applyingCoupon}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-black text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                {applyingCoupon ? "..." : "Apply"}
              </button>
            </div>
            {couponError && (
              <p className="mt-2 text-xs font-bold text-red-600">{couponError}</p>
            )}
          </div>
        )}

        {paymentError && (
          <p className="mb-3 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {paymentError}
          </p>
        )}

        <button
          type="button"
          onClick={startPayment}
          disabled={paying}
          className="w-full rounded-full bg-blue-600 py-3.5 text-lg font-black text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {paying ? "Opening payment..." : `Pay ${amount} & Unlock`}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-4 text-sm font-bold text-slate-500 hover:text-slate-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default UnlockPaymentModal;
