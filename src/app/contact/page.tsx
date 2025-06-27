"use client";

import { useState } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setErrorMessage("Please fill in all required fields.");
      setShowError(true);
      setShowSuccess(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setShowError(true);
      setShowSuccess(false);
      return;
    }

    // Compose email body
    const emailBody = `Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone || "Not provided"}
Subject: ${formData.subject}

Message:
${formData.message}

---
Sent from AZV Motors Contact Form`;

    // Create mailto link
    const mailtoLink = `mailto:team@azvmotors.kz?subject=${encodeURIComponent(
      formData.subject
    )}&body=${encodeURIComponent(emailBody)}`;

    // Open email client
    window.location.href = mailtoLink;

    // Show success message
    setShowSuccess(true);
    setShowError(false);

    // Reset form
    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });

    // Hide success message after 5 seconds
    setTimeout(() => {
      setShowSuccess(false);
    }, 5000);
  };

  const handleFieldFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    e.target.style.borderColor = "#191919";
  };

  const handleFieldBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value, type, required } = e.target;

    if (required && !value.trim()) {
      e.target.style.borderColor = "#191919";
    } else if (type === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      e.target.style.borderColor = emailRegex.test(value)
        ? "#191919"
        : "#191919";
    } else if (value.trim()) {
      e.target.style.borderColor = "#191919";
    } else {
      e.target.style.borderColor = "#191919";
    }
  };

  return (
    <div className="min-h-screen bg-[#191919] flex items-center justify-center p-5">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          background: white;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          max-width: 800px;
          width: 100%;
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 600px;
        }

        .info-section {
          background: #191919;
          color: white;
          padding: 40px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .logo {
          font-size: 2.5rem;
          font-weight: bold;
          margin-bottom: 10px;
          color: white;
        }

        .company-name {
          font-size: 1.2rem;
          margin-bottom: 30px;
          opacity: 0.9;
        }

        .contact-info {
          margin-bottom: 30px;
        }

        .contact-info h3 {
          margin-bottom: 15px;
          color: white;
        }

        .contact-info p {
          margin-bottom: 10px;
          opacity: 0.8;
        }

        .form-section {
          padding: 40px;
        }

        .form-title {
          font-size: 2rem;
          color: #191919;
          margin-bottom: 10px;
        }

        .form-subtitle {
          color: #191919;
          margin-bottom: 30px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #191919;
          font-weight: 500;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #191919;
          border-radius: 8px;
          font-size: 16px;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #191919;
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        .required {
          color: #191919;
        }

        .btn-submit {
          background: #191919;
          color: white;
          padding: 15px 30px;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .btn-submit:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(25, 25, 25, 0.3);
        }

        .btn-submit:active {
          transform: translateY(0);
        }

        @media (max-width: 768px) {
          .container {
            grid-template-columns: 1fr;
            max-width: 500px;
          }

          .info-section {
            padding: 30px;
            text-align: center;
          }

          .form-section {
            padding: 30px;
          }

          .logo {
            font-size: 2rem;
          }

          .form-title {
            font-size: 1.5rem;
          }
        }

        .success-message {
          background-color: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #c3e6cb;
          display: ${showSuccess ? "block" : "none"};
        }

        .error-message {
          background-color: #f8d7da;
          color: #721c24;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #f5c6cb;
          display: ${showError ? "block" : "none"};
        }
      `}</style>

      <div className="container">
        <div className="info-section">
          <div className="logo">AZV</div>
          <div className="company-name">MOTORS</div>

          <div className="contact-info">
            <h3>Get in Touch</h3>
            <p>📧 team@azvmotors.kz</p>
            <p>🕒 Mon - Fri: 9:00 AM - 6:00 PM</p>
            <p>📍 Kazakhstan</p>
          </div>

          <div>
            <h3>Why Contact Us?</h3>
            <p>• Vehicle inquiries</p>
            <p>• Service support</p>
            <p>• Partnership opportunities</p>
            <p>• General information</p>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-title">Contact Us</h2>
          <p className="form-subtitle">
            Send us a message and we&apos;ll get back to you soon
          </p>

          <div className="success-message">
            Thank you for your message! We&apos;ll get back to you soon.
          </div>

          <div className="error-message">{errorMessage}</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">
                Full Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">
                Email Address <span className="required">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
              />
            </div>

            <div className="form-group">
              <label htmlFor="subject">
                Subject <span className="required">*</span>
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">
                Message <span className="required">*</span>
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Please describe your inquiry in detail..."
                value={formData.message}
                onChange={handleInputChange}
                onFocus={handleFieldFocus}
                onBlur={handleFieldBlur}
                required
              />
            </div>

            <button type="submit" className="btn-submit">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
