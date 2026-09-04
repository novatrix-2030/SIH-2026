import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import ThemeToggle from "../components/ThemeToggle";
import ScrollProgressBar from "../components/ScrollProgressBar";

export const metadata = {
  title: "DropGuard — Student Dropout Early Warning System",
  description: "AI-powered early-warning system for student dropout risk prediction with explainable insights and actionable interventions. Built for SIH 2026.",
  keywords: "student dropout, early warning, AI, machine learning, education, SIH 2026",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ThemeProvider>
          <ScrollProgressBar />
          <ThemeToggle floating={true} />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
