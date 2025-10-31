"use client";
import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const TextGenerateEffect = ({
  words,
  className,
  filter = true,
  duration = 0.05,
}) => {
  let wordsArray = words.split(" ");
  
  return (
    <div className={className}>
      {wordsArray.map((word, idx) => {
        return (
          <motion.span
            key={word + idx}
            className={`${
              filter ? "text-black/20" : "text-black"
            } inline-block`}
            initial={{ opacity: 0, color: filter ? "#00000033" : "#000000" }}
            animate={{ opacity: 1, color: "#1e1e1e" }}
            transition={{
              duration: duration,
              delay: idx * 0.05,
            }}
          >
            {word}{" "}
          </motion.span>
        );
      })}
    </div>
  );
};