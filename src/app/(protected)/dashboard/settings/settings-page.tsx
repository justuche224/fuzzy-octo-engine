"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { userProfileSchema, type UserProfileSchema } from "@/types";
import { getUserProfile, updateUserProfile } from "@/actions/user";
import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface ProfileData {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
    createdAt: Date;
  };
  profile: {
    id?: string;
    farmName?: string | null;
    description?: string | null;
    location?: string | null;
    phone?: string | null;
    website?: string | null;
    certifications?: string | null;
    avatar?: string | null;
    banner?: string | null;
    verified?: boolean | null;
  } | null;
}
import {
  Upload,
  User,
  MapPin,
  Phone,
  Globe,
  Award,
  Save,
  Loader2,
} from "lucide-react";
import Image from "next/image";

const SettingsPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(null);
  const [uploadedBanner, setUploadedBanner] = useState<string | null>(null);

  const form = useForm<UserProfileSchema>({
    resolver: zodResolver(userProfileSchema),
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfileData(data);

        if (data.profile) {
          form.setValue("farmName", data.profile.farmName || "");
          form.setValue("description", data.profile.description || "");
          form.setValue("location", data.profile.location || "");
          form.setValue("phone", data.profile.phone || "");
          form.setValue("website", data.profile.website || "");
          form.setValue("certifications", data.profile.certifications || "");
          form.setValue("avatar", data.profile.avatar || "");
          form.setValue("banner", data.profile.banner || "");
        }
      } catch (error) {
        console.error("Failed to load profile:", error);
      }
    };

    loadProfile();
  }, [form]);

  const onSubmit = async (data: UserProfileSchema) => {
    setIsLoading(true);
    try {
      const profilePayload: UserProfileSchema = {
        ...data,
        avatar: uploadedAvatar ?? data.avatar,
        banner: uploadedBanner ?? data.banner,
      };
      await updateUserProfile(profilePayload);
      window.location.reload();
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const avatarUrl = form.watch("avatar") || profileData.profile?.avatar;
  const bannerUrl = form.watch("banner") || profileData.profile?.banner;

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Seller Settings</h1>
        <p className="text-muted-foreground">
          Manage your seller profile and business information
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>
                This information will be displayed on your public seller profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                {bannerUrl && (
                  <div className="w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
                    <Image
                      src={bannerUrl || ""}
                      alt="Banner"
                      fill
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div
                  className={`${
                    bannerUrl ? "absolute -bottom-6 left-6" : "relative"
                  }`}
                >
                  <Avatar className="h-20 w-20 border-4 border-background">
                    <AvatarImage src={avatarUrl || ""} />
                    <AvatarFallback className="text-lg">
                      {profileData.user.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </div>

              <div
                className={`${
                  bannerUrl ? "pt-6" : "pt-4"
                } grid grid-cols-1 md:grid-cols-2 gap-6`}
              >
                <div className="space-y-2">
                  <Label htmlFor="farmName">Business Name</Label>
                  <Input
                    id="farmName"
                    placeholder="Your farm or business name"
                    {...form.register("farmName")}
                  />
                  {form.formState.errors.farmName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.farmName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    <MapPin className="h-4 w-4 inline mr-1" />
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="City, State/Country"
                    {...form.register("location")}
                  />
                  {form.formState.errors.location && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 123-4567"
                    {...form.register("phone")}
                  />
                  {form.formState.errors.phone && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">
                    <Globe className="h-4 w-4 inline mr-1" />
                    Website
                  </Label>
                  <Input
                    id="website"
                    placeholder="https://yourwebsite.com"
                    {...form.register("website")}
                  />
                  {form.formState.errors.website && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.website.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Business Description</Label>
                <Textarea
                  id="description"
                  placeholder="Tell customers about your farm/business, your growing practices, and what makes your products special..."
                  rows={4}
                  {...form.register("description")}
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">
                  <Award className="h-4 w-4 inline mr-1" />
                  Certifications
                </Label>
                <Input
                  id="certifications"
                  placeholder="Organic, Non-GMO, Local Certified, etc."
                  {...form.register("certifications")}
                />
                {form.formState.errors.certifications && (
                  <p className="text-sm text-red-500">
                    {form.formState.errors.certifications.message}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Profile Images
              </CardTitle>
              <CardDescription>
                Upload your profile avatar and banner image
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="avatar"
                render={() => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res) {
                            setUploadedAvatar(res[0].url);
                            form.setValue("avatar", res[0].url);
                            toast.success("Avatar uploaded successfully!");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload error: ${error.message}`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="banner"
                render={() => (
                  <FormItem>
                    <FormLabel>Banner</FormLabel>
                    <FormControl>
                      <UploadDropzone
                        endpoint="imageUploader"
                        onClientUploadComplete={(res) => {
                          if (res) {
                            setUploadedBanner(res[0].url);
                            form.setValue("banner", res[0].url);
                            toast.success("Banner uploaded successfully!");
                          }
                        }}
                        onUploadError={(error: Error) => {
                          toast.error(`Upload error: ${error.message}`);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>Your basic account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {profileData.user.name}
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {profileData.user.email}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge
                  variant={
                    profileData.profile?.verified ? "default" : "secondary"
                  }
                >
                  {profileData.profile?.verified
                    ? "Verified Seller"
                    : "Unverified"}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Member since{" "}
                  {new Date(profileData.user.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={!form.formState.isDirty || isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default SettingsPage;
