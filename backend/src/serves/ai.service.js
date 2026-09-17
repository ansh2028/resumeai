// ==============================================================================
// 🧠 ai.service.js - THE MASTER CHEF (GEMINI AI & PUPPETEER)
// ==============================================================================
// This file does two magical things:
// 1. Talks to Google Gemini AI:
//    We send the resume and job description to Gemini.
//    We use "Zod" to give Gemini a strict recipe (schema) so it returns pure JSON
//    with exact fields (matchScore, questions, roadmaps) instead of chatting!
// 2. Creates PDF Resumes with Puppeteer:
//    Gemini writes ATS-friendly HTML for a tailored resume.
//    Puppeteer opens a hidden, invisible web browser, loads that HTML,
//    and prints it out into a clean, downloadable PDF file!
// ==============================================================================

const { GoogleGenAI } = require("@google/genai");
const puppeteer = require("puppeteer");

// Connect to Google Gemini using our API key
const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_KEY
});

// List of available Gemini models in priority order.
// If one model is busy (503) or unavailable, we automatically try the next!
const AI_MODELS = [
    "gemini-3.7-flash",
    "gemini-3-flash-preview",
    "gemini-3.6-flash"
];

// Helper to call Gemini with automatic fallback between models
async function callGeminiWithFallback({ prompt, schema }) {
    let lastError = null;

    for (const model of AI_MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: schema
                }
            });

            if (response && response.text) {
                return JSON.parse(response.text);
            }
        } catch (err) {
            console.warn(`[Gemini AI] Model ${model} failed (${err.status || err.message}). Trying fallback...`);
            lastError = err;
        }
    }

    throw new Error(`All Gemini models failed. Last error: ${lastError?.message || "Unknown"}`);
}

// ------------------------------------------------------------------------------
// 📝 1. Direct JSON Schema: The strict recipe for the Interview Report
// ------------------------------------------------------------------------------
const interviewReportSchema = {
    type: "object",
    properties: {
        title: { 
            type: "string", 
            description: "The job title for this position" 
        },
        matchScore: { 
            type: "number", 
            description: "A score between 0 and 100 indicating how well candidate fits the job" 
        },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The technical interview question" },
                    intention: { type: "string", description: "Why the interviewer asks this" },
                    answer: { type: "string", description: "Clear model answer and points to cover" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Technical questions likely to be asked"
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string", description: "The behavioral interview question" },
                    intention: { type: "string", description: "Why the interviewer asks this" },
                    answer: { type: "string", description: "STAR method model answer" }
                },
                required: ["question", "intention", "answer"]
            },
            description: "Behavioral questions likely to be asked"
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string", description: "Missing or weak skill" },
                    severity: { type: "string", enum: ["low", "medium", "high"], description: "Gap severity" }
                },
                required: ["skill", "severity"]
            },
            description: "Identified skill gaps"
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer", description: "Day number starting from 1" },
                    focus: { type: "string", description: "Core focus topic for this day" },
                    tasks: { 
                        type: "array", 
                        items: { type: "string" },
                        description: "Actionable study or practice tasks" 
                    }
                },
                required: ["day", "focus", "tasks"]
            },
            description: "Day-by-day preparation schedule"
        }
    },
    required: ["title", "matchScore", "technicalQuestions", "behavioralQuestions", "skillGaps", "preparationPlan"]
};

// ------------------------------------------------------------------------------
// 🤖 2. generateInterviewReport(): Asks Gemini to analyze the candidate
// ------------------------------------------------------------------------------
async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a complete, structured interview preparation report for a candidate with the following details:
        Candidate Resume: ${resume || "No resume file provided"}
        Candidate Self Description: ${selfDescription || "No self description provided"}
        Target Job Description: ${jobDescription}

        Make sure:
        - "title" is the exact position title extracted from the Job Description.
        - "matchScore" is an integer between 0 and 100.
        - "technicalQuestions" contains at least 3 high-yield questions with intention and answer.
        - "behavioralQuestions" contains at least 3 behavioral questions with intention and answer.
        - "skillGaps" contains skills required by the job that candidate is missing.
        - "preparationPlan" contains a 5 to 7 day structured roadmap.
    `;

    return await callGeminiWithFallback({
        prompt,
        schema: interviewReportSchema
    });
}

// ------------------------------------------------------------------------------
// 🖨️ 3. generatePdfFromHtml(): Invisible Browser prints HTML into PDF
// ------------------------------------------------------------------------------
async function generatePdfFromHtml(htmlContent) {
    let browser = null;
    try {
        // Step A: Open headless browser with serverless-friendly flags
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-dev-shm-usage",
                "--disable-gpu",
                "--no-first-run",
                "--no-zygote",
                "--single-process"
            ]
        });
        const page = await browser.newPage();

        // Step B: Paste the HTML into the browser tab and wait for it to load
        await page.setContent(htmlContent, { waitUntil: "networkidle0" });

        // Step C: "Print" the page into an A4 PDF document
        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: {
                top: "20mm",
                bottom: "20mm",
                left: "15mm",
                right: "15mm"
            }
        });

        // Step D: Close the hidden browser so it doesn't waste memory
        await browser.close();
        return pdfBuffer;
    } catch (err) {
        console.warn("⚠️ [Puppeteer] Headless browser could not run in this environment:", err.message);
        if (browser) {
            await browser.close().catch(() => {});
        }
        // Graceful fallback: return HTML document as downloadable buffer so request never crashes 500
        return Buffer.from(htmlContent, "utf-8");
    }
}

// ------------------------------------------------------------------------------
// 📄 4. generateResumePdf(): Gemini designs the resume, Puppeteer prints it
// ------------------------------------------------------------------------------
const resumePdfSchema = {
    type: "object",
    properties: {
        html: { 
            type: "string", 
            description: "The complete, ATS-friendly HTML string of the tailored resume with embedded CSS styling" 
        }
    },
    required: ["html"]
};

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate an ATS-friendly, clean single-page HTML resume tailored for this candidate and job:
        Resume Text: ${resume || "No resume text"}
        Self Description: ${selfDescription || "No self description"}
        Job Description: ${jobDescription}

        Output clean HTML with modern embedded CSS styling that looks professional when printed to A4 PDF.
    `;

    const jsonContent = await callGeminiWithFallback({
        prompt,
        schema: resumePdfSchema
    });

    // Print that HTML into a real PDF buffer
    return await generatePdfFromHtml(jsonContent.html);
}

module.exports = { generateInterviewReport, generateResumePdf };