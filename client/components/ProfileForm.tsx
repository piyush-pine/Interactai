"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { User } from "@/types";
import { updateUserProfile } from "@/lib/actions/user.action";
import { toast } from "sonner";
import { Form } from "@/components/ui/form";
import FormField from "./FormField";
import { Button } from "./ui/button";
import ResumeUpload from "./ResumeUpload";
import { Save, Loader2, User as UserIcon, Mail } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  linkedIn: z.string().url("Invalid LinkedIn URL").or(z.literal("")).optional(),
  github: z.string().url("Invalid GitHub URL").or(z.literal("")).optional(),
  skills: z.string().optional(),
});

interface ProfileFormProps {
  user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [resumeData, setResumeData] = useState({
    url: user.resumeURL || "",
    name: user.resumeName || "",
  });

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      linkedIn: user.linkedIn || "",
      github: user.github || "",
      skills: user.skills ? user.skills.join(", ") : "",
    },
  });

  const onSubmit = async (data: z.infer<typeof profileSchema>) => {
    setIsLoading(true);
    try {
      const skillsArray = data.skills 
        ? data.skills.split(",").map(s => s.trim()).filter(Boolean)
        : [];

      const result = await updateUserProfile({
        userId: user.id,
        name: data.name,
        resumeURL: resumeData.url,
        resumeName: resumeData.name,
        bio: data.bio,
        linkedIn: data.linkedIn,
        github: data.github,
        skills: skillsArray,
      });

      if (result.success) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResumeComplete = (url: string, name: string) => {
    setResumeData({ url, name });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Profile Info Form */}
      <div className="lg:col-span-12">
        <div className="glass-card p-8 space-y-8">
          <div className="flex items-center gap-4 pb-6 border-b border-border/50">
            <div className="p-3 bg-primary/10 rounded-xl">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Personal Information</h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                Update your name, bio, and professional links.
              </p>
            </div>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Info Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  label="Full Name"
                  placeholder="Enter your name"
                  type="text"
                />
                
                <div className="space-y-2 opacity-70 cursor-not-allowed">
                  <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email Address
                  </label>
                  <div className="input-glass bg-muted/20 flex items-center h-12 px-5 text-muted-foreground">
                    {user.email}
                  </div>
                </div>
              </div>

              {/* Bio Section */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-light-100">Professional Bio</label>
                <textarea
                  {...form.register("bio")}
                  placeholder="Tell us about yourself..."
                  className="w-full min-h-[120px] bg-dark-200 border border-border rounded-2xl p-5 text-light-100 placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Social Links Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-blue-500" /> LinkedIn URL
                  </label>
                  <input
                    {...form.register("linkedIn")}
                    placeholder="https://linkedin.com/in/username"
                    className="input-glass w-full h-12 px-5 bg-dark-200 border border-border rounded-full"
                  />
                  {form.formState.errors.linkedIn && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.linkedIn.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-light-100 flex items-center gap-2">
                    <Github className="h-4 w-4 text-foreground" /> GitHub URL
                  </label>
                  <input
                    {...form.register("github")}
                    placeholder="https://github.com/username"
                    className="input-glass w-full h-12 px-5 bg-dark-200 border border-border rounded-full"
                  />
                  {form.formState.errors.github && (
                    <p className="text-xs text-destructive mt-1">{form.formState.errors.github.message}</p>
                  )}
                </div>
              </div>

              {/* Skills Section */}
              <div className="space-y-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <CodeIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Skills & Technologies</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Enter your skills separated by commas (e.g., React, Node.js, Python).
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <input
                    {...form.register("skills")}
                    placeholder="React, Next.js, TypeScript, PostgreSQL..."
                    className="input-glass w-full h-12 px-5 bg-dark-200 border border-border rounded-full"
                  />
                </div>
              </div>

              {/* Resume Section */}
              <div className="pt-4 border-t border-border/50">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Resume Management</h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Upload your latest resume (PDF) to improve AI mock interviews.
                    </p>
                  </div>
                </div>

                <ResumeUpload 
                  userId={user.id}
                  currentResumeName={user.resumeName}
                  onUploadComplete={handleResumeComplete}
                />
              </div>

              <div className="flex justify-end pt-6">
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="btn-gradient px-8 h-12 gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}

// Helper to keep icons working
import { FileText, Linkedin, Github, Code as CodeIcon } from "lucide-react";
