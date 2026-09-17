// ==============================================================================
// 🚦 app.routes.jsx - REACT ROUTER ROADMAP
// ==============================================================================
// Think of this file like a set of road signs:
// - If the user goes to "/", show the <Home /> page (generate interview strategy).
// - If the user goes to "/login", show the <Login /> page.
// - If the user goes to "/register", show the <Register /> page.
// - If the user goes to "/interview/:interviewId", show the <Interview /> results dashboard!
// Notice that <Protected> wraps private pages: if you aren't logged in,
// it bounces you to /login!
// ==============================================================================

import { createBrowserRouter } from "react-router";
import Login from "../features/auth/pages/login";
import Register from "../features/auth/pages/register";
import Protected from "../features/auth/components/protected.jsx";
import Home from "../features/interview/pages/Home.jsx";
import Interview from "../features/interview/pages/Interview.jsx";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <Protected><Home /></Protected>
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/interview/:interviewId",
        element: <Protected><Interview /></Protected>
    },
    {
        path: "/interview",
        element: <Protected><Interview /></Protected>
    }
]);
