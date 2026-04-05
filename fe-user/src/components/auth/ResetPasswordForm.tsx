"use client";

import * as authServices from "@/services/authServices";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const resetSchema = z
  .object({
    otp: z.string().length(6, "Mã OTP phải có 6 chữ số"),
    newPassword: z.string().min(8, "Mật khẩu mới ít nhất 8 ký tự"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu không khớp",
    path: ["confirmPassword"], // Hiển thị lỗi tại ô confirmPassword
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: any) {
    const result = await authServices.resetPassword(data.otp, data.newPassword);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Đổi mật khẩu thành công! Vui lòng đăng nhập lại.");
      router.push("/login");
    }
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          Đặt lại mật khẩu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Controller
            name="otp"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Mã OTP (Xem trong Email)</FieldLabel>
                <Input
                  placeholder="123456"
                  autoComplete="one-time-code"
                  {...field}
                />
                {errors.otp && <FieldError>{errors.otp.message}</FieldError>}
              </Field>
            )}
          />
          <Controller
            name="newPassword"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Mật khẩu mới</FieldLabel>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                />
                {errors.newPassword && (
                  <FieldError>{errors.newPassword.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Controller
            name="confirmPassword"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel>Xác nhận mật khẩu</FieldLabel>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>
            )}
          />
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
