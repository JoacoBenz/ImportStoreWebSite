"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface StoreHeaderProps {
  storeName: string;
  onSearch: (query: string) => void;
}

export function StoreHeader({ storeName, onSearch }: StoreHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSearch(query);
  }

  return (
    <header className="sticky top-0 z-30 bg-surface-primary border-b border-brand-ice">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <Image
              src="/logo.jpeg"
              alt={storeName}
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="hidden sm:block font-heading font-bold text-brand-navy tracking-wider text-sm uppercase">
              {storeName}
            </span>
          </Link>

          {/* Desktop search */}
          <form
            onSubmit={handleSubmit}
            className="hidden sm:flex flex-1 max-w-md mx-8"
          >
            <div className="relative w-full">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  onSearch(e.target.value);
                }}
                placeholder="Buscar productos..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-ice bg-surface-secondary text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition-colors"
              />
            </div>
          </form>

          {/* Mobile search toggle */}
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="sm:hidden p-2 rounded-xl hover:bg-surface-secondary transition-colors"
          >
            <svg
              className="w-5 h-5 text-text-secondary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <form onSubmit={handleSubmit} className="sm:hidden pb-3">
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
              }}
              placeholder="Buscar productos..."
              autoFocus
              className="w-full px-4 py-2 rounded-xl border border-brand-ice bg-surface-secondary text-base sm:text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand-teal/30"
            />
          </form>
        )}
      </div>
    </header>
  );
}
