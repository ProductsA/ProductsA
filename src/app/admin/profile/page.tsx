"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Upload, X, AlertTriangle } from "lucide-react";
import { updateAdminProfile, changePassword } from "@/app/admin/settings/actions";
import { PageTitle } from "@/components/PageTitle";

interface AdminProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
}

export default function AdminProfilePage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/profile");
        if (res.ok) {
          const data: AdminProfile = await res.json();
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone || "");
          setProfileImage(data.profileImage || null);
        }
      } catch {
        toast("Failed to load profile", "error");
      } finally {
        setLoading(false);
      }
    })();
  }, [toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setProfileImage(data.url);
      else toast(data.error || "Upload failed", "error");
    } catch {
      toast("Upload failed", "error");
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast("Name is required", "error"); return; }
    if (!email.trim()) { toast("Email is required", "error"); return; }

    setSavingProfile(true);
    const result = await updateAdminProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim() || undefined,
      profileImage: profileImage ?? undefined,
    });
    if (result.success) toast("Profile updated successfully", "success");
    else toast(result.error || "Failed to update profile", "error");
    setSavingProfile(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword) { toast("Current password is required", "error"); return; }
    if (!newPassword) { toast("New password is required", "error"); return; }
    if (newPassword.length < 8) { toast("New password must be at least 8 characters", "error"); return; }
    if (newPassword !== confirmPassword) { toast("Passwords do not match", "error"); return; }

    setSavingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    if (result.success) {
      toast("Password changed successfully", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast(result.error || "Failed to change password", "error");
    }
    setSavingPassword(false);
  };

  const isIncomplete = !name || !email;

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <div className="text-muted-foreground">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle pageName="Profil" />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      {isIncomplete && (
        <div className="rounded-lg border border-warning/50 bg-warning/10 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-warning">Your profile is incomplete</p>
            <p className="text-sm text-muted-foreground mt-1">Please fill in your name and email to complete your profile setup.</p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Profile Image</label>
              {profileImage ? (
                <div className="relative inline-block">
                  <img src={profileImage} alt="Profile" className="h-20 w-20 rounded-full object-cover border" />
                  <button type="button" onClick={() => setProfileImage(null)} className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-muted">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <Upload className="h-4 w-4" /> Upload photo
                </label>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" type="email" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Phone</label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+212 600 000 000" />
            </div>
            <Button onClick={handleSaveProfile} loading={savingProfile}>
              <Save className="h-4 w-4" /> Save Profile
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your account password</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current Password</label>
              <Input value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} type="password" placeholder="Enter current password" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">New Password</label>
              <Input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" placeholder="Enter new password (min 8 characters)" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
              <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" placeholder="Confirm new password" />
            </div>
            <Button onClick={handleChangePassword} loading={savingPassword}>
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
