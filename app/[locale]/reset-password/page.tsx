import ResetPasswordForm from "./ResetPasswordForm";
import { DecorativeVideo } from "@/app/components/DecorativeVideo";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side: Reset Password Form */}
      <div className="flex items-center justify-center p-4 py-12">
        <ResetPasswordForm />
      </div>

      {/* Right side: Video (only on large screens) */}
      <div className="hidden lg:block relative overflow-hidden bg-navy-primary my-4 mr-4 rounded-[32px] shadow-2xl">
        <DecorativeVideo
          src="/hero_video.mp4"
          className="absolute inset-0 h-full w-full"
          videoClassName="h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/40 to-transparent" />
      </div>
    </main>
  );
}
