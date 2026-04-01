import { useState, useEffect, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useChildStore from "../store/childStore";
import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import UnlockPaymentModal from "../components/UnlockPaymentModal";
import { apiUrl } from "../config/api";

function getPageImages(page) {
  if (Array.isArray(page?.image_options) && page.image_options.length > 0) {
    return page.image_options.map(
      (option) => option.preview_url || option.print_url || null,
    );
  }

  return Array.isArray(page?.image_urls) ? page.image_urls : [];
}

const FREE_PREVIEW_PAGE_COUNT = 2;
const PAGE_GENERATION_CONCURRENCY = 2;

function Preview() {
  const [searchParams] = useSearchParams();
  const openPayment = searchParams.get("openPayment") === "true";
  const paidFromRedirect = searchParams.get("paid") === "true";

  const request_id = searchParams.get("request_id");
  const book_id = searchParams.get("book_id");
  const rawName = searchParams.get("name");
  const storedChildName = useChildStore((state) => state.childName);
  const [resolvedChildName, setResolvedChildName] = useState("");

  const gender = searchParams.get("gender");
  const age = searchParams.get("age");
  const birthMonth = searchParams.get("birthMonth");
  const page_count = Number(searchParams.get("page_count")) || 0;
  const [resolvedTotalPages, setResolvedTotalPages] = useState(0);
  const childName =
    (rawName && rawName !== "{kid}" ? rawName : null) ||
    resolvedChildName ||
    storedChildName ||
    "";
  const totalPages =
    page_count > 0 ? page_count : resolvedTotalPages > 0 ? resolvedTotalPages : 1;
  const isEmailPreview = searchParams.get("email") === "true";

  const [showPayment, setShowPayment] = useState(false);
  const [retryAfterPayment, setRetryAfterPayment] = useState(0);
  const [bookPrice, setBookPrice] = useState(100);
  const [isPaid, setIsPaid] = useState(paidFromRedirect);
  const [previewEmailSent, setPreviewEmailSent] = useState(false);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [frontCoverUrl, setFrontCoverUrl] = useState(null);
  const [backCoverUrl, setBackCoverUrl] = useState(null);
  const [finalPdfStatus, setFinalPdfStatus] = useState("not_ready");
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const [pageData, setPageData] = useState([]);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  const [allPagesLoaded, setAllPagesLoaded] = useState(false);
  const [generationRetryTick, setGenerationRetryTick] = useState(0);
  const pageDataRef = useRef([]);
  const inFlightPagesRef = useRef(new Set());

  const unlockedPageLimit = isPaid
    ? totalPages
    : Math.min(totalPages, FREE_PREVIEW_PAGE_COUNT);
  const loadedPages = Array.from(
    { length: unlockedPageLimit },
    (_, index) => pageData[index],
  ).filter(
    (page) => page && !page.locked && getPageImages(page).filter(Boolean).length > 0,
  )
    .length;
  const missingPageNumbers = Array.from(
    { length: unlockedPageLimit },
    (_, index) => index + 1,
  ).filter((pageNumber) => {
    const page = pageData[pageNumber - 1];
    return !page || getPageImages(page).filter(Boolean).length === 0;
  });
  const nextPendingPageNumber = missingPageNumbers[0] || null;
  const loadingProgress = unlockedPageLimit
    ? Math.min((loadedPages / unlockedPageLimit) * 100, 100)
    : 0;
  const showInitialLoader = loadedPages === 0 && missingPageNumbers.length > 0;
  const canSendPreview = !isPaid && !isEmailPreview && !previewEmailSent;
  const showPaymentGate =
    !isPaid &&
    totalPages > FREE_PREVIEW_PAGE_COUNT &&
    loadedPages >= Math.min(totalPages, FREE_PREVIEW_PAGE_COUNT);
  const isFinalSelectionReady =
    isPaid &&
    allPagesLoaded &&
    Boolean(frontCoverUrl) &&
    Boolean(backCoverUrl) &&
    !pdfUrl &&
    !isGeneratingPdf &&
    finalPdfStatus === "selection_ready";
  const isFinalPdfGenerating =
    !pdfUrl && (isGeneratingPdf || finalPdfStatus === "generating");

  useEffect(() => {
    pageDataRef.current = pageData;
  }, [pageData]);

  useEffect(() => {
    if (!request_id || !book_id || allPagesLoaded) {
      return undefined;
    }

    const intervalId = setInterval(() => {
      setGenerationRetryTick((count) => count + 1);
    }, isPaid ? 8000 : 12000);

    return () => clearInterval(intervalId);
  }, [allPagesLoaded, book_id, isPaid, request_id]);

  useEffect(() => {
    if (!request_id) {
      return undefined;
    }

    let isMounted = true;

    const fetchBookStatus = async () => {
      try {
        const res = await axios.get(apiUrl("/api/photo/get_all_pages"), {
          params: { req_id: request_id, book_id },
        });

        if (!isMounted) {
          return;
        }

        setFrontCoverUrl(res.data.front_cover_url || null);
        setBackCoverUrl(res.data.back_cover_url || null);
        setPreviewEmailSent(Boolean(res.data.preview_email_sent));
        setResolvedChildName(res.data.kid_name || "");
        setResolvedTotalPages(Number(res.data.page_count) || 0);
        setFinalPdfStatus(res.data.final_pdf_status || "not_ready");

        if (Array.isArray(res.data.page_details) && res.data.page_details.length > 0) {
          setPageData((prev) => {
            const nextPages = [...prev];

            res.data.page_details.forEach((page) => {
              if (page?.page_number) {
                nextPages[page.page_number - 1] = {
                  ...nextPages[page.page_number - 1],
                  ...page,
                };
              }
            });

            return nextPages;
          });

          setCurrentImageIndexes((prev) => {
            const nextIndexes = { ...prev };

            res.data.page_details.forEach((page) => {
              if (page?.page_number) {
                nextIndexes[page.page_number - 1] =
                  typeof page.image_idx === "number" ? page.image_idx : 0;
              }
            });

            return nextIndexes;
          });
        }

        if (typeof res.data.paid === "boolean") {
          setIsPaid(res.data.paid);
        }

        if (res.data.pdf_url) {
          setPdfUrl(res.data.pdf_url);
          setIsGeneratingPdf(false);
        }
      } catch (error) {
        console.error("Error fetching book status:", error);
      }
    };

    fetchBookStatus();
    const intervalId = setInterval(fetchBookStatus, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [book_id, request_id]);

  useEffect(() => {
    const fetchPrice = async () => {
      const res = await axios.get(apiUrl(`/api/storybook/price/${book_id}`));
      setBookPrice(res.data.price);
    };

    if (book_id) {
      fetchPrice();
    }
  }, [book_id]);

  useEffect(() => {
    if (openPayment && bookPrice && !isPaid) {
      setShowPayment(true);
    }
  }, [openPayment, bookPrice, isPaid]);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const res = await axios.get(apiUrl("/api/payment/status"), {
          params: { req_id: request_id },
        });

        setIsPaid(res.data.paid);
        setPreviewEmailSent(Boolean(res.data.preview_email_sent));
        setFinalPdfStatus(res.data.final_pdf_status || "not_ready");
        if (res.data.pdf_url) {
          setPdfUrl(res.data.pdf_url);
          setIsGeneratingPdf(false);
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
      }
    };

    if (request_id) {
      fetchPaymentStatus();
    }
  }, [request_id, retryAfterPayment]);

  const pollUntilDone = async (
    req_id,
    job_id,
    page_number,
    book_id,
    maxRetries = 80,
    interval = 3000,
  ) => {
    let retries = 0;

    const poll = async () => {
      try {
        const res = await axios.get(apiUrl("/api/photo/check_generation_status"), {
          params: { req_id, job_id, page_number, book_id },
        });

        const data = res.data;
        if (
          data.status === "completed" &&
          ((Array.isArray(data.image_options) && data.image_options.length > 0) ||
            (Array.isArray(data.image_urls) && data.image_urls.length > 0))
        ) {
          return data;
        }

        if (data.status === "failed") {
          throw new Error("Image generation failed");
        }

        if (retries < maxRetries) {
          retries += 1;
          await new Promise((resolve) => setTimeout(resolve, interval));
          return poll();
        }

        throw new Error("Polling timed out");
      } catch (error) {
        console.error("Polling error:", error);
        return { error: true };
      }
    };

    return poll();
  };

  const fetchPageData = useCallback(
    async (pageNumber, currentBookId) => {
      try {
        const response = await axios.get(
          apiUrl("/api/photo/get_generation_details"),
          {
            params: {
              req_id: request_id,
              book_id: currentBookId,
              page_number: pageNumber,
              childName,
            },
          },
        );

        const { job_id } = response.data;
        if (!job_id) {
          throw new Error("No job_id found in response");
        }

        const result = await pollUntilDone(
          request_id,
          job_id,
          pageNumber,
          currentBookId,
        );

        if (result.error) {
          throw new Error(
            "Error during polling for image generation maybe retry limit reached",
          );
        }

        return { ...result, pageNumber };
      } catch (error) {
        if (error?.response?.status === 403 && error?.response?.data?.locked) {
          return { locked: true, pageNumber };
        }

        console.error("Error fetching page data:", error);
        return null;
      }
    },
    [request_id, childName, isPaid],
  );

  const storePageResult = useCallback((pageResult) => {
    setPageData((prev) => {
      const nextPages = [...prev];
      nextPages[pageResult.pageNumber - 1] = pageResult;
      return nextPages;
    });

    setCurrentImageIndexes((prev) => ({
      ...prev,
      [pageResult.pageNumber - 1]:
        typeof pageResult.image_idx === "number" ? pageResult.image_idx : 0,
    }));
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadPagesInParallel = async () => {
      const queue = Array.from(
        { length: unlockedPageLimit },
        (_, index) => index + 1,
      ).filter((pageNumber) => {
        if (inFlightPagesRef.current.has(pageNumber)) {
          return false;
        }

        const existingPage = pageDataRef.current[pageNumber - 1];
        return (
          !existingPage || getPageImages(existingPage).filter(Boolean).length === 0
        );
      });

      if (!queue.length) {
        return;
      }

      let queueIndex = 0;

      const worker = async () => {
        while (isMounted) {
          const pageNumber = queue[queueIndex];
          queueIndex += 1;

          if (!pageNumber) {
            return;
          }

          inFlightPagesRef.current.add(pageNumber);

          try {
            const pageResult = await fetchPageData(pageNumber, book_id);

            if (!isMounted || !pageResult) {
              continue;
            }

            if (pageResult.locked) {
              continue;
            }

            storePageResult(pageResult);
          } finally {
            inFlightPagesRef.current.delete(pageNumber);
          }
        }
      };

      const workerCount = Math.min(PAGE_GENERATION_CONCURRENCY, queue.length);
      await Promise.allSettled(Array.from({ length: workerCount }, () => worker()));
    };

    if (request_id && book_id) {
      loadPagesInParallel();
    }

    return () => {
      isMounted = false;
    };
  }, [
    unlockedPageLimit,
    fetchPageData,
    book_id,
    generationRetryTick,
    request_id,
    retryAfterPayment,
    storePageResult,
  ]);

  useEffect(() => {
    const requiredLoadedPages = Array.from(
      { length: unlockedPageLimit },
      (_, index) => pageData[index],
    ).filter(
      (page) => page && !page.locked && getPageImages(page).filter(Boolean).length > 0,
    )
      .length;

    setAllPagesLoaded(
      unlockedPageLimit > 0 && requiredLoadedPages >= unlockedPageLimit,
    );
  }, [pageData, unlockedPageLimit]);

  const updateSelectedImage = useCallback(
    async (pageIndex, imageIndex) => {
      const page = pageData[pageIndex];
      if (!page) {
        return;
      }

      setCurrentImageIndexes((prev) => ({
        ...prev,
        [pageIndex]: imageIndex,
      }));

      setPageData((prev) => {
        const nextPages = [...prev];
        if (nextPages[pageIndex]) {
          nextPages[pageIndex] = {
            ...nextPages[pageIndex],
            image_idx: imageIndex,
          };
        }
        return nextPages;
      });

      try {
        const response = await axios.post(apiUrl("/api/photo/update_image"), {
          req_id: page.req_id,
          job_id: page.job_id,
          image_id: imageIndex,
        });

        if (response.data?.pdf_url) {
          setPdfUrl(response.data.pdf_url);
        }

        if (response.data?.final_pdf_status) {
          setFinalPdfStatus(response.data.final_pdf_status);
        }
      } catch (error) {
        console.error("Error updating page image:", error);
      }
    },
    [pageData],
  );

  const handleImageNavigation = useCallback(
    (pageIndex, direction) => {
      const page = pageData[pageIndex];
      const images = getPageImages(page);
      if (!images.length) {
        return;
      }

      const currentImageIndex = currentImageIndexes[pageIndex] ?? 0;
      const totalImages = images.length;
      const nextIndex =
        direction === "next"
          ? (currentImageIndex + 1) % totalImages
          : currentImageIndex === 0
            ? totalImages - 1
            : currentImageIndex - 1;

      updateSelectedImage(pageIndex, nextIndex);
    },
    [pageData, currentImageIndexes, updateSelectedImage],
  );

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    e.currentTarget.dataset.startX = touch.clientX;
    e.currentTarget.dataset.startY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e, pageIndex) => {
      const startX = Number.parseFloat(e.currentTarget.dataset.startX);
      const startY = Number.parseFloat(e.currentTarget.dataset.startY);
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX > 0) {
          handleImageNavigation(pageIndex, "prev");
        } else {
          handleImageNavigation(pageIndex, "next");
        }
      }
    },
    [handleImageNavigation],
  );

  const handleSavePreview = () => {
    const saveParams = new URLSearchParams({
      request_id,
      book_id,
      name: childName,
      gender: gender || "",
      age: age || "",
      birthMonth: birthMonth || "",
    });

    return `/save-preview?${saveParams.toString()}`;
  };

  const handleEmailPreview = () => {
    const saveParams = new URLSearchParams({
      request_id,
      book_id,
      name: childName,
      gender: gender || "",
      age: age || "",
      birthMonth: birthMonth || "",
      notify: true,
    });

    return `/save-preview?${saveParams.toString()}`;
  };

  const handleGenerateFinalPdf = async () => {
    try {
      setIsGeneratingPdf(true);

      const response = await axios.post(apiUrl("/api/photo/generate_final_pdf"), {
        req_id: request_id,
        book_id,
      });

      setFinalPdfStatus(response.data?.final_pdf_status || "ready");

      if (response.data?.pdf_url) {
        setPdfUrl(response.data.pdf_url);
      }
    } catch (error) {
      console.error("Error generating final PDF:", error);
      alert(
        error?.response?.data?.message ||
          "Failed to generate the final PDF. Please try again.",
      );
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  if (showInitialLoader) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-8">
              <CircularProgressbar
                value={isNaN(loadingProgress) ? 0 : loadingProgress}
                text={`${isNaN(loadingProgress) ? 0 : Math.round(loadingProgress)}%`}
                styles={{
                  path: {
                    stroke: "#22c55e",
                    strokeWidth: 8,
                    transition: "stroke-dashoffset 0.5s ease 0s",
                  },
                  text: {
                    fill: "#6b7280",
                    fontSize: "16px",
                    fontWeight: "bold",
                  },
                  trail: {
                    stroke: "#e5e7eb",
                    strokeWidth: 8,
                  },
                }}
              />
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-gray-700 mb-8">
              Creating {childName}&apos;s Book...
            </h2>

            <div className="bg-blue-900 rounded-xl p-6 md:p-8 text-white mb-8">
              <p className="italic text-lg md:text-xl mb-4">
                "Amazing, unique product - customer service OUTSTANDING - will
                now be my go to gift."
              </p>
              <p className="font-semibold text-orange-400 text-lg">Ellie</p>
            </div>

            {canSendPreview ? (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-gray-200">
                <h3 className="text-xl md:text-2xl font-bold text-blue-900 mb-4">
                  Don&apos;t have time to wait?
                </h3>
                <Link
                  to={handleEmailPreview()}
                  className="inline-block w-full bg-blue-600 text-white py-3 px-6 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
                >
                  Email Me The Preview Instead
                </Link>
              </div>
            ) : previewEmailSent ? (
              <div className="bg-white rounded-xl p-6 md:p-8 shadow-lg border border-green-200 text-green-700 font-medium">
                Preview request already submitted. We won&apos;t show that option
                again here.
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-28">
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <h1 className="text-4xl font-bold text-center">
        {childName ? `${childName}'s Book Preview` : "Book Preview"}
        </h1>

        <div className="mt-8 space-y-12">
          <div className="text-center space-y-2 text-gray-600">
            <p className="text-lg md:text-xl font-medium">
              Choose the picture you like for each page.
            </p>
          </div>

          {frontCoverUrl && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Front Cover
              </h2>
              <img
                src={frontCoverUrl}
                alt="Front Cover"
                className="w-full aspect-[4/3] object-contain"
              />
            </div>
          )}

          {pageData.map((page, pageIndex) => {
            if (!page) {
              return null;
            }

            const images = getPageImages(page).filter(Boolean);
            const currentImageIndex =
              currentImageIndexes[pageIndex] ?? page.image_idx ?? 0;
            const safeImageIndex = images.length
              ? Math.max(0, Math.min(currentImageIndex, images.length - 1))
              : 0;

            return (
              <div
                key={page.page_number || pageIndex}
                className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transform transition-all duration-500 ease-in-out"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-blue-900">
                    Page {page.page_number || pageIndex + 1}
                  </h2>
                </div>

                {images.length > 1 && (
                  <p className="mb-4 rounded-xl bg-blue-50 px-4 py-3 text-sm font-medium text-blue-800">
                    Pick the image you want to keep for this page.
                  </p>
                )}

                <div className="relative w-full rounded-lg overflow-hidden group">
                  <div
                    className="relative"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={(e) => handleTouchEnd(e, pageIndex)}
                  >
                    <img
                      src={images[safeImageIndex]}
                      alt={`Page ${pageIndex + 1} - Image ${safeImageIndex + 1}`}
                      className="w-full aspect-[4/3] object-contain rounded-xl border-4 border-blue-200 transition-opacity duration-300"
                    />

                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => handleImageNavigation(pageIndex, "prev")}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity duration-300 hover:bg-opacity-70"
                          aria-label="Previous image"
                        >
                          <ChevronLeftIcon className="h-5 w-5" />
                        </button>

                        <button
                          onClick={() => handleImageNavigation(pageIndex, "next")}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity duration-300 hover:bg-opacity-70"
                          aria-label="Next image"
                        >
                          <ChevronRightIcon className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                      {images.map((_, imageIndex) => (
                        <button
                          key={imageIndex}
                          onClick={() => updateSelectedImage(pageIndex, imageIndex)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            imageIndex === safeImageIndex
                              ? "bg-white scale-125"
                              : "bg-white bg-opacity-50 hover:bg-opacity-75"
                          }`}
                          aria-label={`Go to image ${imageIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {images.map((imageUrl, imageIndex) => {
                      const isSelected = imageIndex === safeImageIndex;

                      return (
                        <button
                          key={imageIndex}
                          type="button"
                          onClick={() =>
                            updateSelectedImage(pageIndex, imageIndex)
                          }
                          className={`overflow-hidden rounded-2xl border-2 text-left transition-all duration-200 ${
                            isSelected
                              ? "border-blue-600 bg-blue-50 shadow-lg"
                              : "border-gray-200 bg-white hover:border-blue-300"
                          }`}
                        >
                          <img
                            src={imageUrl}
                            alt={`Page ${pageIndex + 1} option ${imageIndex + 1}`}
                            className="h-32 w-full object-cover"
                          />
                          <div className="flex items-center justify-between px-4 py-3">
                            <span className="font-semibold text-gray-800">
                              Choice {imageIndex + 1}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-bold ${
                                isSelected
                                  ? "bg-blue-600 text-white"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                <p className="mt-6 text-gray-800 text-lg font-medium text-center px-4">
                  {page.scene?.replace(/{kid}/gi, childName || "your child") ||
                    `Page ${pageIndex + 1} content`}
                </p>

                {images.length > 1 && (
                  <p className="mt-2 text-center text-sm text-gray-500 md:hidden">
                    Swipe to see the other choice
                  </p>
                )}
              </div>
            );
          })}

          {missingPageNumbers.map((pageNumber) => (
            <div
              key={`pending-${pageNumber}`}
              className="bg-white rounded-xl shadow-lg p-6 sm:p-8 text-center"
            >
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-blue-500"></div>
              <h2 className="text-xl font-bold text-blue-900">
                Page {pageNumber}
              </h2>
              <p className="mt-3 text-gray-600">
                Creating this page...
              </p>
            </div>
          ))}

          {showPaymentGate && (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border-2 border-dashed border-gray-300">
              <h2 className="text-2xl font-bold text-blue-900 mb-4">
                Unlock the Full Book
              </h2>

              <p className="text-gray-600 mb-6">
                The first 2 pages are ready. Complete payment to generate the
                remaining pages and final PDF.
              </p>

              <Link
                to={`/checkout?request_id=${request_id}&book_id=${book_id}&book_Price=${bookPrice}`}
                className="bg-blue-600 text-white px-8 py-4 rounded-full inline-block"
              >
                Proceed to Checkout
              </Link>
            </div>
          )}

          {backCoverUrl && (
            <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
              <h2 className="text-xl font-bold text-blue-900 mb-4">
                Back Cover
              </h2>
              <img
                src={backCoverUrl}
                alt="Back Cover"
                className="w-full aspect-[4/3] object-contain"
              />
            </div>
          )}

        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-50">
        <div className="max-w-2xl mx-auto">
          {pdfUrl ? (
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="block w-full bg-green-600 text-white text-center py-4 rounded-full text-xl font-semibold hover:bg-green-700"
            >
              Download Final PDF
            </a>
          ) : isFinalSelectionReady ? (
            <button
              type="button"
              onClick={handleGenerateFinalPdf}
              disabled={isGeneratingPdf}
              className="block w-full rounded-full bg-blue-600 py-4 text-center text-xl font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isGeneratingPdf ? "Generating PDF..." : "Generate PDF"}
            </button>
          ) : isFinalPdfGenerating ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-blue-800 font-medium">
              Preparing your PDF...
            </div>
          ) : !isPaid && !isEmailPreview ? (
            !allPagesLoaded ? (
              canSendPreview ? (
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-3 text-center">
                    Don&apos;t have time to wait?
                  </h3>
                  <Link
                    to={handleEmailPreview()}
                    className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg text-lg font-semibold hover:bg-blue-700"
                  >
                    Email Me The Preview Instead
                  </Link>
                </div>
              ) : previewEmailSent ? (
                <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-center text-green-700 font-medium">
                  Preview request already submitted.
                </div>
              ) : null
            ) : (
              <Link
                to={handleSavePreview()}
                className="block w-full bg-secondary text-white text-center py-4 rounded-full text-xl font-semibold hover:bg-blue-600"
              >
                Save Preview & Show Price
              </Link>
            )
          ) : isPaid ? (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-center text-blue-800 font-medium">
              {nextPendingPageNumber
                ? `Creating page ${nextPendingPageNumber}...`
                : "Creating your book..."}
            </div>
          ) : null}
        </div>
      </div>

      {showPayment && (
        <UnlockPaymentModal
          req_id={request_id}
          amount={bookPrice}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            setIsPaid(true);
            setRetryAfterPayment((count) => count + 1);

            const url = new URL(window.location.href);
            url.searchParams.delete("openPayment");
            window.history.replaceState({}, "", url.toString());
          }}
        />
      )}
    </div>
  );
}

export default Preview;
