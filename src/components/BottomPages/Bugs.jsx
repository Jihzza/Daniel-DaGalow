import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../contexts/AuthContext";

function BugReport() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || "",
    email: user?.email || "",
    bugType: "",
    description: "",
    severity: "low",
    reproducibility: "",
  });
  const [submitStatus, setSubmitStatus] = useState({
    success: false,
    error: false,
    message: "",
  });

  const bugTypes = [
    { value: "", label: "Select Bug Type" },
    { value: "ui", label: "User Interface Issue" },
    { value: "functionality", label: "Functionality Problem" },
    { value: "performance", label: "Performance Issue" },
    { value: "security", label: "Security Concern" },
    { value: "other", label: "Other" },
  ];

  const severityLevels = [
    { value: "low", label: "Low - Minor Issue" },
    { value: "medium", label: "Medium - Noticeable Problem" },
    { value: "high", label: "High - Critical Issue" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ success: false, error: false, message: "" });

    // Basic validation
    if (!formData.bugType || !formData.description) {
      setSubmitStatus({
        success: false,
        error: true,
        message: "Please fill out all required fields.",
      });
      return;
    }

    try {
      // Submit to Supabase bug reports table
      const { data, error } = await supabase.from("bug_reports").insert({
        user_id: user?.id,
        name: formData.name,
        email: formData.email,
        bug_type: formData.bugType,
        description: formData.description,
        severity: formData.severity,
        reproducibility: formData.reproducibility,
        status: "new",
      });

      if (error) throw error;

      // Reset form and show success message
      setFormData({
        name: user?.user_metadata?.full_name || "",
        email: user?.email || "",
        bugType: "",
        description: "",
        severity: "low",
        reproducibility: "",
      });

      setSubmitStatus({
        success: true,
        error: false,
        message:
          "Thank you for reporting this bug! Our team will investigate soon.",
      });
    } catch (error) {
      console.error("Bug Report Submission Error:", error);
      setSubmitStatus({
        success: false,
        error: true,
        message: "Failed to submit bug report. Please try again.",
      });
    }
  };

  return (
    <section id="bug-report" className="w-full">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="flex flex-col pb-6">
          <h2 className="text-2xl py-4 font-bold text-center text-black">
            Help Me Improve
          </h2>
          <p className="text-center text-black max-w-2xl mx-auto">
            As the website is in beta, your feedback is crucial. Please provide
            detailed information about any issues you've encountered to help us
            enhance the user experience.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-oxfordBlue rounded-xl p-6 space-y-6"
        >
          {/* Name Input */}
          <div>
            <label htmlFor="name" className="block mb-2 text-white">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
              placeholder="Your name"
            />
          </div>

          {/* Email Input */}
          <div>
            <label htmlFor="email" className="block mb-2 text-white">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
              placeholder="Your email"
              required
            />
          </div>

          {/* Bug Type Dropdown */}
          <div>
            <label htmlFor="bugType" className="block mb-2 text-white">
              Type of Bug
            </label>
            <select
              id="bugType"
              name="bugType"
              value={formData.bugType}
              onChange={handleChange}
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
              required
            >
              {bugTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                  className="bg-oxfordBlue text-white"
                >
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Dropdown */}
          <div>
            <label htmlFor="severity" className="block mb-2 text-white">
              Severity
            </label>
            <select
              id="severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
            >
              {severityLevels.map((level) => (
                <option
                  key={level.value}
                  value={level.value}
                  className="bg-oxfordBlue text-white"
                >
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Reproducibility Input */}
          <div>
            <label htmlFor="reproducibility" className="block mb-2 text-white">
              Steps to Reproduce (Optional)
            </label>
            <textarea
              id="reproducibility"
              name="reproducibility"
              value={formData.reproducibility}
              onChange={handleChange}
              rows="3"
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
              placeholder="Describe the steps to reproduce this bug"
            ></textarea>
          </div>

          {/* Description Textarea */}
          <div>
            <label htmlFor="description" className="block mb-2 text-white">
              Bug Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-white/5 border border-darkGold rounded-xl px-4 py-2 text-white placeholder-white/50 focus:ring-2 focus:ring-darkGold"
              placeholder="Provide a detailed description of the bug"
              required
            ></textarea>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="w-full bg-darkGold text-black font-bold py-3 rounded-xl hover:bg-opacity-90 transition-colors"
            >
              Submit Bug Report
            </button>
          </div>

          {/* Status Message */}
          {(submitStatus.success || submitStatus.error) && (
            <div
              className={`p-4 rounded-xl text-center ${
                submitStatus.success
                  ? "bg-green-600/20 text-green-300"
                  : "bg-red-600/20 text-red-300"
              }`}
            >
              {submitStatus.message}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}

export default BugReport;
