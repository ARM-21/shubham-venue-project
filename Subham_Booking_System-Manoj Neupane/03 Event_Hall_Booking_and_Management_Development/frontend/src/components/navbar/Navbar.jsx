'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Action from '@/components/nav-action/Action.jsx';
import { useRouter } from 'next/navigation';
import { House, Info, Menu, X, Images, Contact, LogIn, LogOut } from "lucide-react";


const actions = [
  { name: 'Home', id: 'home', icon: House },
  { name: 'About', id: 'about', icon: Info },
  { name: 'Gallery', id: 'gallery', icon: Images },
  // { name: 'Services', id: 'services', Icon: '/assets/nav-action-icons/services.svg' },
  { name: 'Contact', id: 'contact', icon: Contact },
];

export default function Navbar() {
  const [hamActive, setHamActive] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      e.stopPropagation()
      if (menuRef.current && !menuRef.current.contains(e.target) && hamActive) {
        console.log("ham is setting off")
        setHamActive(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [hamActive]);

  return (
    <div className=" sticky top-0 w-full bg-[#250815] backdrop-blur-md shadow-lg z-50 border-b border-gray-200">
      <nav className="flex justify-between items-center px-4 sm:px-8 py-4 max-w-7xl mx-auto" ref={menuRef}>
        {/* Logo section */}
        <div className="relative">
          <Link href="/" className="flex items-center">
            <Image
              src="/assets/business-icons/video.gif"
              alt="Shubham Party Palace Logo"
              width={48}
              height={48}
              className=""
            />
            <Image
              src="/assets/business-icons/shubham.png"
              alt="Shubham Party Palace Logo"
              width={48}
              height={48}
              className="rounded-full absolute opacity-5"
            />
          </Link>
        </div>

        {/*  Links */}
        <ul
          className={`
    min-[850px]:flex min-[850px]:items-center min-[850px]:space-x-4 md:space-x-8

    max-[850px]:flex max-[850px]:flex-col max-[850px]:absolute max-[850px]:top-[50%] max-[850px]:left-[50%] max-[850px]:transform max-[850px]:-translate-x-[50%] max-[850px]:translate-y-[25%] max-[850px]:w-[90%] max-[850px]:bg-white max-[850px]:shadow-md max-[850px]:p-4

    transition-all duration-300 ease-in-out
    ${hamActive ? "max-[850px]:opacity-100 max-[850px]:pointer-events-auto" : "max-[850px]:opacity-0 max-[850px]:pointer-events-none"}
  `}>
          {/* close menu */}
          <Action name="close" id="close" className="absolute min-[850px]:hidden  mb-4 p-2 rounded-lg transition-colors right-0 -top-5" icon={X} onClick={() => setHamActive(false)} />
          <span className=" w-full bg-black border-1 " />
          {actions.map((action) => (
            <Action key={action.id} {...action} onClick={() => setHamActive(false)} />
          ))}

          <span className='flex items-center space-x-4'>
            <Action name="login" id="login" icon={LogIn} onClick={() => {
              console.log("logging in");
              setHamActive(false)
              // router.push("/login")
            }} />
            <Action name="signup" id="signup" icon={LogOut} onClick={() => {
              console.log("signing in");
              setHamActive(false)
              // router.push("/signup")
            }} />
          </span>
        </ul>



        {/* Hamburger menu */}
        <button
          className="min-[850px]:hidden flex items-center justify-center p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            setHamActive((prev) => !prev);
          }}
          aria-label="Toggle menu"
        >
          <Menu size={28} />
          {/* <Image src="/assets/nav-action-icons/menu.svg" alt="menu" width={28} height={28} /> */}
        </button>
      </nav>
    </div>
  );
}