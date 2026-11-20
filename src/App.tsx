import { useState } from 'react';
import { AboutPage } from './components/AboutPage';
import { AnalysisHistory } from './components/AnalysisHistory';
import { AuthPages } from './components/AuthPages';
import { DashboardHome } from './components/DashboardHome';
import { DashboardLayout } from './components/DashboardLayout';
import { JobFraudDetection } from './components/JobFraudDetection';
import { JobRecommendations } from './components/JobRecommendations';
import { LandingPage } from './components/LandingPage';
import { ProfilePage } from './components/ProfilePage';
import { RecruitmentCallDetection } from './components/RecruitmentCallDetection';
import { ResumeAnalysis } from './components/ResumeAnalysis';
import type { AppRoute, AuthView, UserAccount } from './types/trusthire';

const GUEST_EVALUATOR_USER: UserAccount = {
  id: 'usr-demo-1',
  name: 'Capstone Evaluator',
  email: 'student@trusthire.edu',
  role: 'Final-Year Engineering Student',
  institution: 'Department of Computer Science & Engineering',
  targetRole: 'Python / ML Engineer',
  createdAt: new Date().toISOString(),
  authMode: 'session-preview',
};

const WORKSPACE_ROUTES: AppRoute[] = [
  'dashboard',
  'job-fraud',
  'call-fraud',
  'resume-analysis',
  'job-recommendations',
  'history',
  'profile',
];

export default function App() {
  const [route, setRoute] = useState<AppRoute>('landing');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [matchedSkillsFromResume, setMatchedSkillsFromResume] = useState<
    string[] | undefined
  >(undefined);

  const navigate = (nextRoute: AppRoute, mode?: AuthView) => {
    if (mode) setAuthView(mode);

    // If entering a workspace route directly from Landing Page, ensure an active
    // evaluator session exists so every module button works seamlessly.
    if (WORKSPACE_ROUTES.includes(nextRoute) && !currentUser) {
      setCurrentUser(GUEST_EVALUATOR_USER);
    }

    setRoute(nextRoute);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSuccess = (user: UserAccount) => {
    setCurrentUser(user);
    setRoute('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setRoute('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (route === 'landing') {
    return <LandingPage currentUser={currentUser} onNavigate={navigate} />;
  }

  if (route === 'auth') {
    return (
      <AuthPages
        initialView={authView}
        onSuccess={handleAuthSuccess}
        onBackHome={() => navigate('landing')}
      />
    );
  }

  if (route === 'about' && !currentUser) {
    return (
      <AboutPage
        embedded={false}
        currentUser={currentUser}
        onNavigate={navigate}
      />
    );
  }

  const activeUser = currentUser ?? GUEST_EVALUATOR_USER;

  return (
    <DashboardLayout
      currentRoute={route}
      user={activeUser}
      onNavigate={(r) => navigate(r)}
      onLogout={handleLogout}
    >
      {route === 'dashboard' && <DashboardHome onNavigate={navigate} />}
      {route === 'job-fraud' && <JobFraudDetection />}
      {route === 'call-fraud' && <RecruitmentCallDetection />}
      {route === 'resume-analysis' && (
        <ResumeAnalysis
          onViewRecommendations={(skills) => {
            setMatchedSkillsFromResume(skills);
            navigate('job-recommendations');
          }}
        />
      )}
      {route === 'job-recommendations' && (
        <JobRecommendations
          initialSkills={matchedSkillsFromResume}
          onGoToResume={() => navigate('resume-analysis')}
        />
      )}
      {route === 'history' && <AnalysisHistory />}
      {route === 'about' && (
        <AboutPage
          embedded
          currentUser={activeUser}
          onNavigate={navigate}
        />
      )}
      {route === 'profile' && (
        <ProfilePage
          user={activeUser}
          onUpdateUser={setCurrentUser}
          onLogout={handleLogout}
        />
      )}
    </DashboardLayout>
  );
}
