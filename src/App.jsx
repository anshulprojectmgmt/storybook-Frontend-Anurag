import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import BooksList from "./pages/BooksList";
import ChildDetails from "./pages/ChildDetails";
import PhotoUpload from "./pages/PhotoUpload";
import Preview from "./pages/Preview";
import SavePreview from "./pages/SavePreview";
import Purchase from "./pages/Purchase";
import SceneUploader from "./components/SceneUploader";
import Frontpage from "./pages/Frontpage";
import AboutUs from "./pages/AboutUs";
import Contact from "./pages/Contact";
import Checkout from "./pages/Checkout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { CouponProvider } from "./context/CouponContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <CouponProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <main className="flex-grow ">
              <Routes>
                {/* <Route path="/" element={<BookSelection />} /> */}
                <Route path="/" element={<Frontpage />} />
                <Route path="/books" element={<BooksList />} />
                <Route path="/details" element={<ChildDetails />} />
                <Route path="/upload" element={<PhotoUpload />} />
                <Route path="/preview" element={<Preview />} />
                <Route path="/save-preview" element={<SavePreview />} />
                <Route path="/purchase" element={<Purchase />} />
                <Route path="/sceneUpload" element={<SceneUploader />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </CouponProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
