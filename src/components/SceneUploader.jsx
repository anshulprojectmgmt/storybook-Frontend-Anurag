import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { apiUrl } from "../config/api";

function SceneUploader() {
  const [searchParams] = useSearchParams();
  const book_id = searchParams.get("book_id");
  const book_name = searchParams.get("book_name");
  const page_count = parseInt(searchParams.get("page_count") || 0);

  // Use a single state array to manage all page data
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize the state with empty fields for each page
  useEffect(() => {
    if (page_count > 0) {
      setPages(
        Array.from({ length: page_count }, () => ({
          scene: "",
          prompt: "", // Added prompt, as it's in your schema
          file: null,
        }))
      );
    }
  }, [page_count]);

  // A single handler to update any field for any page
  const handlePageChange = (index, field, value) => {
    const newPages = [...pages];
    newPages[index] = { ...newPages[index], [field]: value };
    setPages(newPages);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("book_id", book_id);
    formData.append("book_name", book_name);

    // Separate the data for the backend
    const scenes = pages.map((p) => p.scene);
    const prompts = pages.map((p) => p.prompt);

    // Stringify text arrays
    formData.append("scenes", JSON.stringify(scenes));
    formData.append("prompts", JSON.stringify(prompts));

    // Append each file
    pages.forEach((page) => {
      if (page.file) {
        formData.append("images", page.file);
      }
    });

    try {
      // Send to your backend route
      let data = await axios.post(
        apiUrl("/api/scene/bulk-upload"),
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(data);
      alert("All scenes uploaded successfully!");
      // Optionally redirect
    } catch (error) {
      console.error("Error uploading scenes:", error);
      alert("An error occurred. Check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  if (page_count === 0) {
    return <div>Error: Missing book details or page count.</div>;
  }

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h1>Upload Scenes for: {book_name}</h1>
      <form onSubmit={handleSubmit}>
        {pages.map((page, index) => (
          <div
            key={index}
            style={{
              border: "1px solid #ccc",
              padding: "15px",
              margin: "15px 0",
            }}
          >
            <h3>Page {index + 1}</h3>
            <div style={{ marginBottom: "10px" }}>
              <label>Scene (Caption):</label>
              <br />
              <input
                type="text"
                value={page.scene}
                onChange={(e) =>
                  handlePageChange(index, "scene", e.target.value)
                }
                required
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: "10px" }}>
              <label>Prompt:</label>
              <br />
              <input
                type="text"
                value={page.prompt}
                onChange={(e) =>
                  handlePageChange(index, "prompt", e.target.value)
                }
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label>Image:</label>
              <br />
              <input
                type="file"
                accept="image/jpeg,image/png"
                onChange={(e) =>
                  handlePageChange(index, "file", e.target.files[0])
                }
                required
              />
            </div>
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          {isLoading ? "Uploading..." : "Submit All Scenes"}
        </button>
      </form>
    </div>
  );
}

export default SceneUploader;
