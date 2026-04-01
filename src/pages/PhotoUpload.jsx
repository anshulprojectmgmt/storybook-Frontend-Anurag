import { useCallback, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import useChildStore from "../store/childStore";
import { PhotoIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { apiUrl } from "../config/api";

const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

function PhotoUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // Get all query parameters
  const book_id = queryParams.get("book_id");
  const page_count = queryParams.get("page_count");
  const requiredPhotoCount = 2;
  const childName =
    queryParams.get("name") || useChildStore((state) => state.childName);
  const gender = queryParams.get("gender");
  const age = queryParams.get("age");
  const birthMonth = queryParams.get("birthMonth");

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadStatus, setUploadStatus] = useState([]);
  const [req_id, setRequestId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleImageUpload = async (file, request_id) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      // First API call to get file URL

      const response = await axios.post(
        apiUrl("/api/photo/original_image"),
        formData,
      );
      const { file_url } = await response.data;

      // Second API call to add photo to queue

      const queueResponse = await axios.post(
        apiUrl("/api/photo/add_photo_to_queue"),
        {
          file_name: file.name,
          file_url,
          request_id,
        },
      );

      const { photo_id } = await queueResponse.data;

      return { success: true, photo_id };
    } catch (error) {
      console.error("Upload error:", error);
      return { success: false, error: error.message };
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles) => {
      const existingKeys = new Set(uploadedFiles.map(getFileKey));
      const uniqueIncomingFiles = acceptedFiles.filter(
        (file) => !existingKeys.has(getFileKey(file)),
      );

      const remainingSlots = Math.max(
        0,
        requiredPhotoCount - uploadedFiles.length,
      );
      const filesToAdd = uniqueIncomingFiles.slice(0, remainingSlots);

      if (!filesToAdd.length) {
        setUploadMessage(
          uploadedFiles.length >= requiredPhotoCount
            ? `You already uploaded ${requiredPhotoCount} photos.`
            : "Please add a different photo.",
        );
        return;
      }

      if (uniqueIncomingFiles.length > filesToAdd.length) {
        setUploadMessage(`Only ${requiredPhotoCount} photos are allowed.`);
      } else {
        setUploadMessage("");
      }

      const request_id =
        req_id || `req_${Math.random().toString(36).substr(2, 9)}`;

      if (!req_id) {
        setRequestId(request_id);
      }

      const startIndex = uploadedFiles.length;
      setUploadedFiles((prev) => [...prev, ...filesToAdd]);
      setIsUploading(true);

      for (let i = 0; i < filesToAdd.length; i++) {
        const file = filesToAdd[i];
        const result = await handleImageUpload(file, request_id);

        setUploadStatus((prev) => {
          const next = [...prev];
          next[startIndex + i] = result;
          return next;
        });
      }

      setIsUploading(false);
    },
    [req_id, requiredPhotoCount, uploadedFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png"],
    },
    multiple: true,
    maxFiles: requiredPhotoCount,
  });

  const handleShowPreview = () => {
    if (uploadStatus.every((status) => status.success) && req_id) {
      // Create query params with all details for preview page
      const previewParams = new URLSearchParams({
        request_id: req_id,
        book_id: book_id, // for now passing constant book_id
        name: childName,
        gender: gender || "",
        age: age || "",
        birthMonth: birthMonth || "",
        page_count: page_count,
        min_photos: requiredPhotoCount,
      });

      navigate(`/preview?${previewParams.toString()}`);
    }
  };

  // Check if all photos are successfully uploaded
  const allPhotosUploaded =
    uploadedFiles.length === requiredPhotoCount &&
    uploadStatus.length === uploadedFiles.length &&
    uploadStatus.every((status) => status.success) &&
    !isUploading;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex items-center justify-center mb-6">
          <BookOpenIcon className="h-12 w-12 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-center mb-2 text-gray-800">
          {childName}'s Story Photos
        </h2>
        <p className="text-center text-lg mb-8 text-gray-600">
          Upload exactly {requiredPhotoCount} photos of {childName}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-6 mb-8 items-stretch">
          {/* SINGLE GUIDELINE IMAGE */}
          <div className="bg-blue-50 rounded-xl p-2 sm:p-3 flex flex-col">
            <h3 className="font-semibold mb-3 text-gray-800 text-center text-lg">
              Photo Guidelines
            </h3>

            <div className="relative w-full overflow-hidden rounded-lg border border-blue-200 bg-white shadow-sm">
              <img
                src="/guidelines/instruction.jpg"
                alt="Photo upload guidelines"
                className="w-full h-fit md:h-fit object-contain"
              />
            </div>
          </div>

          {/* UPLOAD AREA (UNCHANGED) */}
          <div
            {...getRootProps()}
            className={`border-3 border-dashed border-blue-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 transition duration-300 relative
      bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px]
      ${isDragActive ? "border-blue-400 bg-blue-50" : ""}
    `}
          >
            <input {...getInputProps()} />

            <div className="space-y-4">
              <PhotoIcon className="h-12 w-12 mx-auto text-blue-400" />

              <p className="text-lg font-medium text-gray-700">
                {isDragActive
                  ? "Drop your photos here"
                  : "Drop your photos here"}
              </p>

              <p className="text-sm text-gray-500">or click to select files</p>

              <p className="text-xs text-gray-400">
                Exactly {requiredPhotoCount} photos required for this book
              </p>

              <p className="text-xs text-blue-500">
                You can upload both together or add them one by one.
              </p>
            </div>
          </div>
        </div>

        {uploadMessage && (
          <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-blue-700">
            {uploadMessage}
          </div>
        )}

        {uploadedFiles.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">Selected Photos:</h4>
            <div className="flex gap-2 flex-wrap">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className={`bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2`}
                >
                  <span>{file.name}</span>
                  {isUploading && index >= uploadStatus.length && (
                    <span className="text-blue-500">Uploading...</span>
                  )}
                  {uploadStatus[index] && (
                    <span
                      className={
                        uploadStatus[index].success
                          ? "text-green-500"
                          : "text-red-500"
                      }
                    >
                      {uploadStatus[index].success ? "Success" : "Failed"}
                    </span>
                  )}
                </div>
              ))}
            </div>
            {isUploading && (
              <p className="text-sm text-blue-600 mt-2">Uploading photos...</p>
            )}
          </div>
        )}

        <button
          onClick={handleShowPreview}
          disabled={!allPhotosUploaded}
          className={`w-full py-3 px-6 rounded-full text-lg font-semibold transition duration-300 ${
            !allPhotosUploaded
              ? "bg-gray-300 cursor-not-allowed text-gray-500"
              : "bg-secondary text-white hover:bg-blue-600"
          }`}
        >
          {isUploading
            ? "Uploading Photos..."
            : `Show ${childName}'s Book Preview`}
        </button>
      </div>
    </div>
  );
}

export default PhotoUpload;
