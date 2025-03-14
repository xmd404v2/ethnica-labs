import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Tagline */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Ethnica</h3>
            <p className="text-sm text-muted-foreground">
              We help humans support their tribe &amp; grow local economies.
            </p>
            <div className="flex space-x-4 text-sm">
              <Link href="#" className="hover:underline">
                #shoplocal
              </Link>
              <Link href="#" className="hover:underline">
                #votewithdollars
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-base font-semibold mb-4">Quick Links</h4>
            <nav className="flex flex-col space-y-2">
              <Link 
                href="/about" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link 
                href="/contact" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Contact
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Privacy Policy
              </Link>
              <Link 
                href="/terms" 
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Terms of Service
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-base font-semibold mb-4">Get in Touch</h4>
            <p className="text-sm text-muted-foreground">
              Have questions or suggestions? Reach out to us at{" "}
              <a
                href="mailto:team@ethni.ca"
                className="text-primary hover:underline"
              >
                team@ethni.ca
              </a>
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Ethnica Labs. All rights reserved.
        </div>
      </div>
    </footer>
  );
} 