import React from 'react';

export default function Header() {
  return (
    <header className="w-full h-16 flex items-center px-6 bg-background border-b border-border">
      <span className="font-bold text-xl">ObservaX</span>
      {/* Add navigation, user info, etc. here if needed */}
    </header>
  );
}
