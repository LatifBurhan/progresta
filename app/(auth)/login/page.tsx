'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { loginAction } from '@/app/actions/auth-actions'
import { Eye, EyeOff, Lock, Mail, Rocket, ShieldCheck, HelpCircle } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [activeSlide, setActiveSlide] = useState(0)

  const slides = [
    { title: "Monitor Progres", desc: "Pantau setiap detak aktivitas proyek dalam satu genggaman." },
    { title: "Absensi Otomatis", desc: "Sistem validasi lokasi presisi untuk efisiensi tim lapangan." },
    { title: "Laporan Real-time", desc: "Data akurat langsung dari lapangan ke meja kerja Anda." }
  ]

  useEffect(() => {
    fetch('/api/auth/check').then(res => res.json()).then(data => {
      data.authenticated ? router.push('/dashboard') : setChecking(false)
    }).catch(() => setChecking(false))

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [router, slides.length])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    try {
      const result = await loginAction(null, formData)
      if (result.success) {
        result.pending ? router.push('/waiting-room') : router.push('/dashboard')
        router.refresh()
      } else if (result.message) {
        setError(result.message)
      }
    } catch {
      setError('Sistem sibuk, coba lagi nanti.')
    } finally { setLoading(false) }
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white font-black tracking-widest animate-pulse">
      PROGRESTA...
    </div>
  )

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row overflow-hidden bg-slate-950 selection:bg-blue-500/30">
      
      {/* LEFT SIDE: Hero Section */}
      <div className="relative w-full lg:w-1/2 h-[45vh] lg:h-screen p-8 lg:p-16 flex flex-col justify-center overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-slate-950 z-0" />
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=2070')] bg-cover bg-center opacity-20 mix-blend-overlay scale-105 animate-[spin_200s_linear_infinite]" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-2xl shadow-blue-600/50 animate-bounce-slow">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black text-white tracking-tighter italic">PROGRESTA</span>
          </div>

          {/* Slider Content with Key for re-animation */}
          <div key={activeSlide} className="h-32 lg:h-48 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.1] mb-5 tracking-tight">
              {slides[activeSlide].title}
            </h1>
            <p className="text-slate-400 text-base lg:text-xl max-w-md font-medium leading-relaxed italic border-l-2 border-blue-600 pl-4">
              {slides[activeSlide].desc}
            </p>
          </div>

          <div className="flex gap-3 mt-8">
            {slides.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-700 ${activeSlide === i ? 'w-12 bg-blue-500' : 'w-3 bg-slate-800'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Login Card */}
      <div className="relative w-full lg:w-1/2 min-h-[55vh] lg:h-screen">
        <div className="absolute top-[-40px] lg:top-0 left-0 w-full h-[calc(100%+40px)] bg-white rounded-[40px_40px_0_0] lg:rounded-none p-8 lg:p-20 shadow-[0_-20px_60px_rgba(0,0,0,0.4)] lg:shadow-none z-20 flex flex-col justify-center animate-in slide-in-from-right-12 duration-1000 delay-150">
          
          <div className="w-full max-w-sm mx-auto space-y-8">
            <div className="pt-6">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Selamat Datang.</h2>
              <p className="text-slate-400 font-bold text-[11px] uppercase tracking-[0.25em]">Kelola proyek lebih cerdas & efisien</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-xs font-bold border border-rose-100 flex items-center gap-3 animate-shake">
                  <ShieldCheck className="w-5 h-5" /> {error}
                </div>
              )}

              <div className="space-y-2 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 transition-colors group-focus-within:text-blue-600">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                  <Input
                    name="email" type="email" placeholder="nama@perusahaan.com" required
                    className="pl-11 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-none border-2"
                  />
                </div>
              </div>

              <div className="space-y-2 group">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-blue-600">Password</label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-all" />
                  <Input
                    name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required
                    className="pl-11 pr-12 h-14 rounded-2xl border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all shadow-none border-2"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="rounded-md border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4 transition-all" id="rem" />
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Ingat Saya</span>
                </label>
                <a href="https://wa.me/628123456789" className="text-[10px] font-black text-blue-600 uppercase tracking-tighter hover:underline">
                  Lupa Sandi?
                </a>
              </div>

              <Button 
                type="submit" 
                className="w-full h-14 bg-slate-900 hover:bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menautkan...
                  </span>
                ) : 'Masuk Ke Sistem'}
              </Button>
            </form>

            <div className="pt-6 border-t border-slate-100">
              <div className="bg-blue-50/50 p-4 rounded-2xl flex gap-3 items-start">
                <HelpCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed text-slate-600 font-medium">
                  Mengalami kendala akses atau lupa kata sandi? Silahkan <a href="mailto:generalaffair@perusahaan.com" className="text-blue-600 font-bold hover:underline">Hubungi General Affair</a> untuk reset akun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS untuk Animasi Tambahan */}
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  )
}