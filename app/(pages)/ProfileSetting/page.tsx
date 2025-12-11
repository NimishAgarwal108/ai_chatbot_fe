"use client";

import NavBar from "@/components/custom/NavBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Bell,
  Calendar,
  Camera,
  CreditCard,
  Edit2,
  Globe,
  Key,
  LogOut,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Save,
  Settings,
  Shield,
  Trash2,
  User
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  location: string;
  joinDate: string;
  bio: string;
}

interface PreferenceItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  enabled: boolean;
  onToggle: () => void;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    joinDate: "January 2024",
    bio: "AI enthusiast and technology lover. Exploring the possibilities of artificial intelligence.",
  });

  const handleSave = () => setIsEditing(false);

  return (
    <div className="min-h-screen flex bg-black text-gray-100 overflow-hidden">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-[250px] border-r border-slate-800 bg-black z-20">
        <NavBar />
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900 via-black to-gray-900 border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <Link href="/">
            <Button
              variant="outline"
              className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button></Link>
          </div>
        </div>

        {/* Profile Layout */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-4xl font-bold text-white border-4 border-gray-800">
                    {profileData.name.charAt(0)}
                  </div>
                  <button className="absolute bottom-0 right-0 bg-gray-800 p-2 rounded-full border-2 border-gray-700 hover:bg-gray-700 transition-all group-hover:scale-110">
                    <Camera className="w-4 h-4 text-gray-300" />
                  </button>
                </div>

                <h2 className="mt-4 text-2xl font-bold">{profileData.name}</h2>
                <p className="text-gray-400 text-sm">{profileData.email}</p>

                <Separator className="my-6 bg-gray-800 w-full" />

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 text-center w-full">
                  <div>
                    <p className="text-2xl font-bold">248</p>
                    <p className="text-xs text-gray-400">Chats</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1.2k</p>
                    <p className="text-xs text-gray-400">Messages</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">52</p>
                    <p className="text-xs text-gray-400">Days</p>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-6 w-full space-y-2">
                  <Button className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700">
                    <MessageSquare className="w-4 h-4 mr-2" /> New Chat
                  </Button>
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
                  <span className="text-white font-semibold">Pro</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Status</span>
                  <span className="text-green-500 font-semibold">Active</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Renewal</span>
                  <span className="text-white text-sm">Feb 15, 2025</span>
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
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-white text-xl">Personal Information</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                  {isEditing ? (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save
                    </>
                  ) : (
                    <>
                      <Edit2 className="w-4 h-4 mr-2" /> Edit
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { label: "Full Name", icon: <User className="w-4 h-4 mr-2" />, value: "name" as keyof ProfileData },
                    { label: "Email Address", icon: <Mail className="w-4 h-4 mr-2" />, value: "email" as keyof ProfileData },
                    { label: "Phone Number", icon: <Phone className="w-4 h-4 mr-2" />, value: "phone" as keyof ProfileData },
                    { label: "Location", icon: <MapPin className="w-4 h-4 mr-2" />, value: "location" as keyof ProfileData },
                  ].map((field) => (
                    <div key={field.value} className="space-y-2">
                      <Label className="text-gray-400 flex items-center">{field.icon} {field.label}</Label>
                      {isEditing ? (
                        <Input
                          value={profileData[field.value]}
                          onChange={(e) =>
                            setProfileData({ ...profileData, [field.value]: e.target.value })
                          }
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      ) : (
                        <p className="text-white font-medium">{profileData[field.value]}</p>
                      )}
                    </div>
                  ))}

                  {/* Member Since */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-400 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" /> Member Since
                    </Label>
                    <p className="text-white font-medium">{profileData.joinDate}</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-gray-400">Bio</Label>
                    {isEditing ? (
                      <textarea
                        value={profileData.bio}
                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                        rows={3}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-600"
                      />
                    ) : (
                      <p className="text-white">{profileData.bio}</p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="mt-6 flex justify-end space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      className="bg-white text-black hover:bg-gray-200"
                    >
                      Save Changes
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


                <Separator className="bg-gray-800" />

                {/* Notifications */}
                <PreferenceItem
                  icon={<Bell className="w-5 h-5 text-gray-400" />}
                  title="Notifications"
                  subtitle="Receive updates and alerts"
                  enabled={notifications}
                  onToggle={() => setNotifications(!notifications)}
                />

                <Separator className="bg-gray-800" />

                {/* Language */}
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
                {[
                  { title: "Change Password", subtitle: "Update your password regularly", icon: <Key className="w-5 h-5 text-gray-400" />, button: "Update" },
                  ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <div>
                        <p className="text-white font-medium">{item.title}</p>
                        <p className="text-gray-400 text-sm">{item.subtitle}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="bg-gray-900 border-gray-700 text-gray-300 hover:bg-gray-700">
                      {item.button}
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="bg-gray-900 border-red-900/50">
              <CardHeader>
                <CardTitle className="text-red-500 text-xl flex items-center">
                  <Trash2 className="w-5 h-5 mr-2" /> Account Delete
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-400">Once you delete your account, there is no going back. Please be certain.</p>
                <Link href="/SignUp">
                <Button variant="outline" className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white mt-4">
                  <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                </Button></Link>
              </CardContent>
            </Card>

          </div>
        </div>
      </main>
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