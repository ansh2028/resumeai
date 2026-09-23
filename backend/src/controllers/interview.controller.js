// ==============================================================================
// 🎯 interview.controller.js - THE INTERVIEW REPORT MANAGER
// ==============================================================================
// This file is the Kitchen Chef for all interview-related requests:
// 1. generateInterViewReportController:
//    - Takes the uploaded resume PDF from the user's browser.
//    - Uses pdf-parse to extract all the text words from the PDF.
//    - Calls Gemini AI to analyze the match and generate questions & roadmap.
//    - Saves the final report into MongoDB and returns it to the frontend!
// 2. getInterviewReportByIdController:
//    - Fetches one specific report when the user visits /interview/:id.
// 3. getAllInterviewReportsController:
//    - Fetches all previous reports created by the logged-in user.
// 4. generateResumePdfController:
//    - Calls Puppeteer to turn the AI resume into a downloadable PDF!
// ==============================================================================

const pdfParse = require("pdf-parse");
const { generateInterviewReport, generateResumePdf } = require("../serves/ai.service");
const interviewReportModel = require("../config/models/interviewReport.model");

// ------------------------------------------------------------------------------
// 🚀 1. GENERATE A NEW INTERVIEW REPORT
// ------------------------------------------------------------------------------
async function generateInterViewReportController(req, res) {
    try {
        // Step A: If the user uploaded a PDF resume, extract all the text from it
        let resumeText = "";
        if (req.file && req.file.buffer) {
            try {
                if (typeof pdfParse === "function") {
                    const resumeContent = await pdfParse(req.file.buffer);
                    resumeText = resumeContent?.text || "";
                } else if (pdfParse && typeof pdfParse.PDFParse === "function") {
                    const parser = new pdfParse.PDFParse(Uint8Array.from(req.file.buffer));
                    const resumeContent = await parser.getText();
                    resumeText = resumeContent?.text || "";
                }
            } catch (pdfErr) {
                console.warn("⚠️ [PDF Parser] Warning: Could not extract text from uploaded PDF:", pdfErr.message);
                // Fallback gracefully so an unusual PDF formatting doesn't fail the entire request
                resumeText = `Uploaded document: ${req.file.originalname || "resume.pdf"}`;
            }
        }

        // Step B: Get the job description and self description from the form
        const { selfDescription, jobDescription } = req.body;

        if (!jobDescription || !jobDescription.trim()) {
            return res.status(400).json({
                message: "Job description is required."
            });
        }

        if (!resumeText.trim() && (!selfDescription || !selfDescription.trim())) {
            return res.status(400).json({
                message: "Either a resume or a self description is required."
            });
        }

        // Step C: Send the text to Gemini AI
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        // Step D: Save this brand new report in MongoDB
        const interviewReport = await interviewReportModel.create({
            user: req.user?._id || req.user?.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interViewReportByAi
        });

        // Step E: Send back the saved report to React!
        return res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (error) {
        console.error("Error generating interview report:", error);
        return res.status(500).json({
            message: error.message || "Failed to generate interview report."
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params

        const userId = req.user?._id || req.user?.id;
        const interviewReport = await interviewReportModel.findOne({ 
            _id: interviewId, 
            ...(userId ? { user: userId } : {}) 
        }) || await interviewReportModel.findById(interviewId);

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        return res.status(200).json({
            message: "Interview report fetched successfully.",
            interviewReport
        })
    } catch (error) {
        console.error("Error fetching interview report:", error)
        return res.status(500).json({
            message: error.message || "Failed to fetch interview report."
        })
    }
}

/** 
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    try {
        const interviewReports = await interviewReportModel.find({ user: req.user?._id || req.user?.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully.",
            interviewReports
        })
    } catch (error) {
        console.error("Error fetching all interview reports:", error)
        return res.status(500).json({
            message: error.message || "Failed to fetch interview reports."
        })
    }
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params

        const interviewReport = await interviewReportModel.findById(interviewReportId)

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found."
            })
        }

        const { resume, jobDescription, selfDescription } = interviewReport

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription })

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        })

        return res.send(pdfBuffer)
    } catch (error) {
        console.error("Error generating resume PDF:", error)
        return res.status(500).json({
            message: error.message || "Failed to generate resume PDF."
        })
    }
}

module.exports = { generateInterViewReportController, getInterviewReportByIdController, getAllInterviewReportsController, generateResumePdfController }