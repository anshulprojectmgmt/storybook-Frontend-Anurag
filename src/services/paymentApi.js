import axios from "axios";
import { apiUrl } from "../config/api";
import { authHeader } from "../utils/api";

export const createRazorpayOrder = async (req_id, amount, book_id, token) => {
  const res = await axios.post(apiUrl("/api/payment/create-order"), {
    req_id,
    amount,
    book_id,
  }, {
    headers: authHeader(token),
  });
  return res.data;
};

export const verifyRazorpayPayment = async (payload, token) => {
  const res = await axios.post(apiUrl("/api/payment/verify"), payload, {
    headers: authHeader(token),
  });
  return res.data;
};

export const getPaymentStatus = async (req_id, token) => {
  const res = await axios.get(apiUrl("/api/payment/status"), {
    params: { req_id },
    headers: authHeader(token),
  });
  return res.data;
};
