'use client'
import { Phone, Heart } from 'lucide-react';
import { useEffect } from 'react';
import { VERSION, BUILD_DATE } from "@/lib/version";

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
  return (
    <footer className="border-t border-border bg-background/50 backdrop-blur-sm mt-12 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Site Version */}
          <div className="text-sm text-muted-foreground">
            Site Version: <span className="font-semibold text-foreground">{version} -  {VERSION} - {BUILD_DATE}</span>
          </div>

          {/* Built By Info */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="w-4 h-4 text-red-500" />
            <span>Built by</span>
            <span className="font-semibold text-foreground">Akash Singh</span>
          </div>

          {/* Contact */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="w-4 h-4" />
            <a href="mail:akashs@duck.com" className="font-semibold">
              akashs@duck.com
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground">
          <p>MCQ Test Series Viewer - All Rights Reserved</p>
        </div>
        <div className="mt-6 pt-4 border-t border-border/50 text-center text-xs text-muted-foreground flex flex-col items-center gap-3">
          <p>Disclaimer: This website is an independent project and is not affiliated with any coaching institute. All data is sourced from publicly available information.</p>
          <p>Data Source: The questions and test details are sourced from publicly available data and are intended for educational purposes only.</p>
          <p>Copyright: All content is the property of their respective owners. This site is for practice and revision purposes only and is a private property</p>
          



        </div>
      </div>
    </footer>
  );
}
