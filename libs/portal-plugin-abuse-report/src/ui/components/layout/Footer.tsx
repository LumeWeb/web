import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8 mt-auto">
      <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm tracking-wide text-foreground">
          © 2024 abuse.webapp. All rights reserved
        </p>
        <div className="flex gap-6 text-sm tracking-wide text-foreground">
          <a className="hover:text-primary transition-colors" href="#">
            Terms of Use
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            Privacy Policy
          </a>
          <a className="hover:text-primary transition-colors" href="#">
            DMCA Notice
          </a>
        </div>
      </div>
    </footer>
  );
}
