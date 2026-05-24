import { ReactNode } from "react";

export function CRTLayout({ children }: { children: ReactNode }) {
  return (
    <div className="crt min-h-screen w-full relative shake-soft">
      <div className="noise" />
      {children}
    </div>
  );
}
