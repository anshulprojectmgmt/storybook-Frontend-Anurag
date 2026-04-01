import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircularProgressbar } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import useChildStore from "../store/childStore";
import axios from "axios";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { apiUrl } from "../config/api";
//    {
//     "_id": "68eeba12baa2e6ef48150415",
//     "req_id": "req_cihotfrsn",
//     "job_id": "86bdfe2a-f751-4526-a69f-0a50c47d6fdf",
//     "book_id": "68d191028bb1c74b7bbfe644",
//     "page_number": 11,
//     "status": "completed",
//     "image_urls": [
//         "https://kids-storybooks.s3.ap-south-1.amazonaws.com/ai_generated_images/ai_result_86bdfe2a-f751-4526-a69f-0a50c47d6fdf.jpg"
//     ],
//     "image_idx": 0,
//     "created_at": "2025-10-14T21:01:06.981Z",
//     "updated_at": "2025-10-14T21:04:46.829Z",
//     "__v": 0,
//     "scene": "Amaya rang the bell, and the eagle gifted her a bright ribbon",
//     "next": true,
//     "ok": true
// }
function Preview() {
  const [searchParams] = useSearchParams();

  // Get all query parameters

  const request_id = searchParams.get("request_id");
  const book_id = searchParams.get("book_id");
  // const childName =
  //   searchParams.get("name") || useChildStore((state) => state.childName);
  const rawName = searchParams.get("name");
  const storedChildName = useChildStore((state) => state.childName);
  const childName = rawName && rawName !== "{kid}" ? rawName : storedChildName;

  const gender = searchParams.get("gender");
  const age = searchParams.get("age");
  const birthMonth = searchParams.get("birthMonth");
  const page_count = Number(searchParams.get("page_count")) || 0;

  const [progress, setProgress] = useState(0);
  const [finalBook, setFinalBook] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageData, setPageData] = useState([]);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showSaveButton, setShowSaveButton] = useState(false);
  const [currentImageIndexes, setCurrentImageIndexes] = useState({});
  // const [totalPages, setTotalPages] = useState(page_count); // Assuming 8 total pages
  const [totalPages, setTotalPages] = useState(page_count > 0 ? page_count : 1);

  const [allPagesLoaded, setAllPagesLoaded] = useState(false);

  // Calculate loading progress based on loaded pages
  // const loadingProgress = Math.min(
  //   (pageData.filter((page) => page).length / totalPages) * 100,
  //   100
  // );

  // Calculate loading progress safely
  const loadedPages = pageData.filter((page) => page).length;
  const safeTotalPages = totalPages > 0 ? totalPages : 1; // avoid division by 0
  const loadingProgress = Math.min((loadedPages / safeTotalPages) * 100, 100);

  // const first4PagesLoaded = pageData.filter(page => page).length >= 4;
  const first4PagesLoaded = Math.floor(page_count / 4);

  // new code to print the book in correct order after all the pages and covers are generated
  useEffect(() => {
    // Detect if this is an email preview (when ?email=true)
    const isEmailPreview = searchParams.get("email") === "true";

    // In live generation, wait for allPagesLoaded
    if (!isEmailPreview && !allPagesLoaded) return;

    let intervalId;

    const fetchFinalBook = async () => {
      try {
        const res = await axios.get(
          apiUrl("/api/photo/get_all_pages"),
          {
            params: { req_id: request_id },
          },
        );

        const { front_cover_url, back_cover_url, pages } = res.data;

        // Keep polling until both covers exist (for live generation)
        if (!front_cover_url || !back_cover_url) {
          if (!isEmailPreview) {
            console.log("Covers not ready yet... retrying");
          }
          return; // Skip until next interval
        }

        // ✅ Maintain order: Front → Pages → Back
        const ordered = [front_cover_url, ...pages, back_cover_url].filter(
          Boolean,
        );
        setFinalBook(ordered);

        // Stop polling when book is complete
        clearInterval(intervalId);
      } catch (err) {
        console.error("Error fetching final book data:", err);
      }
    };

    // 🟢 For live generation: poll until ready
    // 🟢 For email preview: fetch once immediately
    if (isEmailPreview) {
      fetchFinalBook();
    } else {
      intervalId = setInterval(fetchFinalBook, 3000);
      fetchFinalBook(); // also call immediately once
    }

    return () => clearInterval(intervalId);
  }, [allPagesLoaded, request_id, searchParams]);

  //to show savebtton on scrolling more than 100 in y direction
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setShowSaveButton(scrollPosition > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const pollUntilDone = async (
    req_id,
    job_id,
    page_number,
    book_id,
    maxRetries = 25,
    interval = 10000,
  ) => {
    let retries = 0;

    const poll = async () => {
      try {
        const res = await axios.get(
          apiUrl("/api/photo/check_generation_status"),
          {
            params: { req_id, job_id, page_number, book_id },
          },
        );

        const data = res.data;
        // console.log("Polling response:", data);
        if (data.status === "completed" && data.image_urls) {
          return data;
        }

        if (data.status == "failed") {
          throw new Error("Image generation failed");
        }

        if (retries < maxRetries) {
          retries++;
          await new Promise((resolve) => setTimeout(resolve, interval));
          return await poll();
        } else {
          throw new Error("Polling timed out");
        }
      } catch (error) {
        console.error("Polling error:", error);
        return { error: true };
      }
    };

    return await poll();
  };

  const fetchPageData = useCallback(
    async (pageNumber, book_id) => {
      try {
        const response = await axios.get(
          apiUrl("/api/photo/get_generation_details"),
          {
            params: {
              req_id: request_id,
              book_id,
              page_number: pageNumber,
              childName,
            },
          },
        );

        const { job_id } = response.data;
        // console.log("Job ID:", job_id);
        if (!job_id) {
          throw new Error("No job_id found in response");
        }

        const result = await pollUntilDone(
          request_id,
          job_id,
          pageNumber,
          book_id,
        );
        if (result.error) {
          throw new Error(
            "Error during polling for image generation maybe retry limit reached",
          );
        }
        return { ...result, pageNumber };
      } catch (error) {
        console.error("Error fetching page data:", error);
        return null;
      }
    },
    [request_id, childName],
  );

  useEffect(() => {
    let progressInterval;
    let isMounted = true;

    const loadPage = async () => {
      setLoadingMessage(`Loading page ${currentPage}`);

      const pageResult = await fetchPageData(currentPage, book_id);
      // console.log(pageResult);
      if (!isMounted) return;

      if (pageResult) {
        setPageData((prev) => {
          const newPages = [...prev];
          newPages[pageResult.pageNumber - 1] = pageResult;
          return newPages;
        });

        // Initialize current image index for this page
        setCurrentImageIndexes((prev) => ({
          ...prev,
          [pageResult.pageNumber - 1]: pageResult.image_idx || 0,
        }));

        if (progressInterval) {
          clearInterval(progressInterval);
        }

        setIsLoading(false);
        setHasNextPage(pageResult.next || false);

        if (pageResult.next) {
          setCurrentPage((prev) => prev + 1);
          setIsLoading(true);
        } else {
          // All pages loaded
          setAllPagesLoaded(true);
        }
      }
    };

    loadPage();

    return () => {
      isMounted = false;
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    };
  }, [currentPage, fetchPageData, book_id]);

  const handleImageNavigation = useCallback(
    (pageIndex, direction) => {
      const page = pageData[pageIndex];
      if (!page || !page.image_urls) return;

      const currentIndex = currentImageIndexes[pageIndex] || 0;
      const totalImages = page.image_urls.length;

      let newIndex;
      if (direction === "next") {
        newIndex = (currentIndex + 1) % totalImages;
      } else {
        newIndex = currentIndex === 0 ? totalImages - 1 : currentIndex - 1;
      }

      setCurrentImageIndexes((prev) => ({
        ...prev,
        [pageIndex]: newIndex,
      }));

      updatePageImage(page.req_id, page.job_id, newIndex);
    },
    [pageData, currentImageIndexes],
  );

  const updatePageImage = async (req_id, job_id, image_id) => {
    try {
      await axios.post(apiUrl("/api/photo/update_image"), {
        req_id,
        job_id,
        image_id,
      });
    } catch (error) {
      console.error("Error updating page image:", error);
    }
  };

  // Handle touch events for swipe functionality
  const handleTouchStart = useCallback((e, pageIndex) => {
    const touch = e.touches[0];
    e.currentTarget.dataset.startX = touch.clientX;
    e.currentTarget.dataset.startY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback(
    (e, pageIndex) => {
      const startX = parseFloat(e.currentTarget.dataset.startX);
      const startY = parseFloat(e.currentTarget.dataset.startY);
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Only trigger swipe if horizontal movement is greater than vertical
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
    // Create query params with all details for save preview page
    const saveParams = new URLSearchParams({
      request_id: request_id,
      book_id: book_id,
      name: childName,
      gender: gender || "",
      age: age || "",
      birthMonth: birthMonth || "",
    });

    return `/save-preview?${saveParams.toString()}`;
  };

  const handleUploadAnother = () => {
    // Create query params to go back to upload with all details
    const uploadParams = new URLSearchParams({
      book_id: book_id,
      name: childName,
      gender: gender || "",
      age: age || "",
      birthMonth: birthMonth || "",
    });

    return `/upload?${uploadParams.toString()}`;
  };

  const handleEmailPreview = () => {
    // Navigate to save preview page for email functionality
    const saveParams = new URLSearchParams({
      request_id: request_id,
      book_id: book_id,
      name: childName,
      gender: gender || "",
      age: age || "",
      birthMonth: birthMonth || "",
      notify: true, // Indicate this is for email preview
    });

    return `/save-preview?${saveParams.toString()}`;
  };

  // Show loading state with progress bar until pageDate is greater than first4PagesLoaded
  if (pageData.length <= first4PagesLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-grow flex items-center justify-center px-4">
          <div className="text-center max-w-md mx-auto">
            <div className="w-32 h-32 mx-auto mb-8">
              <CircularProgressbar
                value={isNaN(loadingProgress) ? 0 : loadingProgress}
                text={`${
                  isNaN(loadingProgress) ? 0 : Math.round(loadingProgress)
                }%`}
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
          </div>
        </div>
      </div>
    );
  }

  // Show pages after first 4 are loaded
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-blue-900 mb-6">
          {childName}&apos;s Book Preview
        </h1>

        <div className="space-y-12">
          <div className="text-center space-y-2 font-medium text-gray-600">
            <p className="text-xl md:text-2xl">
              ↓ Pages get shown one below the other
            </p>
            <p className="text-xl md:text-2xl">
              🔄 Swipe left/right to see different images
            </p>
          </div>
          {finalBook
            ? finalBook.map((imgUrl, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transform transition-all duration-500 ease-in-out"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-blue-900">
                      {index === 0
                        ? "Front Cover"
                        : index === finalBook.length - 1
                          ? "Back Cover"
                          : `Page ${index}`}{" "}
                    </h2>
                  </div>
                  <img
                    src={imgUrl}
                    alt={`Page ${index}`}
                    className="w-full aspect-[4/3] object-contain"
                  />
                </div>
              ))
            : pageData.map((page, pageIndex) => {
                if (!page) return null;

                const images = page.image_urls || [];
                const currentImageIndex = currentImageIndexes[pageIndex] || 0;

                return (
                  <div
                    key={pageIndex}
                    className="bg-white rounded-xl shadow-lg p-4 sm:p-6 transform transition-all duration-500 ease-in-out"
                  >
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-blue-900">
                        Page {pageIndex + 1}
                      </h2>
                      {images.length > 1 && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>
                            {currentImageIndex + 1} of {images.length}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="relative w-full rounded-lg overflow-hidden group">
                      <div
                        className="relative"
                        onTouchStart={(e) => handleTouchStart(e, pageIndex)}
                        onTouchEnd={(e) => handleTouchEnd(e, pageIndex)}
                      >
                        <img
                          src={images[currentImageIndex]}
                          alt={`Page ${pageIndex + 1} - Image ${
                            currentImageIndex + 1
                          }`}
                          className="w-full aspect-[4/3] object-contain transition-opacity duration-300"
                        />

                        {/* Navigation arrows - only show if there are multiple images */}
                        {images.length > 1 && (
                          <>
                            <button
                              onClick={() =>
                                handleImageNavigation(pageIndex, "prev")
                              }
                              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity duration-300 hover:bg-opacity-70"
                              aria-label="Previous image"
                            >
                              <ChevronLeftIcon className="h-5 w-5" />
                            </button>

                            <button
                              onClick={() =>
                                handleImageNavigation(pageIndex, "next")
                              }
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full transition-opacity duration-300 hover:bg-opacity-70"
                              aria-label="Next image"
                            >
                              <ChevronRightIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Image indicators - only show if there are multiple images */}
                      {images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                          {images.map((_, imageIndex) => (
                            <button
                              key={imageIndex}
                              onClick={() =>
                                setCurrentImageIndexes((prev) => ({
                                  ...prev,
                                  [pageIndex]: imageIndex,
                                }))
                              }
                              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                imageIndex === currentImageIndex
                                  ? "bg-white scale-125"
                                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
                              }`}
                              aria-label={`Go to image ${imageIndex + 1}`}
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <p className="mt-6 text-gray-800 text-lg font-medium text-center px-4">
                      {page.scene?.replace(
                        /{kid}/gi,
                        childName || "your child",
                      ) || `Page ${pageIndex + 1} content`}
                    </p>

                    {/* Swipe instruction for mobile */}
                    {images.length > 1 && (
                      <p className="mt-2 text-center text-sm text-gray-500 md:hidden">
                        Swipe left or right to see more images
                      </p>
                    )}
                  </div>
                );
              })}

          {}

          {isLoading && currentPage > 1 && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-lg text-gray-600">{loadingMessage}</p>
              {hasNextPage && (
                <p className="text-sm text-gray-500">Next page coming up...</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom action buttons */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white shadow-lg z-50">
        <div className="max-w-2xl mx-auto">
          {!allPagesLoaded ? (
            // Show "Email me the preview instead" while pages are still loading
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <h3 className="text-lg font-bold text-blue-900 mb-3 text-center">
                Don&apos;t have time to wait?
              </h3>
              <Link
                to={handleEmailPreview()}
                className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
              >
                Email Me The Preview Instead
              </Link>
            </div>
          ) : (
            // Show "Save Preview & Show Price" when all pages are loaded
            <Link
              to={handleSavePreview()}
              className="block w-full bg-secondary text-white text-center py-4 rounded-full text-xl font-semibold hover:bg-blue-600 transition duration-300"
            >
              Save Preview & Show Price
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default Preview;
