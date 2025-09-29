'use client';

import React, { useState } from 'react';
import axios from 'axios';

// Define the structure of our resume data
interface ResumeData {
    personalInfo: { name: string; email: string; phone: string };
    experience: { title: string; company: string; description: string }[];
    education: { degree: string; institution: string }[];
    skills: string[];
}

// --- Main Page Component ---
export default function ResumePage() {
    const [resumeData, setResumeData] = useState<ResumeData>({
        personalInfo: { name: '', email: '', phone: '' },
        experience: [{ title: '', company: '', description: '' }],
        education: [{ degree: '', institution: '' }],
        skills: [],
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await axios.post('/api/resume/parse-pdf', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResumeData(response.data); // Populate the editor with parsed data
        } catch (err) {
            setError('Failed to parse resume. Please check the file and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Generic handler to update resume data from forms
    const handleDataChange = (section: string, index: number, field: string, value: string) => {
        setResumeData(prev => {
            const newSection = [...(prev as any)[section]];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [section]: newSection };
        });
    };
    
    return (
        <>
            <style jsx global>{`
                body { font-family: sans-serif; background-color: #f7fafc; }
                .container { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; padding: 2rem; max-width: 1400px; margin: auto; }
                .editor, .preview { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                .editor h2, .preview h2 { border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; margin-top: 0; }
                .form-group { margin-bottom: 1rem; }
                .form-group label { display: block; font-weight: 500; margin-bottom: 0.5rem; }
                .form-group input, .form-group textarea { width: 100%; padding: 0.5rem; border: 1px solid #cbd5e0; border-radius: 4px; }
                .loader { text-align: center; font-weight: bold; }
            `}</style>

            <div className="container">
                <div className="editor">
                    <h2>Resume Editor</h2>
                    <Uploader onFileChange={handleFileChange} isLoading={isLoading} />
                    {error && <p style={{ color: 'red' }}>{error}</p>}
                    <hr style={{ margin: '2rem 0' }} />
                    <EditorForms data={resumeData} onDataChange={handleDataChange} />
                </div>
                <div className="preview">
                    <h2>Live Preview</h2>
                    <ResumePreview data={resumeData} />
                </div>
            </div>
        </>
    );
}


// --- Sub-Component: Uploader ---
const Uploader = ({ onFileChange, isLoading }: { onFileChange: any, isLoading: boolean }) => (
    <div>
        <h3>Upload Existing Resume</h3>
        <p>Upload a PDF and we'll automatically fill in the editor for you.</p>
        <input type="file" accept=".pdf" onChange={onFileChange} disabled={isLoading} />
        {isLoading && <p className="loader">Analyzing your resume...</p>}
    </div>
);


// --- Sub-Component: Editor Forms ---
const EditorForms = ({ data, onDataChange }: { data: ResumeData, onDataChange: any }) => (
    <div>
        <h3>Build From Scratch</h3>
        <h4>Personal Information</h4>
        {/* Simplified for brevity, you can expand this */}
        <div className="form-group">
            <label>Full Name</label>
            <input value={data.personalInfo.name} onChange={(e) => onDataChange('personalInfo', 0, 'name', e.target.value)} />
        </div>
        
        <h4>Work Experience</h4>
        {data.experience.map((exp, index) => (
            <div key={index} className="form-group" style={{border: '1px solid #eee', padding: '1rem', borderRadius: '4px'}}>
                 <label>Job Title</label>
                 <input value={exp.title} onChange={(e) => onDataChange('experience', index, 'title', e.target.value)} />
                 <label>Company</label>
                 <input value={exp.company} onChange={(e) => onDataChange('experience', index, 'company', e.target.value)} />
                 <label>Description</label>
                 <textarea value={exp.description} rows={4} onChange={(e) => onDataChange('experience', index, 'description', e.target.value)} />
            </div>
        ))}
        {/* You would add buttons to add/remove experience sections */}
    </div>
);


// --- Sub-Component: Resume Preview ---
const ResumePreview = ({ data }: { data: ResumeData }) => (
    <div style={{ lineHeight: '1.6' }}>
        <h1 style={{ textAlign: 'center', margin: 0 }}>{data.personalInfo.name}</h1>
        <p style={{ textAlign: 'center', margin: 0 }}>{data.personalInfo.email} | {data.personalInfo.phone}</p>
        
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginTop: '1.5rem' }}>Work Experience</h3>
        {data.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: 0, fontWeight: 'bold' }}>{exp.title}</h4>
                <p style={{ margin: 0, fontStyle: 'italic' }}>{exp.company}</p>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{exp.description}</p>
            </div>
        ))}
        
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginTop: '1.5rem' }}>Education</h3>
        {/* ... Education mapping ... */}
        
        <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '4px', marginTop: '1.5rem' }}>Skills</h3>
        {/* ... Skills mapping ... */}
    </div>
);
