import { AmbientBackground } from "@/components/shell/AmbientBackground";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh items-center justify-center overflow-x-clip px-4 py-12">
      <AmbientBackground />
      <main id="main" className="w-full max-w-md animate-rise">
        {children}
      </main>
    </div>
  );
}
