"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";

// Dynamically import MDEditor to avoid SSR issues
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default || mod),
  { ssr: false, loading: () => <p>Loading preview...</p> }
);

const CoverLetterPreview = ({ content }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="py-4"
    >
      {typeof window !== 'undefined' && content && (
        <MDEditor value={content} preview="preview" height={700} />
      )}
    </motion.div>
  );
};

export default CoverLetterPreview;