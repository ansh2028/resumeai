// ==============================================================================
// 🏠 Home.jsx - THE INTERVIEW BUILDER DASHBOARD
// ==============================================================================
// This is the main screen where the user builds their interview strategy:
// 1. Left side: A textarea where they paste the target job description.
// 2. Right side: A dropzone to upload their resume PDF (or type a self-description).
// 3. Generate Button: Grabs the inputs, sends them to Gemini AI via useInterview(),
//    and navigates to /interview/:id when the report is ready!
// 4. Bottom: Shows a list of recent reports so users can re-visit old strategies.
// ==============================================================================

import React, { useState, useRef } from 'react';
import "../style/home.scss";
import { useInterview } from '../hooks/useInterview.js';
import { useNavigate } from 'react-router';

const Home = () => {
    // Grab global interview state and actions
    const { loading, generateReport, reports } = useInterview();

    // Local form states
    const [ jobDescription, setJobDescription ] = useState("");
    const [ selfDescription, setSelfDescription ] = useState("");
    const [ resumeFile, setResumeFile ] = useState(null);
    const [ isDragging, setIsDragging ] = useState(false);
    const resumeInputRef = useRef();

    const navigate = useNavigate();

    // Helper to validate and set the uploaded resume PDF
    const handleFileChange = (file) => {
        if (!file) return;
        if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
            alert("Please upload a valid PDF document (.pdf).");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            alert("File size exceeds 10MB limit. Please upload a smaller PDF.");
            return;
        }
        setResumeFile(file);
    };

    // Helper to clear the uploaded file
    const handleRemoveFile = (e) => {
        e.stopPropagation();
        setResumeFile(null);
        if (resumeInputRef.current) {
            resumeInputRef.current.value = "";
        }
    };

    // Triggered when clicking "Generate My Interview Strategy"
    const handleGenerateReport = async (e) => {
        if (e) e.preventDefault();
        if (!jobDescription.trim()) {
            alert("Please paste the target job description first!");
            return;
        }
        if (!resumeFile && !selfDescription.trim()) {
            alert("Please upload your resume PDF or write a quick self-description!");
            return;
        }

        const data = await generateReport({ 
            jobDescription, 
            selfDescription, 
            resumeFile 
        });

        if (data?._id) {
            navigate(`/interview/${data._id}`);
        }
    };

    // Show a clean loading message while the AI is thinking
    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading your interview plan...</h1>
            </main>
        );
    }

    return (
        <div className='home-page'>

            {/* Page Header */}
            <header className='page-header'>
                <h1>Create Your Custom <span className='highlight'>Interview Plan</span></h1>
                <p>Let our AI analyze the job requirements and your unique profile to build a winning strategy.</p>
            </header>

            {/* Main Card */}
            <div className='interview-card'>
                <div className='interview-card__body'>

                    {/* Left Panel - Job Description */}
                    <div className='panel panel--left'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                            </span>
                            <h2>Target Job Description</h2>
                            <span className='badge badge--required'>Required</span>
                        </div>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            className='panel__textarea'
                            placeholder={`Paste the full job description here...\ne.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'`}
                            maxLength={5000}
                        />
                        <div className='char-counter'>{jobDescription.length} / 5000 chars</div>
                    </div>

                    {/* Vertical Divider */}
                    <div className='panel-divider' />

                    {/* Right Panel - Profile */}
                    <div className='panel panel--right'>
                        <div className='panel__header'>
                            <span className='panel__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                            </span>
                            <h2>Your Profile</h2>
                        </div>

                        {/* Upload Resume */}
                        <div className='upload-section'>
                            <label className='section-label'>
                                Upload Resume
                                <span className='badge badge--best'>Best Results</span>
                            </label>

                            {/* Hidden file input controlled by React */}
                            <input 
                                ref={resumeInputRef} 
                                type='file' 
                                id='resume' 
                                name='resume' 
                                accept='.pdf,application/pdf'
                                style={{ display: 'none' }}
                                onChange={(e) => {
                                    if (e.target.files && e.target.files[0]) {
                                        handleFileChange(e.target.files[0]);
                                    }
                                }}
                            />

                            {/* Clickable and Draggable Dropzone */}
                            <div 
                                className={`dropzone ${isDragging ? 'dropzone--dragging' : ''} ${resumeFile ? 'dropzone--has-file' : ''}`}
                                onClick={() => resumeInputRef.current?.click()}
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    setIsDragging(true);
                                }}
                                onDragLeave={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    setIsDragging(false);
                                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                                        handleFileChange(e.dataTransfer.files[0]);
                                    }
                                }}
                            >
                                {resumeFile ? (
                                    <>
                                        <span className='dropzone__icon dropzone__icon--success'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <polyline points="9 15 11 17 15 13" />
                                            </svg>
                                        </span>
                                        <p className='dropzone__title dropzone__title--selected'>{resumeFile.name}</p>
                                        <p className='dropzone__subtitle'>
                                            {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB &bull; Click to change
                                        </p>
                                        <button
                                            type='button'
                                            className='dropzone__remove-btn'
                                            onClick={handleRemoveFile}
                                        >
                                            ✕ Remove Resume
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <span className='dropzone__icon'>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="16 18 12 12 8 16" />
                                                <line x1="12" y1="12" x2="12" y2="21" />
                                                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
                                            </svg>
                                        </span>
                                        <p className='dropzone__title'>Click to upload or drag &amp; drop</p>
                                        <p className='dropzone__subtitle'>PDF Document (Max 10MB)</p>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* OR Divider */}
                        <div className='or-divider'><span>OR</span></div>

                        {/* Quick Self-Description */}
                        <div className='self-description'>
                            <label className='section-label' htmlFor='selfDescription'>Quick Self-Description</label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                id='selfDescription'
                                name='selfDescription'
                                className='panel__textarea panel__textarea--short'
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        {/* Info Box */}
                        <div className='info-box'>
                            <span className='info-box__icon'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" stroke="#1a1f27" strokeWidth="2" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="#1a1f27" strokeWidth="2" /></svg>
                            </span>
                            <p>Either a <strong>Resume</strong> or a <strong>Self Description</strong> is required to generate a personalized plan.</p>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className='interview-card__footer'>
                    <span className='footer-info'>AI-Powered Strategy Generation &bull; Approx 30s</span>
                    <button
                        onClick={(e) => handleGenerateReport(e)}
                        className='generate-btn'>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" /></svg>
                        Generate My Interview Strategy
                    </button>
                </div>
            </div>

            {/* Recent Reports List */}
            {reports.length > 0 && (
                <section className='recent-reports'>
                    <h2>My Recent Interview Plans</h2>
                    <ul className='reports-list'>
                        {reports.map(report => (
                            <li 
                                key={report._id} 
                                className='report-item' 
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigate(`/interview/${report._id}`);
                                }}
                            >
                                <h3>{report.title || 'Untitled Position'}</h3>
                                <p className='report-meta'>Generated on {new Date(report.createdAt).toLocaleDateString()}</p>
                                <p className={`match-score ${report.matchScore >= 80 ? 'score--high' : report.matchScore >= 60 ? 'score--mid' : 'score--low'}`}>Match Score: {report.matchScore}%</p>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            {/* Page Footer */}
            <footer className='page-footer'>
                <a href='#' onClick={(e) => e.preventDefault()}>Privacy Policy</a>
                <a href='#' onClick={(e) => e.preventDefault()}>Terms of Service</a>
                <a href='#' onClick={(e) => e.preventDefault()}>Help Center</a>
            </footer>
        </div>
    )
}

export default Home