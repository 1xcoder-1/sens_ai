"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Download, 
  Edit3, 
  Eye, 
  Save, 
  Printer,
  FileText,
  Sparkles,
  TrendingUp,
  Target,
  BookOpen,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import html2pdf from "html2pdf.js";
import { getCoverLetter, updateCoverLetter } from "@/actions/cover-letter";
import { toast } from "sonner";

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

export default function EditCoverLetterPage({ params }) {
  const [coverLetter, setCoverLetter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [saving, setSaving] = useState(false);
  const coverLetterRef = useRef(null);
  const pdfContentRef = useRef(null);

  useEffect(() => {
    async function fetchCoverLetter() {
      try {
        const { id } = await params;
        const data = await getCoverLetter(id);
        setCoverLetter(data);
        setEditedContent(data?.content || "");
      } catch (error) {
        console.error("Failed to fetch cover letter:", error);
        toast.error("Failed to load cover letter");
      } finally {
        setLoading(false);
      }
    }

    fetchCoverLetter();
  }, [params]);

  const handleSave = async () => {
    if (!coverLetter) return;
    
    setSaving(true);
    try {
      await updateCoverLetter(coverLetter.id, { content: editedContent });
      setCoverLetter({ ...coverLetter, content: editedContent });
      toast.success("Cover letter saved successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save cover letter:", error);
      toast.error("Failed to save cover letter");
    } finally {
      setSaving(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!coverLetter?.content) {
      toast.error("No content to download");
      return;
    }

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
    contentDiv.innerHTML = convertMarkdownToHtml(coverLetter.content);
    
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
      filename: `cover-letter-${coverLetter?.jobTitle}-${coverLetter?.companyName}.pdf`,
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

    try {
      await html2pdf().set(opt).from(pdfElement).save();
      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("Failed to generate PDF:", error);
      toast.error("Failed to generate PDF");
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      {/* Back Button with Animation */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link href="/ai-cover-letter">
          <Button variant="link" className="gap-2 pl-0">
            <ArrowLeft className="h-4 w-4" />
            Back to Cover Letters
          </Button>
        </Link>
      </motion.div>

      {/* Header with Animation */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold gradient-title mb-6">
          {coverLetter?.jobTitle} at {coverLetter?.companyName}
        </h1>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap gap-2 mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isEditing ? (
          <>
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsEditing(false)}
              className="gap-2 w-full sm:w-auto"
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
              className="gap-2 w-full sm:w-auto"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              onClick={handleDownloadPDF}
              className="gap-2 w-full sm:w-auto"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={handlePrint}
              className="gap-2 w-full sm:w-auto"
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
          </>
        )}
      </motion.div>

      {/* Preview/Edit Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Cover Letter" : "Cover Letter Preview"}
            </CardTitle>
            <CardDescription>
              {isEditing 
                ? "Make changes to your cover letter below" 
                : "Review your generated cover letter before downloading"}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                {/* Visible preview with styling */}
                <div 
                  ref={coverLetterRef}
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
                      source={coverLetter?.content}
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
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Section */}
      <motion.div
        className="mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
            <CardDescription>
              Tips for using your cover letter effectively
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-sm">
                  Customize the greeting if you know the hiring manager's name
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-sm">
                  Proofread carefully for any typos or formatting issues
                </p>
              </div>
              <div className="flex items-start space-x-2">
                <div className="mt-1 w-2 h-2 rounded-full bg-purple-500"></div>
                <p className="text-sm">
                  Save both PDF and Word versions for different application systems
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}