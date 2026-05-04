import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { apiRequest } from "../utils/api";
import { useAuth } from "./AuthContext";

const CouponContext = createContext(null);

function emptyAccess() {
  return {
    hasAccess: false,
    accessEndsAt: null,
    normalizedCode: null,
    usedToday: 0,
    remainingToday: 0,
    dailyFreeBookLimit: 3,
  };
}

export function CouponProvider({ children }) {
  const { token, isAuthenticated } = useAuth();
  const [publicStatus, setPublicStatus] = useState({
    couponAvailable: false,
    code: null,
    validUntil: null,
  });
  const [access, setAccess] = useState(emptyAccess);

  const refreshPublicStatus = useCallback(async () => {
    try {
      const response = await apiRequest("/api/coupons/public-status");
      setPublicStatus({
        couponAvailable: Boolean(response.couponAvailable),
        code: response.code || null,
        validUntil: response.validUntil || null,
      });
      return response;
    } catch {
      setPublicStatus({
        couponAvailable: false,
        code: null,
        validUntil: null,
      });
      return null;
    }
  }, []);

  const refreshAccess = useCallback(async () => {
    if (!token) {
      setAccess(emptyAccess());
      return null;
    }

    try {
      const response = await apiRequest("/api/coupons/my-access", { token });
      setPublicStatus({
        couponAvailable: Boolean(response.couponAvailable),
        code: response.code || null,
        validUntil: response.validUntil || null,
      });
      setAccess(response.access || emptyAccess());
      return response;
    } catch {
      setAccess(emptyAccess());
      return null;
    }
  }, [token]);

  useEffect(() => {
    refreshPublicStatus();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAccess();
    } else {
      setAccess(emptyAccess());
    }
  }, [isAuthenticated, token]);

  const value = useMemo(
    () => ({
      access,
      publicStatus,
      refreshAccess,
      refreshPublicStatus,
      setAccess,
    }),
    [access, publicStatus, refreshAccess, refreshPublicStatus],
  );

  return (
    <CouponContext.Provider value={value}>{children}</CouponContext.Provider>
  );
}

export function useCouponAccess() {
  const context = useContext(CouponContext);

  if (!context) {
    throw new Error("useCouponAccess must be used within a CouponProvider.");
  }

  return context;
}
