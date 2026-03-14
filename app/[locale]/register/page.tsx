import { Metadata } from "next";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Register | Euro Remote Career",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left side: Register Form */}
      <div className="flex items-center justify-center px-4 py-8 lg:py-12">
        <RegisterForm />
      </div>

      {/* Right side: Video (only on large screens) */}
      <div className="hidden lg:block relative overflow-hidden bg-navy-primary my-4 mr-4 rounded-[32px] shadow-2xl">
        <video
          src="/hero_video.mp4"
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-primary/40 to-transparent" />
      </div>
    </main>
  );
}
