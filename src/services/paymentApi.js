import axios from "axios";
import { apiUrl } from "../config/api";
export const createRazorpayOrder = async (req_id, amount) => {
  const res = await axios.post(apiUrl("/api/payment/create-order"), {
    req_id,
    amount,
  });
  return res.data;
};

export const verifyRazorpayPayment = async (payload) => {
  const res = await axios.post(apiUrl("/api/payment/verify"), payload);
  return res.data;
};

export const getPaymentStatus = async (req_id) => {
  const res = await axios.get(apiUrl("/api/payment/status"), {
    params: { req_id },
  });
  return res.data;
};
