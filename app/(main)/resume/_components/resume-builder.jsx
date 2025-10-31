"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  Briefcase,
  GraduationCap,
  Lightbulb,
  CheckCircle,
  Printer,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import { improveWithAI } from "@/actions/resume"; // Import the AI improvement function
import { EntryForm } from "@/app/(main)/resume/_components/entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import html2pdf from "html2pdf.js";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default || mod),
  { ssr: false, loading: () => <p>Loading editor...</p> }
);

// Create a separate component for the Markdown preview to avoid SSR issues
const MarkdownPreview = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.Markdown || mod.default.Markdown),
  { ssr: false, loading: () => <p>Loading preview...</p> }
);

// Create a fallback textarea component
function FallbackEditor({ value, onChange, height = 600 }) {
  return (
    <Textarea
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full"
      style={{ height: `${height}px` }}
      placeholder="You can edit your resume content here."
    />
  );
}

// Create a fallback preview component
function FallbackPreview({ source }) {
  return (
    <div className="p-4 border rounded bg-white text-black">
      <h3 className="font-bold mb-2">Resume Preview</h3>
      <pre className="whitespace-pre-wrap">{source || "No content to preview"}</pre>
    </div>
  );
}

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const [completionStats, setCompletionStats] = useState({
    contact: 0,
    summary: 0,
    skills: 0,
    experience: 0,
    education: 0,
    projects: 0,
  });
  // Add state to track if component is mounted
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const resumeRef = useRef(null);

  // Set isClient to true after mounting
  useEffect(() => {
    setIsClient(true);
    setEditedContent(previewContent || "");
  }, []);

  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  // Add AI improvement functionality
  const {
    loading: isImprovingSummary,
    fn: improveSummaryFn,
    data: improvedSummary,
    error: summaryError,
  } = useFetch(improveWithAI);

  const {
    loading: isImprovingSkills,
    fn: improveSkillsFn,
    data: improvedSkills,
    error: skillsError,
  } = useFetch(improveWithAI);

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Handle improved summary result
  useEffect(() => {
    if (improvedSummary && !isImprovingSummary) {
      setValue("summary", improvedSummary);
      toast.success("Professional summary improved successfully!");
    }
    if (summaryError) {
      toast.error(summaryError.message || "Failed to improve professional summary");
    }
  }, [improvedSummary, summaryError, isImprovingSummary, setValue]);

  // Handle improved skills result
  useEffect(() => {
    if (improvedSkills && !isImprovingSkills) {
      setValue("skills", improvedSkills);
      toast.success("Skills improved successfully!");
    }
    if (skillsError) {
      toast.error(skillsError.message || "Failed to improve skills");
    }
  }, [improvedSkills, skillsError, isImprovingSkills, setValue]);

  // Watch form fields for preview updates
  const formValues = watch();

  // Memoize the combined content to prevent unnecessary recalculations
  const combinedContent = useMemo(() => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo.twitter) parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    const contactMarkdown = parts.length > 0
      ? `## <div align="center">${user?.fullName || ''}</div>
        

<div align="center">

${parts.join(" | ")}

</div>`
      : "";

    const { summary, skills, experience, education, projects } = formValues;
    return [
      contactMarkdown,
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }, [formValues, user]);

  // Set initial tab based on content
  useEffect(() => {
    if (initialContent && activeTab === "edit") {
      setActiveTab("preview");
    }
  }, [initialContent]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      setPreviewContent(combinedContent || initialContent || "");
      setEditedContent(combinedContent || initialContent || "");
    }
  }, [combinedContent, initialContent, activeTab]);

  // Calculate completion stats
  useEffect(() => {
    const stats = {
      contact: formValues.contactInfo?.email || formValues.contactInfo?.mobile ? 100 : 0,
      summary: formValues.summary ? 100 : 0,
      skills: formValues.skills ? 100 : 0,
      experience: formValues.experience?.length > 0 ? 100 : 0,
      education: formValues.education?.length > 0 ? 100 : 0,
      projects: formValues.projects?.length > 0 ? 100 : 0,
    };
    setCompletionStats(stats);
  }, [
    formValues.contactInfo?.email, 
    formValues.contactInfo?.mobile, 
    formValues.summary, 
    formValues.skills, 
    formValues.experience?.length, 
    formValues.education?.length, 
    formValues.projects?.length
  ]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const generatePDF = async () => {
    if (!previewContent) {
      toast.error("No content to download");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a clean HTML element for PDF generation with better styling
      const pdfElement = document.createElement('div');
      pdfElement.style.fontFamily = 'Georgia, serif';
      pdfElement.style.fontSize = '11pt';
      pdfElement.style.lineHeight = '1.6';
      pdfElement.style.color = '#000000';
      pdfElement.style.backgroundColor = '#ffffff';
      pdfElement.style.padding = '20mm';
      pdfElement.style.width = '210mm'; // A4 width
      pdfElement.style.minHeight = '297mm'; // A4 height
      pdfElement.style.boxSizing = 'border-box';
      pdfElement.style.margin = '0 auto';
      
      // Create a container for the markdown content with better styling
      const contentDiv = document.createElement('div');
      contentDiv.innerHTML = convertMarkdownToHtml(previewContent);
      
      // Add better styling for the PDF
      contentDiv.style.maxWidth = '100%';
      contentDiv.style.wordWrap = 'break-word';
      
      // Style headers
      const headers = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach(header => {
        header.style.marginTop = '1.5em';
        header.style.marginBottom = '0.5em';
        header.style.fontWeight = 'bold';
        header.style.color = '#000000';
      });
      
      // Style lists
      const lists = contentDiv.querySelectorAll('ul, ol');
      lists.forEach(list => {
        list.style.marginTop = '0.5em';
        list.style.marginBottom = '1em';
        list.style.paddingLeft = '1.5em';
      });
      
      // Style list items
      const listItems = contentDiv.querySelectorAll('li');
      listItems.forEach(item => {
        item.style.marginBottom = '0.3em';
      });
      
      // Style paragraphs
      const paragraphs = contentDiv.querySelectorAll('p, div');
      paragraphs.forEach(p => {
        p.style.marginTop = '0';
        p.style.marginBottom = '1em';
      });
      
      // Style links
      const links = contentDiv.querySelectorAll('a');
      links.forEach(link => {
        link.style.color = '#1a0dab';
        link.style.textDecoration = 'underline';
      });
      
      pdfElement.appendChild(contentDiv);

      const opt = {
        margin: [10, 5, 10, 5],
        filename: `resume-${user?.fullName || 'applicant'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait'
        }
      };

      await html2pdf().set(opt).from(pdfElement).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  // Convert markdown to properly styled HTML for PDF
  const convertMarkdownToHtml = (markdown) => {
    // First, handle headers with better formatting
    let html = markdown
      .replace(/^# (.*$)/gm, '<h1 style="font-size: 24pt; border-bottom: 2px solid #000000; padding-bottom: 5px; margin-bottom: 15px;">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 style="font-size: 18pt; border-bottom: 1px solid #666666; padding-bottom: 3px; margin-top: 20px; margin-bottom: 10px;">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 style="font-size: 14pt; font-weight: bold; margin-top: 15px; margin-bottom: 8px;">$1</h3>')
      .replace(/^#### (.*$)/gm, '<h4 style="font-size: 12pt; font-weight: bold; margin-top: 12px; margin-bottom: 6px;">$1</h4>');
    
    // Handle bold and italic
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Handle lists
    html = html
      .replace(/^- (.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul style="margin-top: 0.5em; margin-bottom: 1em; padding-left: 1.5em;">$1</ul>');
    
    // Handle links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color: #1a0dab; text-decoration: underline;">$1</a>');
    
    // Handle paragraphs
    html = html
      .replace(/\n\n/g, '</p><p style="margin-top: 0; margin-bottom: 1em;">')
      .replace(/\n/g, '<br>');
    
    // Wrap in paragraph tags
    if (!html.startsWith('<h')) {
      html = '<p style="margin-top: 0; margin-bottom: 1em;">' + html;
    }
    if (!html.endsWith('</p>') && !html.endsWith('</ul>') && !html.endsWith('</ol>')) {
      html = html + '</p>';
    }
    
    return html;
  };

  const handlePrint = () => {
    window.print();
  };

  const onSubmit = async (data) => {
    try {
      // Simpler approach to normalize content
      const formattedContent = previewContent
        .replace(new RegExp("\\n", "g"), "\\n") // Normalize newlines
        .replace(new RegExp("\\n\\\\s*\\n", "g"), "\\n\\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  // Calculate overall completion percentage
  const overallCompletion = Math.round(
    Object.values(completionStats).reduce((a, b) => a + b, 0) / 
    Object.keys(completionStats).length
  );

  const handleSaveChanges = async () => {
    setPreviewContent(editedContent);
    setActiveTab("preview");
    toast.success("Changes saved to preview");
  };

  // Professional Summary with AI improvement
  const handleImproveSummary = async () => {
    const summary = watch("summary");
    if (!summary) {
      toast.error("Please enter a professional summary first");
      return;
    }

    try {
      await improveSummaryFn({
        current: summary,
        type: "professional summary",
      });
    } catch (error) {
      toast.error(error.message || "Failed to improve professional summary");
    }
  };

  // Skills with AI improvement
  const handleImproveSkills = async () => {
    const skills = watch("skills");
    if (!skills) {
      toast.error("Please enter skills first");
      return;
    }

    try {
      await improveSkillsFn({
        current: skills,
        type: "skills",
      });
    } catch (error) {
      toast.error(error.message || "Failed to improve skills");
    }
  };

  return (
    <div data-color-mode="light" className="space-y-6">
      {/* Header with Framer Motion animation */}
      {isClient ? (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="font-bold gradient-title text-3xl md:text-4xl lg:text-5xl">
              Resume Builder
            </h1>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center md:justify-start">
              <Button
                variant="destructive"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button onClick={generatePDF} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </motion.div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="font-bold gradient-title text-3xl md:text-4xl lg:text-5xl">
              Resume Builder
            </h1>
            <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-center md:justify-start">
              <Button
                variant="destructive"
                onClick={handleSubmit(onSubmit)}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
              <Button onClick={generatePDF} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Download PDF
                  </>
                )}
              </Button>
              <Button onClick={handlePrint} variant="outline" className="w-full sm:w-auto">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Progress Overview Card */}
      {isClient ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resume Completion
              </CardTitle>
              <CardDescription>
                Track your progress in building a comprehensive resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold">{overallCompletion}%</span>
                </div>
                <Progress value={overallCompletion} className="h-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                  {Object.entries(completionStats).map(([key, value]) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-3 h-3 rounded-full ${value > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs mt-1 text-center capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Resume Completion
              </CardTitle>
              <CardDescription>
                Track your progress in building a comprehensive resume
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-bold">{overallCompletion}%</span>
                </div>
                <Progress value={overallCompletion} className="h-3" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 mt-4">
                  {Object.entries(completionStats).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex flex-col items-center"
                    >
                      <div className={`w-3 h-3 rounded-full ${value > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className="text-xs mt-1 text-center capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Tips Card */}
      {isClient ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Resume Building Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Use action verbs to describe your achievements</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Include quantifiable results whenever possible</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Tailor your resume for each job application</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                Resume Building Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Use action verbs to describe your achievements</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Include quantifiable results whenever possible</p>
                </div>
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <p className="text-sm">Tailor your resume for each job application</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        {...register("contactInfo.email")}
                        type="email"
                        placeholder="your@email.com"
                        error={errors.contactInfo?.email}
                      />
                      {errors.contactInfo?.email && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Number</label>
                      <Input
                        {...register("contactInfo.mobile")}
                        type="tel"
                        placeholder="+1 234 567 8900"
                      />
                      {errors.contactInfo?.mobile && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.mobile.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LinkedIn URL</label>
                      <Input
                        {...register("contactInfo.linkedin")}
                        type="url"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                      {errors.contactInfo?.linkedin && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.linkedin.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Twitter/X Profile
                      </label>
                      <Input
                        {...register("contactInfo.twitter")}
                        type="url"
                        placeholder="https://twitter.com/your-handle"
                      />
                      {errors.contactInfo?.twitter && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.twitter.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Contact Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        {...register("contactInfo.email")}
                        type="email"
                        placeholder="your@email.com"
                        error={errors.contactInfo?.email}
                      />
                      {errors.contactInfo?.email && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.email.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Mobile Number</label>
                      <Input
                        {...register("contactInfo.mobile")}
                        type="tel"
                        placeholder="+1 234 567 8900"
                      />
                      {errors.contactInfo?.mobile && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.mobile.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">LinkedIn URL</label>
                      <Input
                        {...register("contactInfo.linkedin")}
                        type="url"
                        placeholder="https://linkedin.com/in/your-profile"
                      />
                      {errors.contactInfo?.linkedin && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.linkedin.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Twitter/X Profile
                      </label>
                      <Input
                        {...register("contactInfo.twitter")}
                        type="url"
                        placeholder="https://twitter.com/your-handle"
                      />
                      {errors.contactInfo?.twitter && (
                        <p className="text-sm text-red-500">
                          {errors.contactInfo.twitter.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Professional Summary */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Professional Summary
                  </h3>
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32"
                        placeholder="Write a compelling professional summary..."
                        error={errors.summary}
                      />
                    )}
                  />
                  {errors.summary && (
                    <p className="text-sm text-red-500">{errors.summary.message}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleImproveSummary}
                      disabled={isImprovingSummary || !watch("summary")}
                      className="w-full sm:w-auto"
                    >
                      {isImprovingSummary ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Professional Summary
                  </h3>
                  <Controller
                    name="summary"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32"
                        placeholder="Write a compelling professional summary..."
                        error={errors.summary}
                      />
                    )}
                  />
                  {errors.summary && (
                    <p className="text-sm text-red-500">{errors.summary.message}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                      className="w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Skills */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </h3>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32"
                        placeholder="List your key skills..."
                        error={errors.skills}
                      />
                    )}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills.message}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleImproveSkills}
                      disabled={isImprovingSkills || !watch("skills")}
                      className="w-full sm:w-auto"
                    >
                      {isImprovingSkills ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Improving...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Skills
                  </h3>
                  <Controller
                    name="skills"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        className="h-32"
                        placeholder="List your key skills..."
                        error={errors.skills}
                      />
                    )}
                  />
                  {errors.skills && (
                    <p className="text-sm text-red-500">{errors.skills.message}</p>
                  )}
                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled
                      className="w-full sm:w-auto"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Improve with AI
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Experience */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </h3>
                  <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Experience"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">
                      {errors.experience.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Work Experience
                  </h3>
                  <Controller
                    name="experience"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Experience"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.experience && (
                    <p className="text-sm text-red-500">
                      {errors.experience.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Education */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h3>
                  <Controller
                    name="education"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Education"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.education && (
                    <p className="text-sm text-red-500">
                      {errors.education.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </h3>
                  <Controller
                    name="education"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Education"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.education && (
                    <p className="text-sm text-red-500">
                      {errors.education.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Projects */}
            {isClient ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Projects
                  </h3>
                  <Controller
                    name="projects"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Project"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.projects && (
                    <p className="text-sm text-red-500">
                      {errors.projects.message}
                    </p>
                  )}
                </div>
              </motion.div>
            ) : (
              <div>
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Projects
                  </h3>
                  <Controller
                    name="projects"
                    control={control}
                    render={({ field }) => (
                      <EntryForm
                        type="Project"
                        entries={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  {errors.projects && (
                    <p className="text-sm text-red-500">
                      {errors.projects.message}
                    </p>
                  )}
                </div>
              </div>
            )}
          </form>
        </TabsContent>

        <TabsContent value="preview">
          <div className="flex flex-wrap gap-2 my-6 py-4">
            {isEditing ? (
              <>
                <Button 
                  onClick={handleSaveChanges}
                  className="gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                  className="gap-2"
                >
                  <Eye className="h-4 w-4" />
                  Preview
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(true)}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </Button>
              </>
            )}
          </div>

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose edited markdown if you update the form data.
              </span>
            </div>
          )}
          
          <div className="border rounded-lg">
            {isEditing ? (
              <div data-color-mode="light">
                {typeof window !== 'undefined' && MDEditor && (
                  <MDEditor
                    value={editedContent}
                    onChange={setEditedContent}
                    height={600}
                  />
                )}
              </div>
            ) : (
              <div data-color-mode="light">
                <div 
                  ref={resumeRef}
                  className="p-6 bg-white border border-gray-200 rounded-lg"
                  style={{
                    fontFamily: 'Georgia, serif',
                    fontSize: '11pt',
                    lineHeight: '1.6',
                    color: '#000000',
                    backgroundColor: '#ffffff'
                  }}
                >
                  {typeof window !== 'undefined' && MarkdownPreview && (
                    <MarkdownPreview
                      source={previewContent}
                      style={{
                        background: "transparent",
                        color: "#000000",
                        fontFamily: 'Georgia, serif',
                        fontSize: '11pt',
                        lineHeight: '1.6'
                      }}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="hidden">
            <div id="resume-pdf">
              <FallbackPreview source={previewContent || ""} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}