"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Map, Search, Star, User } from "lucide-react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface NavLink {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const navLinks: NavLink[] = [
  {
    path: "/map",
    label: "Map",
    icon: <Map className="h-5 w-5 mr-2" />,
  },
  {
    path: "/search",
    label: "Search",
    icon: <Search className="h-5 w-5 mr-2" />,
  },
  {
    path: "/reviews",
    label: "Reviews",
    icon: <Star className="h-5 w-5 mr-2" />,
  },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <Link 
          href="/" 
          className="flex items-center space-x-2 font-bold text-xl"
        >
          <span className="hidden sm:inline-block text-xl md:text-2xl">Ethnica</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-6 items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                pathname === link.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth and Theme Buttons */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/signin">
            <Button variant="outline" size="sm" className="hidden md:flex items-center">
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="hidden md:flex">
              Sign Up
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Ethnica</SheetTitle>
                <SheetDescription>
                  Support your tribe & grow local economies
                </SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                      pathname === link.path
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                <Link
                  href="/signin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center text-sm font-medium text-muted-foreground"
                >
                  <User className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
} 