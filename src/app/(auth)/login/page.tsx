"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, Lock, Mail } from "lucide-react";
import { Card, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AuthService } from "@/services/auth.service";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const notice = searchParams.get("notice");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await AuthService.login(email, password);
      if (res.user?.role === "ADMIN") {
        router.push("/admin");
      } else {
        const safeRedirect = redirect === "/admin" || redirect.startsWith("/admin") ? "/dashboard" : redirect;
        router.push(safeRedirect);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#F5EFE7] to-[#FFFDF9] p-4">
      <div className="w-full max-w-md space-y-6">
        {notice === "require_auth" && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center shadow-xs">
            🔒 <strong>Yêu cầu đăng nhập:</strong> Vui lòng đăng nhập hoặc tạo tài khoản mới để truy cập không gian quản lý đám cưới của bạn.
          </div>
        )}
        {/* Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex flex-col items-center gap-2 group">
            <div className="relative h-14 w-14 rounded-2xl overflow-hidden shadow-md ring-2 ring-[#8B5E5A]/20 bg-white group-hover:scale-105 transition-transform">
              <Image
                src="/logo.png"
                alt="Weddingly Logo"
                width={56}
                height={56}
                className="object-cover w-full h-full"
                priority
              />
            </div>
            <div>
              <span className="font-serif text-2xl font-black tracking-wider text-[#2C2422] block">
                WEDDINGLY
              </span>
              <span className="text-xs font-semibold text-[#8B5E5A] block">
                Cưới thông minh – Tài chính an tâm
              </span>
            </div>
          </Link>
          <h2 className="font-serif text-2xl font-bold text-[#2C2422] pt-2">
            Chào mừng trở lại
          </h2>
          <p className="text-xs text-[#6B5E5B]">
            Đăng nhập để tiếp tục quản lý kế hoạch ngày trọng đại của bạn
          </p>
        </div>

        {/* Form Card */}
        <Card className="p-6 sm:p-8 bg-white shadow-xl border-[#EADBCE]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                Địa chỉ Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B5E5A]" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#2C2422]">
                  Mật khẩu
                </label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-[#8B5E5A] hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B5E5A]" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="pl-10 text-xs"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="w-full mt-2"
            >
              <span>{loading ? "Đang xử lý..." : "Đăng nhập ngay"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EADBCE] text-center text-xs text-[#6B5E5B]">
            Chưa có tài khoản?{" "}
            <Link href="/register" className="font-bold text-[#8B5E5A] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
