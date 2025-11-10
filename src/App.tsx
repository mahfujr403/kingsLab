import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Suspense, lazy, useEffect } from "react";
import { Toaster } from "./components/ui/sonner";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { GlobalLoader } from "./components/GlobalLoader";
import { AdminRoute } from "./components/admin/AdminRoute";
import { MainSiteSkeleton } from "./components/PageSkeleton";

// Lazy load main site components
const Navigation = lazy(() =>
  import("./components/Navigation").then((m) => ({
    default: m.Navigation,
  })),
);
const HeroAI = lazy(() =>
  import("./components/HeroAI").then((m) => ({
    default: m.HeroAI,
  })),
);
const ResearchAreas = lazy(() =>
  import("./components/ResearchAreas").then((m) => ({
    default: m.ResearchAreas,
  })),
);
const Publications = lazy(() =>
  import("./components/Publications").then((m) => ({
    default: m.Publications,
  })),
);
const TeamSection = lazy(() =>
  import("./components/TeamSection").then((m) => ({
    default: m.TeamSection,
  })),
);
const OurJourney = lazy(() =>
  import("./components/OurJourney").then((m) => ({
    default: m.OurJourney,
  })),
);
const ContactSection = lazy(() =>
  import("./components/ContactSection").then((m) => ({
    default: m.ContactSection,
  })),
);
const Footer = lazy(() =>
  import("./components/Footer").then((m) => ({
    default: m.Footer,
  })),
);
const SkipToContent = lazy(() =>
  import("./components/SkipToContent").then((m) => ({
    default: m.SkipToContent,
  })),
);

// Debug panel for API testing
import { ApiDebugPanel } from "./components/ApiDebugPanel";
// Uncomment below to show persistent API status warning when backend is down
// import { ApiStatusIndicator } from "./components/ApiStatusIndicator";

// Lazy load all admin pages
const LoginPage = lazy(() =>
  import("./pages/admin/LoginPage").then((m) => ({
    default: m.LoginPage,
  })),
);
const DashboardPage = lazy(() =>
  import("./pages/admin/DashboardPage").then((m) => ({
    default: m.DashboardPage,
  })),
);
const ResearchAreasManager = lazy(() =>
  import("./pages/admin/ResearchAreasManager").then((m) => ({
    default: m.ResearchAreasManager,
  })),
);
const TeamMembersManager = lazy(() =>
  import("./pages/admin/TeamMembersManager").then((m) => ({
    default: m.TeamMembersManager,
  })),
);
const PublicationsManager = lazy(() =>
  import("./pages/admin/PublicationsManager").then((m) => ({
    default: m.PublicationsManager,
  })),
);
const ContactSubmissionsManager = lazy(() =>
  import("./pages/admin/ContactSubmissionsManager").then(
    (m) => ({ default: m.ContactSubmissionsManager }),
  ),
);
const LabInfoManager = lazy(() =>
  import("./pages/admin/LabInfoManager").then((m) => ({
    default: m.LabInfoManager,
  })),
);
const TimelineManager = lazy(() =>
  import("./pages/admin/TimelineManager").then((m) => ({
    default: m.TimelineManager,
  })),
);

function MainSite() {
  useEffect(() => {
    // Smooth scroll behavior (respects prefers-reduced-motion)
    const mediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (!mediaQuery.matches) {
      document.documentElement.style.scrollBehavior = "smooth";
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<MainSiteSkeleton />}>
        <SkipToContent />
        <Navigation />
        <main id="main-content" tabIndex={-1}>
          <HeroAI />
          <ResearchAreas />
          <Publications />
          <TeamSection />
          <OurJourney />
          <ContactSection />
        </main>
        <Footer />
      </Suspense>
      <ApiDebugPanel />
    </div>
  );
}

// Admin wrapper to force light theme (for login page only)
function AdminWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Save the user's theme preference
    const userTheme = localStorage.getItem("theme");
    const savedUserTheme = userTheme;

    const root = document.documentElement;

    // Force light theme for admin login
    root.classList.remove("dark");
    root.classList.add("light");
    root.setAttribute("data-admin-mode", "true");

    return () => {
      // Restore user's theme when leaving admin login
      root.removeAttribute("data-admin-mode");
      root.classList.remove("light");

      // Restore the user's actual theme preference
      if (savedUserTheme === "dark") {
        root.classList.add("dark");
      } else {
        root.classList.add("light");
      }
    };
  }, []);

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Suspense fallback={<GlobalLoader />}>
            <Routes>
              {/* Main Website */}
              <Route path="/" element={<MainSite />} />

              {/* Admin Login - Light theme only */}
              <Route
                path="/admin/login"
                element={
                  <AdminWrapper>
                    <LoginPage />
                  </AdminWrapper>
                }
              />

              {/* Protected Admin Routes - All use AdminRoute wrapper */}
              <Route
                path="/admin/dashboard"
                element={
                  <AdminRoute>
                    <DashboardPage />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/research-areas"
                element={
                  <AdminRoute>
                    <ResearchAreasManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/team-members"
                element={
                  <AdminRoute>
                    <TeamMembersManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/publications"
                element={
                  <AdminRoute>
                    <PublicationsManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/contact-submissions"
                element={
                  <AdminRoute>
                    <ContactSubmissionsManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/lab-info"
                element={
                  <AdminRoute>
                    <LabInfoManager />
                  </AdminRoute>
                }
              />
              <Route
                path="/admin/timeline"
                element={
                  <AdminRoute>
                    <TimelineManager />
                  </AdminRoute>
                }
              />

              {/* Redirects */}
              <Route
                path="/admin"
                element={
                  <Navigate to="/admin/dashboard" replace />
                }
              />
              <Route
                path="/preview_page.html"
                element={<MainSite />}
              />
              <Route path="*" element={<MainSite />} />
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}