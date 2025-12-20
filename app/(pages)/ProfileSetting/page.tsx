"use client";

import { NAVIGATION_ROUTES } from "@/app/Constant";
import NavBar from "@/components/custom/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { authService } from "@/lib/authService";
import { profileService, ProfileError } from "@/lib/profileService";
import {
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CreditCard,
  Edit2,
  Globe,
  Key,
  Loader2,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Settings,
  Shield,
  Trash2,
  User,
  X
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  bio: string;
  picture?: string;
  authProvider: string;
}

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}

interface Stats {
  chats: number;
  messages: number;
  daysSinceJoined: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    bio: "",
    authProvider: "local"
  });

  const [originalData, setOriginalData] = useState<ProfileData>(profileData);
  const [notifications, setNotifications] = useState(true);
  const [stats, setStats] = useState<Stats>({
    chats: 0,
    messages: 0,
    daysSinceJoined: 0
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Load profile data
  useEffect(() => {
    loadProfile();
    loadStats();
  }, []);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await profileService.getProfile();
      
      if (response.success && response.data?.user) {
        const user = response.data.user;
        const data = {
          name: user.name,
          email: user.email,
          phone: user.phone || "",
          location: user.location || "",
          bio: user.bio || "",
          picture: user.picture,
          authProvider: user.authProvider,
          joinDate: new Date(user.createdAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })
        };
        
        setProfileData(data);
        setOriginalData(data);
        setNotifications(user.preferences?.notifications ?? true);
      }
    } catch (err) {
      if (err instanceof ProfileError) {
        if (err.statusCode === 401) {
          router.push(NAVIGATION_ROUTES.LOG_IN);
        } else {
          setError(err.message);
        }
      } else {
        setError('Failed to load profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await profileService.getStats();
      if (response.success && response.data?.stats) {
        setStats(response.data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setSuccessMessage(null);

      await profileService.updateProfile({
        name: profileData.name,
        phone: profileData.phone,
        location: profileData.location,
        bio: profileData.bio
      });

      setOriginalData(profileData);
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof ProfileError) {
        setError(err.message);
      } else {
        setError('Failed to update profile');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setIsEditing(false);
    setError(null);
  };

  const handleNotificationToggle = async () => {
    try {
      const newValue = !notifications;
      setNotifications(newValue);
      
      await profileService.updatePreferences({
        notifications: newValue
      });
      
      setSuccessMessage('Preferences updated!');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setNotifications(!notifications);
      setError('Failed to update preferences');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError(null);
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      setIsSaving(true);
      await profileService.changePassword(passwordData);
      
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setSuccessMessage('Password changed successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      if (err instanceof ProfileError) {
        setError(err.message);
      } else {
        setError('Failed to change password');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsSaving(true);
      await profileService.deleteAccount();
      router.push(NAVIGATION_ROUTES.SIGN_UP);
    } catch (err) {
      if (err instanceof ProfileError) {
        setError(err.message);
      } else {
        setError('Failed to delete account');
      }
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      router.push(NAVIGATION_ROUTES.LOG_IN);
    } catch (err) {
      console.error('Logout error:', err);
      router.push(NAVIGATION_ROUTES.LOG_IN);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 text-white animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-black">
      {/* Sidebar */}
      <div className="border-r border-slate-800">
        <NavBar />
      </div>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 min-h-screen overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800">
          <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <h1 className="text-2xl sm:text-3xl font-bold ml-10 text-gray-300">Profile Settings</h1>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded">
              {successMessage}
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
            <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError(null)}>
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Profile Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-800">
                    {profileData.name.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full border-2 border-gray-700 hover:bg-gray-700 transition-all group-hover:scale-110">
                    <Camera className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                <h2 className="mt-4 text-2xl font-bold text-white">{profileData.name}</h2>
                <p className="text-gray-400 text-sm">{profileData.email}</p>

                <Separator className="my-6 bg-gray-800 w-full" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center w-full">
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.chats}</p>
                    <p className="text-xs text-gray-400">Chats</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.messages}</p>
                    <p className="text-xs text-gray-400">Messages</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{stats.daysSinceJoined}</p>
                    <p className="text-xs text-gray-400">Days</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 w-full space-y-2">
                  <Link href={NAVIGATION_ROUTES.NEW_CHAT}>
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 mb-2">
                      <MessageSquare className="w-4 h-4 mr-2" /> New Chat
                    </Button>
                  </Link>
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700">
                    <BarChart3 className="w-4 h-4 mr-2" /> View Activity
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Membership Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-lg flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-gray-400" /> Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Plan</span>
                  <span className="text-white font-semibold">Free</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Member Since</span>
                  <span className="text-white text-sm">{profileData.joinDate}</span>
                </div>
                <Button className="w-full mt-4 bg-white text-black hover:bg-gray-200">
                  Upgrade Plan
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Personal Information */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row justify-between items-center">
                <CardTitle className="text-white text-xl">Personal Information</CardTitle>
                {!isEditing ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                ) : null}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center">
                      <User className="w-4 h-4 mr-2" /> Full Name
                    </Label>
                    {isEditing ? (
                      <Input
                        value={profileData.name}
                        onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    ) : (
                      <p className="text-white font-medium">{profileData.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center">
                      <Mail className="w-4 h-4 mr-2" /> Email Address
                    </Label>
                    <p className="text-white font-medium">{profileData.email}</p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center">
                      <Phone className="w-4 h-4 mr-2" /> Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="+1 (555) 123-4567"
                      />
                    ) : (
                      <p className="text-white font-medium">{profileData.phone || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-gray-400 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" /> Location
                    </Label>
                    {isEditing ? (
                      <Input
                        value={profileData.location}
                        onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="San Francisco, CA"
                      />
                    ) : (
                      <p className="text-white font-medium">{profileData.location || "Not provided"}</p>
                    )}
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Member Since
                    </Label>
                    <p className="text-white font-medium">{profileData.joinDate}</p>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-400">Bio</Label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={3}
                        maxLength={500}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
                        placeholder="Tell us about yourself..."
                      />
                    ) : (
                      <p className="text-white">{profileData.bio || "No bio provided"}</p>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Settings className="w-5 h-5 mr-2" /> Preferences
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PreferenceItem
                  icon={<Bell className="w-5 h-5 text-gray-400" />}
                  title="Notifications"
                  subtitle="Receive updates and alerts"
                  enabled={notifications}
                  onToggle={handleNotificationToggle}
                />

                <Separator className="bg-gray-800" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Language</p>
                      <p className="text-gray-400 text-sm">English (US)</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700">
                    Change
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white text-xl flex items-center">
                  <Shield className="w-5 h-5 mr-2" /> Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-gray-400 text-sm">Update your password regularly</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    disabled={profileData.authProvider === 'google'}
                    variant="outline"
                    size="sm"
                    className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-50"
                  >
                    Update
                  </Button>
                </div>
                {profileData.authProvider === 'google' && (
                  <p className="text-xs text-gray-500 text-center">
                    Password change is not available for Google accounts
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-gray-900 border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-500 text-xl flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" /> Danger Zone
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                <Button
                  onClick={() => setShowDeleteModal(true)}
                  variant="outline"
                  className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-4"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-800 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>Change Password</span>
                <button onClick={() => setShowPasswordModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-400">Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-400">New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>
              <div>
                <Label className="text-gray-400">Confirm New Password</Label>
                <Input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-white mt-2"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPasswordModal(false)}
                  disabled={isSaving}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePasswordChange}
                  disabled={isSaving}
                  className="bg-white text-black hover:bg-gray-200"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-red-900/50 w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center justify-between">
                <span>Delete Account</span>
                <button onClick={() => setShowDeleteModal(false)} className="text-gray-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">
                Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
              </p>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isSaving}
                  className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  variant="outline"
                  className="border-red-500 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4 mr-2" />
                      Yes, Delete My Account
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Helper Component for Preferences
function PreferenceItem({ icon, title, subtitle, enabled, onToggle }: PreferenceItemProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {icon}
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-gray-400 text-sm">{subtitle}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-white" : "bg-gray-700"}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-black transition-transform ${enabled ? "translate-x-6" : "translate-x-1"}`} />
      </button>
    </div>
  );
}