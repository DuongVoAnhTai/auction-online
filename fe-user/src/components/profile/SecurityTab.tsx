"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import * as authServices from "@/services/authServices";

export function SecurityTab() {
  const { user, setUser } = useAuth();
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Bước 1: Gọi API để lấy mã QR
  const handleEnable2FA = async () => {
    const res = await authServices.generate2FA();
    if (res.qrCodeDataURL) {
      setQrCode(res.qrCodeDataURL);
      setSecret(res.secret);
      setIsDialogOpen(true);
    }
  };

  // Bước 2: Xác nhận mã OTP để kích hoạt
  const handleVerify2FA = async () => {
    const res = await authServices.turnOn2FA(otp, secret);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success("Đã kích hoạt bảo mật 2 lớp!");
      setIsDialogOpen(false);
      if (user) {
        setUser({ ...user, is2faEnabled: true });
      }
    }
  };

  const handleDisable2FA = async () => {
    if (confirm("Bạn có chắc chắn muốn tắt bảo mật 2 lớp?")) {
      const res = await authServices.turnOff2FA();
      if (!res.error) {
        toast.success("Đã tắt bảo mật");
        if (user) {
          setUser({ ...user, is2faEnabled: false });
        }
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div>
          <h3 className="font-bold">Xác thực 2 lớp (2FA)</h3>
          <p className="text-sm text-muted-foreground">
            Bảo vệ tài khoản bằng mã bảo mật từ App.
          </p>
        </div>

        {user?.is2faEnabled ? (
          <Button
            onClick={handleDisable2FA}
            variant="outline"
            className="text-red-500 border-red-200"
          >
            Tắt bảo mật
          </Button>
        ) : (
          <Button onClick={handleEnable2FA}>Thiết lập ngay</Button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Thiết lập xác thực 2 lớp</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-6 py-4">
            <p className="text-sm text-center">
              Quét mã QR bằng ứng dụng <b>Google Authenticator</b> hoặc{" "}
              <b>Authy</b>
            </p>

            {qrCode && (
              <img
                src={qrCode}
                alt="QR Code"
                className="w-48 h-48 border p-2"
              />
            )}

            <div className="space-y-2 flex flex-col items-center">
              <p className="text-xs font-medium">Nhập mã 6 số từ ứng dụng:</p>
              <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} /> <InputOTPSlot index={1} />{" "}
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} /> <InputOTPSlot index={4} />{" "}
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              className="w-full"
              onClick={handleVerify2FA}
              disabled={otp.length < 6}
            >
              Xác nhận và Kích hoạt
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
