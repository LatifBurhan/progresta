"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, HeartHandshake, Briefcase, Sparkles, Building2, Wallet, CalendarClock, ShieldCheck, Rocket } from "lucide-react";

export default function SplashScreen() {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const slides = [
    {
      id: 1,
      title: "Selamat datang di Progresta",
      subtitle: "Apa itu Progresta?",
      desc: "Platform manajemen tim yang menyatukan semua kebutuhan kerja kamu dalam satu tempat.",
      color: "blue",
      icon: (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl shadow-2xl shadow-blue-200 flex items-center justify-center border border-slate-100 rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
            <Building2 className="w-16 h-16 sm:w-20 sm:h-20 text-blue-600" />
          </div>
          <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-12 h-12 bg-emerald-100 rounded-xl shadow-lg flex items-center justify-center border border-emerald-50 rotate-[15deg] animate-bounce-slow">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div
            className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 w-14 h-14 bg-amber-100 rounded-2xl shadow-lg flex items-center justify-center border border-amber-50 rotate-[-10deg] animate-bounce-slow"
            style={{ animationDelay: "1s" }}
          >
            <Briefcase className="w-7 h-7 text-amber-600" />
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Semua ada di sini",
      subtitle: "Penggunaan Singkat",
      desc: "Buat laporan harian, ajukan cuti atau lembur, dan cek slip gaji kamu — cukup dari genggaman tangan.",
      color: "emerald",
      icon: (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-3xl shadow-2xl shadow-emerald-200 flex items-center justify-center border border-slate-100 rotate-[5deg] hover:rotate-0 transition-transform duration-500">
            <CalendarClock className="w-16 h-16 sm:w-20 sm:h-20 text-emerald-600" />
          </div>
          <div className="absolute top-4 left-4 sm:top-8 sm:left-8 w-12 h-12 bg-rose-100 rounded-xl shadow-lg flex items-center justify-center border border-rose-50 rotate-[-15deg] animate-bounce-slow">
            <HeartHandshake className="w-6 h-6 text-rose-600" />
          </div>
          <div
            className="absolute bottom-4 right-4 sm:bottom-8 sm:right-8 w-14 h-14 bg-indigo-100 rounded-2xl shadow-lg flex items-center justify-center border border-indigo-50 rotate-[10deg] animate-bounce-slow"
            style={{ animationDelay: "1s" }}
          >
            <Wallet className="w-7 h-7 text-indigo-600" />
          </div>
        </div>
      ),
    },
    {
      id: 3,
      title: "Kerja lebih teratur, hidup lebih tenang",
      subtitle: "Motivasi",
      desc: "Progresta hadir bukan untuk mempersulit, tapi untuk membantu kamu fokus pada hal yang penting.",
      color: "amber",
      icon: (
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="relative z-10 w-32 h-32 sm:w-40 sm:h-40 bg-white rounded-full shadow-2xl shadow-amber-200 flex items-center justify-center border border-slate-100 hover:scale-105 transition-transform duration-500">
            <Sparkles className="w-16 h-16 sm:w-20 sm:h-20 text-amber-500" />
          </div>
          {/* Decorative smaller circles */}
          <div className="absolute top-8 right-8 w-8 h-8 bg-blue-400 rounded-full shadow-lg animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute bottom-12 left-6 w-6 h-6 bg-rose-400 rounded-full shadow-lg animate-ping" style={{ animationDuration: "2s" }} />
        </div>
      ),
    },
  ];

  const getColorClasses = (color: string) => {
    if (color === "blue") return "bg-blue-100 text-blue-600";
    if (color === "emerald") return "bg-emerald-100 text-emerald-600";
    if (color === "amber") return "bg-amber-100 text-amber-600";
    return "bg-slate-100 text-slate-600";
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((curr) => curr + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = () => {
    // Navigasi ke halaman login ketika onboarding selesai / di-skip
    router.push("/login");
  };

  // Swipe handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEndHandler = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentSlide < slides.length - 1) {
      setCurrentSlide((curr) => curr + 1);
    }
    if (isRightSwipe && currentSlide > 0) {
      setCurrentSlide((curr) => curr - 1);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-between overflow-hidden relative selection:bg-blue-500/30 group/splash">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "24px 24px" }}></div>

      {/* Desktop Navigation Click Areas */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-1/4 z-30 cursor-pointer group/prev" onClick={() => currentSlide > 0 && setCurrentSlide(currentSlide - 1)}>
        <div className="absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/50 backdrop-blur-sm border border-slate-200 flex items-center justify-center opacity-0 group-hover/prev:opacity-100 transition-all duration-300 shadow-lg">
          <ChevronRight className="w-6 h-6 text-slate-400 rotate-180" />
        </div>
      </div>
      <div className="hidden md:block absolute inset-y-0 right-0 w-1/4 z-30 cursor-pointer group/next" onClick={handleNext}>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover/next:opacity-100 transition-all duration-300 shadow-xl shadow-blue-200">
          <ChevronRight className="w-6 h-6 text-white" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col justify-center relative z-10 px-6 sm:px-12 pt-12 pb-6" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEndHandler}>
        <div className="w-full max-w-md mx-auto flex flex-col items-center text-center h-full justify-center">
          {/* Logo Top */}
          <div className="absolute top-10 left-0 right-0 flex justify-center animate-in fade-in slide-in-from-top-4 duration-700 z-50">
            <img src="/progresta.png" alt="Progresta Logo" className="h-10 sm:h-12 drop-shadow-md" />
          </div>

          {/* Carousel Track */}
          <div className="relative w-full h-[65vh] flex items-center justify-center mt-12">
            {slides.map((slide, index) => {
              const isActive = index === currentSlide;
              const isPrev = index < currentSlide;
              const isNext = index > currentSlide;

              let transformClass = "translate-x-0 opacity-100 scale-100 z-20";
              if (isPrev) transformClass = "-translate-x-[120%] opacity-0 scale-95 z-0 pointer-events-none";
              if (isNext) transformClass = "translate-x-[120%] opacity-0 scale-95 z-0 pointer-events-none";

              return (
                <div key={slide.id} className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${transformClass}`}>
                  {/* Icon Area */}
                  <div className="mb-10 sm:mb-16">{slide.icon}</div>

                  {/* Text Area */}
                  <div className="space-y-4 max-w-sm px-2">
                    <span className={`inline-block px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] ${getColorClasses(slide.color)} mb-2 shadow-sm`}>{slide.subtitle}</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-[1.15]">{slide.title}</h2>
                    <p className="text-sm sm:text-base text-slate-500 font-medium leading-relaxed px-4">{slide.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Navigation Area */}
      <div className="w-full max-w-md mx-auto px-8 pb-12 pt-4 relative z-20">
        {/* Progress Indicators */}
        <div className="flex justify-center gap-2.5 mb-10">
          {slides.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all duration-500 ease-out cursor-pointer ${idx === currentSlide ? "w-10 bg-blue-600 shadow-md shadow-blue-200" : "w-2 bg-slate-200 hover:bg-slate-300"}`}
              onClick={() => setCurrentSlide(idx)}
              role="button"
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Action Buttons / Swipe Indicator */}
        <div className="flex flex-col items-center justify-center gap-4 min-h-[56px]">
          {currentSlide === slides.length - 1 ? (
            <Button
              onClick={handleFinish}
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 animate-in fade-in zoom-in duration-500"
            >
              Mulai Sekarang <Rocket className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <div className="flex flex-col items-center gap-4 w-full">
              {/* Desktop Next Button */}
              <Button
                onClick={handleNext}
                variant="outline"
                className="hidden md:flex w-full h-14 border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-2 group/btn"
              >
                Lanjutkan <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
              </Button>

              {/* Mobile Swipe Indicator */}
              <div className="flex items-center gap-2 text-slate-400 animate-pulse md:hidden">
                <ChevronRight className="w-4 h-4 opacity-50" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Swipe untuk melanjutkan</span>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
