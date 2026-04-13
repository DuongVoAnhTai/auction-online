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
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(data: z.infer<typeof loginSchema>) {
    const result = await authServices.login(data.email, data.password);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đăng nhập thành công!");

      // 1. Lưu Access Token vào Cookie (Hết hạn sau 1 ngày)
      Cookies.set("access_token", result.access_token, { expires: 1 });

      // 2. Lưu thông tin User (Phải chuyển sang string vì Cookie chỉ lưu chuỗi)
      Cookies.set("user", JSON.stringify(result.user), { expires: 1 });

      // Chuyển hướng về trang chủ
      const destination = redirectUrl || "/";
      router.push(destination);
      router.refresh();
    }
  }

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
      </CardContent>
    </Card>
  );
}
