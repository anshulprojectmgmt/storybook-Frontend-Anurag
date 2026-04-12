import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#061434] text-blue-50 px-8 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(56,189,248,0.2),transparent_35%),radial-gradient(circle_at_80%_70%,rgba(59,130,246,0.2),transparent_40%)]" />
      <div className="relative max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <div className="flex items-center gap-4 mb-6">
            <div className="rounded-2xl bg-white/12 p-1.5 border border-white/15">
              <img
                src="/guidelines/superdadlogo.png"
                alt="Storybook logo"
                className="h-14 w-14 rounded-[0.9rem] object-cover"
              />
            </div>
            <h3 className="text-3xl font-black">Storybook</h3>
          </div>
          <nav className="space-y-3">
            <Link to="/about" className="block text-blue-100 hover:text-cyan-300 transition-colors">
              About Us
            </Link>
            <Link to="/contact" className="block text-blue-100 hover:text-cyan-300 transition-colors">
              FAQs and Contact
            </Link>
            <Link to="/books" className="block text-blue-100 hover:text-cyan-300 transition-colors">
              Books for Kids
            </Link>
          </nav>
        </div>

        <div className="flex justify-center items-center">
          <div className="rounded-3xl bg-white/10 border border-white/20 px-6 py-6 backdrop-blur-md text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200 mb-2">Made with care</p>
            <p className="text-xl font-bold">for magical childhood memories</p>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black mb-4">Our Mission</h3>
          <p className="text-blue-100 mb-6 leading-relaxed">
            We create personalized books that make children feel seen, celebrated, and inspired every time they turn a page.
          </p>
          <div className="flex space-x-3">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-[#05122f] transition-colors"
            >
              <span className="sr-only">Facebook</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
              </svg>
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full bg-white/10 hover:bg-cyan-400 hover:text-[#05122f] transition-colors"
            >
              <span className="sr-only">Instagram</span>
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="relative max-w-7xl mx-auto mt-12 pt-6 border-t border-blue-300/20 text-sm text-blue-200">
        <p>Copyright {new Date().getFullYear()} Storybook. All rights reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
