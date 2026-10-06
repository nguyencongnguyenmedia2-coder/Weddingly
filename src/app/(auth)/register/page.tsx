"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, Lock, Mail, User, Phone } from "lucide-react";
import { Card, Input } from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Move to Onboarding wizard
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFFDF9] via-[#F5EFE7] to-[#FFFDF9] p-4">
      <div className="w-full max-w-md space-y-6">
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
            Bắt đầu kế hoạch cưới
          </h2>
          <p className="text-xs text-[#6B5E5B]">
            Tạo tài khoản để sở hữu không gian quản lý đám cưới thông minh toàn diện
          </p>
        </div>

        <Card className="p-6 sm:p-8 bg-white shadow-xl border-[#EADBCE]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                Họ và tên của bạn
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B5E5A]" />
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="VD: Nguyễn Minh Anh"
                  required
                  className="pl-10 text-xs"
                />
              </div>
            </div>

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
              <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                Số điện thoại
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-[#8B5E5A]" />
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="VD: 0901234567"
                  className="pl-10 text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-[#2C2422] block mb-1">
                Mật khẩu
              </label>
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
              <span>{loading ? "Đang khởi tạo..." : "Tạo tài khoản & Bắt đầu"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-[#EADBCE] text-center text-xs text-[#6B5E5B]">
            Đã có tài khoản?{" "}
            <Link href="/login" className="font-bold text-[#8B5E5A] hover:underline">
              Đăng nhập
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
