"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import z from "zod";
import * as authServices from "@/services/authServices";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Link from "next/link";
import { useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { useAuth } from "@/context/AuthContext";

const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập email")
    .email("Email không hợp lệ"),
  password: z.string().min(1, "Vui lòng nhập mật khẩu"),
});

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const router = useRouter();
  const { setUser } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const [show2FA, setShow2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState("");
  const [otp, setOtp] = useState("");

  const handleLoginSuccess = (result: any) => {
    toast.success("Đăng nhập thành công!");

    // 1. Lưu Access Token vào Cookie (Hết hạn sau 1 ngày)
    Cookies.set("access_token", result.access_token, { expires: 1 });

    // 2. Lưu thông tin User (Phải chuyển sang string vì Cookie chỉ lưu chuỗi)
    Cookies.set("user", JSON.stringify(result.user), { expires: 1 });

    // 3. Cập nhật state User trong Context
    setUser(result.user);

    // 4. Chuyển hướng
    if (result.user.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push(redirectUrl || "/");
    }

    router.refresh();
  };

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const result = await authServices.login(data.email, data.password);

    if (result.require2FA) {
      // Nếu server yêu cầu 2FA, chuyển sang chế độ nhập mã OTP
      setTempUserId(result.userId);
      setShow2FA(true);
      toast.info("Vui lòng nhập mã OTP từ ứng dụng xác thực");
      return;
    }

    if (result.error) {
      toast.error(result.error);
    } else {
      handleLoginSuccess(result);
    }
  }

  const handleFinal2FA = async () => {
    const result = await authServices.loginWith2FA(tempUserId, otp);
    if (result.error) {
      toast.error(result.error);
    } else {
      handleLoginSuccess(result);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Chào mừng trở lại
        </CardTitle>
        <CardDescription className="text-center">
          Đăng nhập để tham gia các phiên đấu giá trực tuyến.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!show2FA ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Field>
                  <FieldLabel>Email</FieldLabel>
                  <Input
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    {...field}
                  />
                  {errors.email && (
                    <FieldError>{errors.email.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel>Mật khẩu</FieldLabel>
                    {/* Quên mật khẩu */}
                    <Link
                      href="/forgot-password"
                      className="text-xs text-muted-foreground hover:text-primary underline-offset-4 hover:underline"
                    >
                      Quên mật khẩu?
                    </Link>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    {...field}
                  />
                  {errors.password && (
                    <FieldError>{errors.password.message}</FieldError>
                  )}
                </Field>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
            </Button>

            <div className="text-center text-sm text-muted-foreground mt-4">
              Chưa có tài khoản?{" "}
              <Link
                href="/signup"
                className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
              >
                Đăng ký tại đây
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-4 py-4 text-center flex flex-col items-center">
            <p className="text-sm">Nhập mã xác thực 2 lớp</p>
            <InputOTP maxLength={6} value={otp} onChange={setOtp}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <Button onClick={handleFinal2FA} className="w-full">
              Xác nhận
            </Button>
            <Button variant="ghost" onClick={() => setShow2FA(false)}>
              Quay lại
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
