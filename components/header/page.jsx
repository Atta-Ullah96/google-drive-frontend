"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md"></div>
            <span className="text-lg font-bold">DriveClone</span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-black">
              Home
            </Link>
            <a href="/features" className="text-gray-600 hover:text-black">
              Features
            </a>
            <a href="/pricing" className="text-gray-600 hover:text-black">
              Pricing
            </a>

            {/* Login Button */}
            <Link
              href="/auth/login"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <Link
              href="/"
              className="block text-gray-600 hover:text-black"
            >
              Home
            </Link>

            <a
              href="/features"
              className="block text-gray-600 hover:text-black"
            >
              Features
            </a>

            <a
              href="/pricing"
              className="block text-gray-600 hover:text-black"
            >
              Pricing
            </a>

            <Link
              href="/auth/login"
              className="block bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}