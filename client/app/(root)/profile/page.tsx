import { getCurrentUser } from "@/lib/actions/auth.action";
import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ChevronRight, Settings } from "lucide-react";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary transition-colors">Dashboard</Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">Profile Settings</span>
      </nav>

      {/* Profile Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-primary-200 p-8 sm:p-12 text-dark-100 flex flex-col sm:flex-row items-center gap-8 gap-y-6">
        <div className="relative z-10 w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white/20 overflow-hidden shadow-2xl pulse-glow">
          <Image
            src="/user-avatar.png"
            alt={user.name}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="relative z-10 space-y-2 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight !text-dark-100 italic uppercase">
              {user.name}
            </h1>
            <Settings className="h-6 w-6 opacity-40 animate-spin-slow" />
          </div>
          <p className="text-lg font-medium opacity-80 uppercase tracking-widest italic">
            {user.email}
          </p>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-100/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl" />
      </div>

      {/* Main Content */}
      <div className="max-w-5xl">
        <ProfileForm user={user} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}} />
    </div>
  );
}
