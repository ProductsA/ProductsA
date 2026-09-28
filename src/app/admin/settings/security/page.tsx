"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, Lock, Key, Clock, Smartphone } from "lucide-react";
import { changePassword } from "@/app/admin/settings/actions";
import { PageTitle } from "@/components/PageTitle";

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (!currentPassword) { toast("Current password is required", "error"); return; }
    if (!newPassword) { toast("New password is required", "error"); return; }
    if (newPassword.length < 8) { toast("New password must be at least 8 characters", "error"); return; }
    if (newPassword !== confirmPassword) { toast("Passwords do not match", "error"); return; }

    setSaving(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      toast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast(result.error || "Failed to change password", "error");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <PageTitle pageName="Securite" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Security Settings</h1>
        <p className="text-muted-foreground">Manage your account security preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" /> Change Password
            </CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current Password</label>
              <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">New Password</label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Min 8 characters" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm new password" />
            </div>
            <Button onClick={handleChangePassword} loading={saving}>
              <Key className="h-4 w-4" /> Change Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" /> Two-Factor Authentication
            </CardTitle>
            <CardDescription>Add an extra layer of security to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Two-factor authentication</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This feature is not yet available. It will be added in a future update.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Session Management
            </CardTitle>
            <CardDescription>View and manage your active sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Current Session</p>
              <p className="text-xs text-muted-foreground mt-1">
                You are currently signed in on this device. Sessions are managed via JWT tokens and expire automatically.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Session Expiry</p>
              <p className="text-xs text-muted-foreground mt-1">
                Active sessions expire after 30 days of inactivity. You will be prompted to sign in again after expiry.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" /> Login History
            </CardTitle>
            <CardDescription>Recent login attempts to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm font-medium">Login history</p>
              <p className="text-xs text-muted-foreground mt-1">
                Login history tracking is not yet implemented. This feature will be available in a future update.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
