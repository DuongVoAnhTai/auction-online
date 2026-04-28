"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import * as authServices from "@/services/authServices";
import { useRouter } from "next/navigation";
import Link from "next/link";

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập họ tên")
      .min(2, "Họ tên phải ít nhất 2 ký tự"),
    email: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập email")
      .email("Email không hợp lệ"),
    password: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập mật khẩu")
      .min(8, "Mật khẩu phải có ít nhất 8 ký tự")
      .regex(/[A-Z]/, "Phải có ít nhất 1 chữ cái viết hoa")
      .regex(/[a-z]/, "Phải có nhất 1 chữ cái viết thường")
      .regex(/[0-9]/, "Phải có ít nhất 1 con số")
      .regex(/[!@#$%^&*]/, "Phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)"),
    confirmPassword: z
      .string()
      .trim()
      .min(1, "Vui lòng nhập mật khẩu xác nhận"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type RegisterValues = z.infer<typeof registerSchema>;

export default function SignUpForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: RegisterValues) {
    const result = await authServices.signup(
      data.email,
      data.fullName,
      data.password,
    );

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đăng ký thành công!");
      router.push("/login");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Đăng ký tài khoản
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Field Họ Tên */}
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => (
              <Field>
                <FieldLabel>Họ và tên</FieldLabel>
                <Input
                  placeholder="Nguyễn Văn A"
                  autoComplete="name"
                  {...field}
                />
                {errors.fullName && (
                  <FieldError>{errors.fullName.message}</FieldError>
                )}
              </Field>
            )}
          />

          {/* Field Email */}
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

          {/* Field Mật khẩu */}
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Field>
                <FieldLabel>Mật khẩu</FieldLabel>
                <Input type="password" autoComplete="new-password" {...field} />
                {errors.password && (
                  <FieldError>{errors.password.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <Field>
                <FieldLabel>Xác nhận mật khẩu</FieldLabel>
                <Input type="password" autoComplete="new-password" {...field} />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang xử lý..." : "Tạo tài khoản"}
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Đã có tài khoản?{" "}
            <Link
              href="/login"
              className="font-medium text-primary underline underline-offset-4 hover:opacity-80 transition-opacity"
            >
              Đăng nhập ngay
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
