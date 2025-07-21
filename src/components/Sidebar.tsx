'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, LogOut, UserIcon, Building2 } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { href: '/rooms', label: 'Rooms', icon: Home },
  { href: '/teams', label: 'Teams', icon: Building2 },
  { href: '/profile', label: 'Profile', icon: UserIcon },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#111] border-r border-gray-800 hidden md:flex flex-col min-h-screen p-6">
      <h2 className="text-xl font-bold mb-10 tracking-tight">Dashboard</h2>

      {/* Make this flex-grow to fill remaining space */}
      <nav className="flex flex-col flex-grow space-y-4">
        {navItems.map(({ href, label, icon: Icon }) => (
            <Link
                key={href}
                href={href}
                className={clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 text-base font-medium transition-all duration-200 ease-in-out',
                'hover:bg-[#2a2a2a] hover:text-white hover:shadow-md',
                pathname?.startsWith(href)
                    ? 'bg-[#1c1c1c] text-white font-medium shadow-inner'
                    : '',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1'
                )}
                tabIndex={0} // ensure keyboard navigable
            >
                <Icon className="w-6 h-6 flex-shrink-0" />
                {label}
            </Link>
        ))}

        {/* Spacer div pushes logout to bottom */}
        <div className="flex-grow" />
        
        <button
          className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition text-sm mt-auto"
          onClick={() => {
            // TODO: Add logout logic here
          }}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </nav>
    </aside>
  );
}
