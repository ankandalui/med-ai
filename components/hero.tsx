"use client";

import { useTranslation } from "react-i18next";
import { PointerHighlight } from "@/components/ui/pointer-highlight";

export function Hero() {
  const { t } = useTranslation();
  return (
    <section
      className="min-h-screen flex items-center justify-center relative bg-cover bg-no-repeat bg-scroll bg-[40%_center] md:bg-center"
      style={{
        backgroundImage: "url('/images/bg.png')",
      }}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
          {/* Main Heading with PointerHighlight */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                The future of healthcare is
              </div>
              <div className="flex justify-center mt-2">
                <PointerHighlight containerClassName="mt-6">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI-powered
                  </span>
                </PointerHighlight>
              </div>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto px-4">
              {t("homepage.subtitle")}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 items-center flex-col sm:flex-row pt-4">
            <a
              className="w-full sm:w-auto rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 font-medium text-sm sm:text-base h-12 sm:h-14 px-8 shadow-lg"
              href="/diagnosis"
            >
              {t("homepage.getStarted")}
            </a>
            <a
              className="w-full sm:w-auto rounded-full border border-input hover:bg-accent hover:text-accent-foreground transition-all duration-300 hover:scale-105 flex items-center justify-center font-medium text-sm sm:text-base h-12 sm:h-14 px-8"
              href="/about"
            >
              {t("homepage.learnMore")}
            </a>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center">
          <div className="w-1 h-3 bg-muted-foreground rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}
