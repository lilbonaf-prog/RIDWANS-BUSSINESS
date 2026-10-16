import { useContext, useEffect, useState } from "react";
import axios from "axios";

import {
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import { StoreContext } from "../../context/StoreContext";

import "./Verify.css";

// ==========================================
// RIDWAN BUSINESS
// PAYMENT VERIFICATION PAGE
// ==========================================

const Verify = () => {

  // ========================================
  // GET PAYMENT INFORMATION FROM URL
  // ========================================

  const [searchParams] = useSearchParams();

  const success = searchParams.get("success");

  const orderId = searchParams.get("orderId");

  // ========================================
  // STORE CONTEXT
  // ========================================

  const { url } = useContext(StoreContext);

  const navigate = useNavigate();

  // ========================================
  // ERROR STATE
  // ========================================

  const [errorMessage, setErrorMessage] = useState("");

  // ========================================
  // VERIFY PAYMENT
  // ========================================

  useEffect(() => {

    // Cannot verify without the backend URL
    // and an order ID.

    if (!url || !orderId) {
      return;
    }

    const controller = new AbortController();

    const verifyPayment = async () => {

      try {

        // ==================================
        // SEND VERIFICATION REQUEST
        // ==================================

        const response = await axios.post(
          `${url}/api/payment/verify`,
          {
            success,
            orderId,
          },
          {
            signal: controller.signal,
          }
        );

        // Ignore cancelled requests.

        if (controller.signal.aborted) {
          return;
        }

        // ==================================
        // PAYMENT VERIFICATION RESULT
        // ==================================

        if (response.data?.success === true) {

          // Backend confirmed successful verification.
          navigate("/myorders", {
            replace: true,
          });

        } else {

          // Backend did not confirm payment.
          navigate("/", {
            replace: true,
          });

        }

      } catch (error) {

        // Ignore cancelled requests.

        if (
          controller.signal.aborted ||
          axios.isCancel(error)
        ) {
          return;
        }

        console.error(
          "Payment verification error:",
          error.response?.data || error.message
        );

        // Do not claim payment failed just
        // because the verification request failed.

        setErrorMessage(
          "We couldn't verify your payment right now. " +
          "Please check My Orders or contact support " +
          "before attempting another payment."
        );

      }

    };

    verifyPayment();

    // ======================================
    // CLEANUP
    // ======================================

    return () => {
      controller.abort();
    };

  }, [url, success, orderId, navigate]);

  // ========================================
  // MISSING PAYMENT INFORMATION
  // ========================================

  if (!orderId) {

    return (
      <div className="verify">

        <div>
          <h2>Payment Verification</h2>

          <p>
            No order ID was found in the payment link.
          </p>

          <Link to="/">
            Return to Homepage
          </Link>
        </div>

      </div>
    );

  }

  // ========================================
  // BACKEND CONFIGURATION ERROR
  // ========================================

  if (!url) {

    return (
      <div className="verify">

        <div>
          <h2>Payment Verification Unavailable</h2>

          <p>
            Unable to connect to the payment service.
            Please contact support.
          </p>

        </div>

      </div>
    );

  }

  // ========================================
  // PAYMENT VERIFICATION ERROR
  // ========================================

  if (errorMessage) {

    return (
      <div className="verify">

        <div role="alert">

          <h2>Unable to Verify Payment</h2>

          <p>{errorMessage}</p>

          <Link to="/myorders">
            Check My Orders
          </Link>

          <br />

          <Link to="/">
            Return to Homepage
          </Link>

        </div>

      </div>
    );

  }

  // ========================================
  // PAYMENT VERIFICATION LOADING
  // ========================================

  return (

    <div className="verify">

      <div
        className="spinner"
        aria-hidden="true"
      />

      <p role="status">
        Verifying your payment. Please wait...
      </p>

    </div>

  );

};

export default Verify;