console.log('App.tsx module evaluation start');
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import SectionView from './components/SectionView';
import FocusPlanner from './components/FocusPlanner';
import BottomNavbar from './components/BottomNavbar';
import WelcomeScreen from './components/WelcomeScreen';
import WorkoutDashboard from './components/WorkoutDashboard';
import {
  EditCoreStrength, EditKettlebell, EditFieldTraining,
  EditFoamRolling, EditHybrid, EditLowerBody, EditRecovery, EditCalisthenics,
  EditUpperBody, EditAesthetic, EditKickboxing, EditMobilityFlow,
  EditEnduranceRun, EditPowerlifting, EditPlyometrics
} from './components/EditWorkouts';
import AIDashboard from './components/AIDashboard';
import AINotebook from './components/AINotebook';
import AIAgents from './components/AIAgents';
import AIWorkflows from './components/AIWorkflows';
import AIPromptLibrary from './components/AIPromptLibrary';
import CreateCustomExercise from './components/CreateCustomExercise';
import AITools from './components/AITools';
import AIGoogleSearch from './components/AIGoogleSearch';
import AIWorkflowDetail from './components/AIWorkflowDetail';
import WorkoutCategories from './components/WorkoutCategories';
import AddExercise from './components/AddExercise';
import AddCategory from './components/AddCategory';
import CustomCategoryView from './components/CustomCategoryView';
import PRDSectionBuilder from './components/PRDSectionBuilder';
import DynamicSection from './components/DynamicSection';
import Scratchpad from './components/Scratchpad';
import NanoBananaAI from './components/NanoBananaAI';
import Stats from './components/Stats';
import AIWallet from './components/AIWallet';
import AddYouTubeSource from './components/AddYouTubeSource';
import LearningSection from './components/LearningSection';

// LifeTracker MVP Components

import MeditationSystem from './components/MeditationSystem';
import ReadingSystem from './components/ReadingSystem';
import ReadingLibraryNew from './components/ReadingLibraryNew';
import TaskManager from './components/TaskManager';
import NotesReflection from './components/NotesReflection';
import Profile from './components/Profile';
import PlannerPage from './components/PlannerPage';
import CodingSection from './components/CodingSection';
import SkimNews from './components/SkimNews';
import PersonalBoard from './components/PersonalBoard';
import SearchDirectory from './components/SearchDirectory';
import BusinessSection from './components/BusinessSection';
import FreelancingSection from './components/FreelancingSection';
import BrandingSection from './components/BrandingSection';
import NetworkingSection from './components/NetworkingSection';
import MarketSection from './components/MarketSection';
import LooksmaxxingSection from './components/LooksmaxxingSection';
import FinancialLearningSection from './components/FinancialLearningSection';
import Onboarding from './components/Onboarding';

// Auth Components
import AuthScreen from './components/AuthScreen';
import AdminUserManagement from './components/AdminUserManagement';
import { AuthProvider } from './contexts/AuthContext';
import { ContentProtectionProvider } from './contexts/ContentProtectionContext';
import { NotificationProvider } from './contexts/NotificationContext';


import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useState } from 'react';

// Helper component to handle smooth scrolling with Router context
const ScrollHandler = () => {
  useSmoothScroll();
  return null;
};

const App: React.FC = () => {
  console.log('App component rendering');
  const [isNanoBananaOpen, setIsNanoBananaOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  return (
    <AuthProvider>
      <NotificationProvider>
        <ContentProtectionProvider>
          <Router>
            <ScrollHandler />
            <div className="min-h-screen bg-gray-50 dark:bg-[#111111] text-gray-900 dark:text-gray-100 font-sans transition-colors duration-500">
              {/* Main app container - no overflow, allows natural page scroll */}
              <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-[#1A1A1A] shadow-xl relative transition-colors duration-500 overflow-x-hidden">
                <Routes>
                  <Route path="/" element={<WelcomeScreen />} />
                  <Route path="/login" element={<AuthScreen initialMode="login" />} />
                  <Route path="/signup" element={<AuthScreen initialMode="signup" />} />
                  <Route path="/admin/users" element={<AdminUserManagement />} />
                  <Route path="/onboarding" element={<Onboarding />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/section/workout" element={<WorkoutDashboard />} />
                  <Route path="/workout/core" element={<EditCoreStrength />} />
                  <Route path="/workout/kettlebell" element={<EditKettlebell />} />
                  <Route path="/workout/field" element={<EditFieldTraining />} />
                  <Route path="/workout/foam-rolling" element={<EditFoamRolling />} />
                  <Route path="/workout/hybrid" element={<EditHybrid />} />
                  <Route path="/workout/lower-body" element={<EditLowerBody />} />
                  <Route path="/workout/recovery" element={<EditRecovery />} />
                  <Route path="/workout/create-exercise" element={<CreateCustomExercise />} />
                  <Route path="/workout/calisthenics" element={<EditCalisthenics />} />
                  <Route path="/workout/upper-body" element={<EditUpperBody />} />
                  <Route path="/workout/aesthetic" element={<EditAesthetic />} />
                  <Route path="/workout/kickboxing" element={<EditKickboxing />} />
                  <Route path="/workout/mobility" element={<EditMobilityFlow />} />
                  <Route path="/workout/endurance" element={<EditEnduranceRun />} />
                  <Route path="/workout/powerlifting" element={<EditPowerlifting />} />
                  <Route path="/workout/plyometrics" element={<EditPlyometrics />} />
                  <Route path="/section/ai" element={<AIDashboard />} />
                  <Route path="/ai/notebook" element={<AINotebook />} />
                  <Route path="/ai/prompts" element={<AIPromptLibrary />} />
                  <Route path="/ai/tools" element={<AITools />} />
                  <Route path="/ai/search" element={<AIGoogleSearch />} />
                  <Route path="/ai/news" element={<SkimNews />} />
                  <Route path="/ai/use-cases" element={<AIWorkflows />} />
                  <Route path="/ai/workflow/detail" element={<AIWorkflowDetail />} />
                  <Route path="/ai/agents" element={<AIAgents />} />
                  <Route path="/ai/wallet" element={<AIWallet />} />
                  <Route path="/ai/add-youtube" element={<AddYouTubeSource />} />
                  <Route path="/learning" element={<LearningSection />} />

                  <Route path="/workout/categories" element={<WorkoutCategories />} />
                  <Route path="/workout/categories/add" element={<AddCategory />} />
                  <Route path="/workout/add-exercise" element={<AddExercise />} />
                  <Route path="/section/custom/:id" element={<CustomCategoryView />} />
                  <Route path="/prd-builder" element={<PRDSectionBuilder />} />
                  <Route path="/section/dynamic/:id" element={<DynamicSection />} />
                  <Route path="/section/:id" element={<SectionView />} />
                  <Route path="/focus-planner" element={<FocusPlanner />} />
                  <Route path="/planner" element={<PlannerPage />} />
                  <Route path="/stats" element={<Stats />} />

                  {/* LifeTracker MVP Routes */}

                  <Route path="/board" element={<PersonalBoard />} />
                  <Route path="/section/meditation" element={<MeditationSystem />} />
                  <Route path="/section/reading" element={<ReadingSystem />} />
                  <Route path="/section/reading/library" element={<ReadingLibraryNew />} />
                  <Route path="/section/tasks" element={<TaskManager />} />
                  <Route path="/section/notes" element={<NotesReflection />} />
                  <Route path="/section/coding" element={<CodingSection />} />
                  <Route path="/section/freelancing" element={<FreelancingSection />} />
                  <Route path="/section/branding" element={<BrandingSection />} />
                  <Route path="/section/networking" element={<NetworkingSection />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/section/business" element={<BusinessSection />} />
                  <Route path="/section/market" element={<MarketSection />} />
                  <Route path="/section/looksmaxing" element={<LooksmaxxingSection />} />
                  <Route path="/section/finance-learning" element={<FinancialLearningSection />} />
                  <Route path="/skim-news" element={<SkimNews />} />
                  <Route path="/directory" element={<SearchDirectory />} />
                </Routes>
                <NanoBananaAI isOpen={isNanoBananaOpen} onClose={() => setIsNanoBananaOpen(false)} />

                {/* Global Scratchpad */}
                <Scratchpad isOpen={isScratchpadOpen} onClose={() => setIsScratchpadOpen(false)} />

                <BottomNavbar onOpenScratchpad={() => setIsScratchpadOpen(true)} />
              </div>
            </div>
          </Router>
        </ContentProtectionProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
