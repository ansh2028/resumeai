// ==============================================================================
// 🪝 useinterview.js - THE INTERVIEW MAGIC WAND (CUSTOM HOOK)
// ==============================================================================
// Custom hooks in React are like magic helper wands.
// Instead of writing messy fetch calls and state updates in our UI buttons,
// any page can just call `const { generateReport, reports, loading } = useInterview()`.
// This hook manages:
// 1. generateReport: Sends your resume & job details to the backend.
// 2. getReportById: Fetches the report details for the results screen.
// 3. getReports: Loads your recent interview strategies list.
// 4. getResumePdf: Calls the backend and triggers a real PDF download.
// ==============================================================================

import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api";
import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    // 1. Send resume and job description to get back an interview strategy
    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        let response = null;
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            if (response?.interviewReport) {
                setReport(response.interviewReport);
            }
        } catch (error) {
            console.error("Failed to generate interview report:", error);
            const msg = error.response?.data?.message || error.message || "Failed to generate interview report. Please try again.";
            alert(msg);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }

        return response?.interviewReport;
    };

    const getReportById = async (interviewId) => {
        setLoading(true)
        let response = null
        try {
            response = await getInterviewReportById(interviewId)
            setReport(response?.interviewReport)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
        return response?.interviewReport
    }

    const getReports = async () => {
        setLoading(true)
        let response = null
        try {
            response = await getAllInterviewReports()
            setReports(response?.interviewReports || [])
        } catch (error) {
            console.log(error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                window.location.href = "/login";
            }
        } finally {
            setLoading(false)
        }

        return response?.interviewReports || []
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}