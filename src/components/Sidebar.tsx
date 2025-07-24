'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogOut, UserIcon, Building2 } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/rooms', label: 'Rooms', icon: Home },
  { href: '/team', label: 'Teams', icon: Building2 },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="w-64 h-screen flex flex-col p-6 font-mono select-none
                 bg-gradient-to-b from-[#1a1a1a] via-[#121212] to-[#111111]
                 border-r border-gray-800 shadow-md"
      style={{ flexShrink: 0 }}
    >
      <h2 className="text-3xl font-extrabold mb-10 tracking-tight
                    bg-gradient-to-r from-blue-500/80 to-purple-600/80
                     bg-clip-text text-transparent"
      >
        Dashboard
      </h2>

      <nav className="flex flex-col flex-grow space-y-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-200 cursor-pointer',
                'text-gray-400 text-base font-semibold',
                'hover:bg-[#2a2a2a] hover:text-white hover:shadow-md',
                isActive
                  ? 'bg-gradient-to-r from-blue-700 to-purple-700 text-white shadow-inner'
                  : '',
                'focus:outline-none'
              )}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </Link>
          );
        })}

        {/* Push logout to bottom */}
        <div className="flex-grow" />

        <button
          type="button"
          onClick={() => {
            // TODO: Add logout logic here
          }}
          className="flex items-center gap-2 px-4 py-3 rounded-lg
                     text-gray-400 hover:text-red-500 hover:bg-[#2a1a1a]
                     transition-colors duration-200 text-md font-mono
                     focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
