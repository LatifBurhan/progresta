"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAction } from "@/app/actions/auth-actions";
import { Eye, EyeOff, Lock, Mail, Rocket, ShieldCheck, HelpCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    { title: "Monitor Progres", desc: "Pantau setiap detak aktivitas proyek dalam satu genggaman." },
    { title: "Absensi Otomatis", desc: "Sistem validasi lokasi presisi untuk efisiensi tim lapangan." },
    { title: "Laporan Real-time", desc: "Data akurat langsung dari lapangan ke meja kerja Anda." },
  ];

  useEffect(() => {
    fetch("/api/auth/check")
      .then((res) => res.json())
      .then((data) => {
        data.authenticated ? router.push("/dashboard") : setChecking(false);
      })
      .catch(() => setChecking(false));

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [router, slides.length]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const result = await loginAction(null, formData);
      if (result.success) {
        result.pending ? router.push("/waiting-room") : router.push("/dashboard");
        router.refresh();
      } else if (result.message) {
        setError(result.message);
      }
    } catch {
      setError("Sistem sibuk, coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
        <div className="relative z-10 w-full h-full bg-white rounded-2xl shadow-xl shadow-blue-100 flex items-center justify-center border border-slate-100 animate-bounce-slow">
          <img src="/progresta.png" alt="Progresta" className="w-12 h-12 object-contain" />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2">Menyiapkan Ruang Kerja</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-50 selection:bg-blue-500/30">
      {/* LEFT SIDE: Hero Section */}
      <div className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-screen p-8 pt-12 pb-24 lg:p-16 flex flex-col justify-center items-center lg:items-start text-center lg:text-left overflow-hidden bg-white border-r border-slate-100">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-slate-50 z-0" />
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-blue-400/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[-10%] w-72 h-72 bg-emerald-400/10 rounded-full blur-[80px] animate-pulse delay-700" />

        {/* Subtly patterned background */}
        <div className="absolute inset-0 opacity-[0.03] z-0" style={{ backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)", backgroundSize: "32px 32px" }}></div>

        <div className="relative z-10 w-full max-w-lg flex flex-col h-full">
          {/* Logo Group */}
          <div className="flex flex-col items-center lg:items-start gap-6 mb-12 animate-in fade-in slide-in-from-top-8 duration-700">
            {/* Progresta Logo (Main) */}
            <div className="flex flex-col items-center lg:items-start gap-4">
              <div className="relative h-20 w-auto flex items-center justify-center p-3 bg-white rounded-[2rem] shadow-xl shadow-blue-100/50 border border-slate-100 animate-bounce-slow">
                <img src="/progresta.png" alt="Logo Progresta" className="h-full w-auto object-contain drop-shadow-sm" />
              </div>
              <div className="flex flex-col text-center lg:text-left mt-2">
                <span className="text-3xl font-black text-slate-800 tracking-tighter">PROGRESTA</span>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-[0.2em]">Management System</span>
              </div>
            </div>

            {/* 3 Company Logos Below */}
            <div className="flex items-center gap-3">
              <div className="h-10 bg-white rounded-xl p-2 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <img src="/alwustho.png" alt="Logo Al-Wustho" className="h-full w-auto object-contain" />
              </div>
              <div className="h-10 bg-white rounded-xl p-2 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <img src="/elfan.jfif" alt="Logo Elfan" className="h-full w-auto object-contain rounded-md" />
              </div>
              <div className="h-10 bg-white rounded-xl p-2 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all">
                <img src="/ufuk.jfif" alt="Logo Ufuk" className="h-full w-auto object-contain rounded-md" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center flex-1 w-full">
            {/* Sliding Carousel Content */}
            <div className="w-full overflow-hidden relative rounded-xl">
              <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${activeSlide * 100}%)` }}>
                {slides.map((slide, i) => (
                  <div key={i} className="w-full shrink-0 flex flex-col items-center lg:items-start pb-4">
                    <h1 className="text-3xl lg:text-5xl font-black text-slate-900 leading-[1.1] mb-4 tracking-tight">{slide.title}</h1>
                    <p className="text-slate-500 text-sm lg:text-lg max-w-sm font-medium leading-relaxed text-center lg:text-left">{slide.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6 justify-center lg:justify-start">
              {slides.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-700 ${activeSlide === i ? "w-12 bg-blue-600 shadow-lg shadow-blue-200" : "w-3 bg-slate-200"}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="relative w-full lg:w-1/2 flex flex-col justify-center bg-slate-50 z-20 -mt-10 lg:mt-0 lg:min-h-screen">
        <div className="bg-slate-50 rounded-[40px_40px_0_0] lg:rounded-none p-6 py-12 lg:p-20 flex flex-col justify-center animate-in slide-in-from-bottom-12 lg:slide-in-from-right-12 duration-1000 delay-150 shadow-[0_-20px_40px_rgba(0,0,0,0.05)] lg:shadow-none">
          <div className="w-full max-w-md mx-auto">
            {/* White card container for the form */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
              <div className="mb-10 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 text-blue-600 mb-4 shadow-inner">
                  <Lock className="w-7 h-7" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Login Secure</h2>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.2em]">Otorisasi Akses Sistem</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3 animate-shake">
                    <ShieldCheck className="w-5 h-5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2 group">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Email Akses</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="nama@perusahaan.com"
                      required
                      className="pl-12 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-medium text-base"
                    />
                  </div>
                </div>

                <div className="space-y-2 group">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors group-focus-within:text-blue-600">Kata Sandi</label>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      required
                      className="pl-12 pr-12 h-14 rounded-2xl border-slate-200 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm font-medium text-lg tracking-widest placeholder:tracking-normal"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between px-1 pt-2">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input type="checkbox" className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded-lg checked:bg-blue-600 checked:border-blue-600 transition-all cursor-pointer" id="rem" />
                      <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-xs font-bold text-slate-500 group-hover:text-slate-800 transition-colors">Ingat Perangkat</span>
                  </label>
                  <a href="https://wa.me/628123456789" className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors">
                    Lupa Sandi?
                  </a>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all hover:-translate-y-1 active:scale-[0.98]"
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Memverifikasi...
                    </span>
                  ) : (
                    "Masuk Ke Dashboard"
                  )}
                </Button>
              </form>
            </div>

            <div className="mt-8 text-center">
              <p className="text-[10px] font-semibold text-slate-400">
                Sistem dilindungi enkripsi end-to-end. <br />
                &copy; {new Date().getFullYear()} Progresta Management System.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CSS untuk Animasi Tambahan */}
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
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
}
