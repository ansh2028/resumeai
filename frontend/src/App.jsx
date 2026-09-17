// ==============================================================================
// 🌳 App.jsx - THE ROOT COMPONENT
// ==============================================================================
// This file wraps our entire website in two big protective blankets:
// 1. AuthProvider: Gives every page access to the logged-in user state.
// 2. InterviewProvider: Gives every page access to interview reports & history.
// 3. RouterProvider: Decides which page component to display based on the URL.
// ==============================================================================

import { RouterProvider } from "react-router";
import { router } from "./app.routes.jsx";
import { AuthProvider } from "../features/auth/auth.context.jsx";
import { InterviewProvider } from "../features/interview/interview.context.jsx";
import './style.scss';

const App = () => {
  return (
    <AuthProvider>
      <InterviewProvider>
        <RouterProvider router={router} />
      </InterviewProvider>
    </AuthProvider>
  );
};

export default App; 