"use client";

import { useState } from "react";

export default function DeleteTutorialPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [pulseAnimation, setPulseAnimation] = useState(false);

  const steps = ["step1", "step2", "step3"];

  const highlightStep = (stepIndex: number) => {
    setCurrentStep(stepIndex);
  };

  const startDemo = () => {
    setCurrentStep(0);
    setShowProfileMenu(false);
    setShowSuccess(false);
    setPulseAnimation(false);
    highlightStep(0);

    setTimeout(() => {
      alert("Demo started! Click on 'John Doe' to begin.");
    }, 100);
  };

  const handleProfileClick = () => {
    if (showProfileMenu) {
      setShowProfileMenu(false);
    } else {
      setShowProfileMenu(true);
      highlightStep(1);

      setTimeout(() => {
        const deleteSection = document.querySelector(".delete-section");
        deleteSection?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setTimeout(() => {
          setPulseAnimation(true);
        }, 1000);
      }, 500);
    }
  };

  const handleDeleteClick = () => {
    highlightStep(2);
    setShowDeleteModal(true);
  };

  const closeModal = () => {
    setShowDeleteModal(false);
  };

  const confirmDelete = () => {
    setShowDeleteModal(false);
    setShowSuccess(true);
    setCurrentStep(-1); // Remove all step highlights

    setTimeout(() => {
      document.getElementById("successMessage")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-[#191919] p-5">
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #191919;
          border: 1px solid #333;
          border-radius: 15px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
          overflow: hidden;
        }

        .header {
          background: #191919;
          color: white;
          padding: 20px;
          text-align: center;
          border-bottom: 1px solid #333;
        }

        .header h1 {
          font-size: 2rem;
          margin-bottom: 10px;
        }

        .header p {
          opacity: 0.8;
          font-size: 1.1rem;
        }

        .content {
          padding: 30px;
          color: white;
        }

        .step {
          margin-bottom: 40px;
          padding: 20px;
          border-radius: 10px;
          border-left: 5px solid white;
          background: #333;
          transition: all 0.3s ease;
        }

        .step.active {
          border-left-color: #e74c3c;
          background: #191919;
          transform: translateX(5px);
        }

        .step-number {
          display: inline-block;
          width: 30px;
          height: 30px;
          background: white;
          color: #191919;
          border-radius: 50%;
          text-align: center;
          line-height: 30px;
          font-weight: bold;
          margin-right: 15px;
          margin-bottom: 10px;
        }

        .step.active .step-number {
          background: #e74c3c;
          color: white;
        }

        .step-title {
          font-size: 1.3rem;
          color: white;
          margin-bottom: 10px;
        }

        .step-description {
          color: #ccc;
          line-height: 1.6;
          margin-bottom: 15px;
        }

        .mock-interface {
          border: 2px solid #555;
          border-radius: 8px;
          padding: 20px;
          background: #333;
          margin: 15px 0;
        }

        .profile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          background: #191919;
          border: 1px solid #555;
          border-radius: 8px;
          margin-bottom: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .profile-header:hover {
          background: #333;
          transform: translateY(-2px);
        }

        .user-name {
          font-weight: bold;
          color: white;
          font-size: 1.1rem;
        }

        .arrow {
          transition: transform 0.3s ease;
          color: white;
          transform: ${showProfileMenu ? "rotate(180deg)" : "rotate(0deg)"};
        }

        .profile-menu {
          display: ${showProfileMenu ? "block" : "none"};
          background: #191919;
          border: 1px solid #555;
          border-radius: 8px;
          padding: 20px;
          margin-top: 10px;
          animation: ${showProfileMenu ? "slideDown 0.3s ease" : "none"};
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .menu-item {
          padding: 10px 0;
          border-bottom: 1px solid #555;
          color: #ccc;
        }

        .delete-section {
          margin-top: 200px;
          padding: 20px;
          border: 2px dashed #e74c3c;
          border-radius: 8px;
          background: #333;
        }

        .delete-button {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 12px 25px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1rem;
          transition: all 0.3s ease;
          animation: ${pulseAnimation ? "pulse 2s infinite" : "none"};
        }

        .delete-button:hover {
          background: #c0392b;
          transform: translateY(-2px);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
          }
        }

        .delete-modal {
          display: ${showDeleteModal ? "block" : "none"};
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
        }

        .modal-content {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: #191919;
          border: 1px solid #555;
          padding: 30px;
          border-radius: 15px;
          max-width: 400px;
          width: 90%;
          text-align: center;
        }

        .modal-title {
          font-size: 1.5rem;
          color: #e74c3c;
          margin-bottom: 15px;
        }

        .modal-text {
          color: #ccc;
          margin-bottom: 25px;
          line-height: 1.6;
        }

        .modal-buttons {
          display: flex;
          gap: 15px;
          justify-content: center;
        }

        .cancel-btn {
          background: #555;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .confirm-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
        }

        .success-message {
          display: ${showSuccess ? "block" : "none"};
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 8px;
          margin-top: 20px;
          text-align: center;
        }

        .demo-button {
          background: white;
          color: #191919;
          border: 1px solid white;
          padding: 15px 30px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 1.1rem;
          margin: 20px auto;
          display: block;
          transition: all 0.3s ease;
        }

        .demo-button:hover {
          background: #191919;
          color: white;
          transform: translateY(-2px);
        }

        .highlight {
          background: #333;
          border: 1px solid #555;
          padding: 15px;
          border-radius: 8px;
          margin: 15px 0;
        }

        .highlight strong {
          color: white;
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>How to Delete Your Account</h1>
          <p>Follow these simple steps to permanently delete your account</p>
        </div>

        <div className="content">
          <div
            className={`step ${currentStep === 0 ? "active" : ""}`}
            id="step1"
          >
            <span className="step-number">1</span>
            <div className="step-content">
              <h3 className="step-title">Click on Your Name</h3>
              <p className="step-description">
                First, locate and click on your name or profile section to
                access your account menu.
              </p>

              {/* <div className="mock-interface">
                <div className="profile-header" onClick={handleProfileClick}>
                  <span className="user-name">John Doe</span>
                  <span className="arrow">▼</span>
                </div>

                <div className="profile-menu">
                  <div className="menu-item">Account Settings</div>
                  <div className="menu-item">Privacy Settings</div>
                  <div className="menu-item">Notifications</div>
                  <div className="menu-item">Help & Support</div>

                  <div className="delete-section">
                    <h4 style={{ color: "#e74c3c", marginBottom: "10px" }}>
                      Danger Zone
                    </h4>
                    <p
                      style={{
                        color: "#ccc",
                        marginBottom: "15px",
                        fontSize: "14px",
                      }}
                    >
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                    <button
                      className="delete-button"
                      onClick={handleDeleteClick}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div> */}
            </div>
          </div>

          <div
            className={`step ${currentStep === 1 ? "active" : ""}`}
            id="step2"
          >
            <span className="step-number">2</span>
            <div className="step-content">
              <h3 className="step-title">Scroll to Bottom and Click Delete</h3>
              <p className="step-description">
                Once the menu is open, scroll down to the bottom where
                you&apos;ll find the &quot;Delete Account&quot; option in the
                danger zone.
              </p>
              <div className="highlight">
                <strong>Note:</strong> The delete option is typically located at
                the bottom of your account settings for safety reasons.
              </div>
            </div>
          </div>

          <div
            className={`step ${currentStep === 2 ? "active" : ""}`}
            id="step3"
          >
            <span className="step-number">3</span>
            <div className="step-content">
              <h3 className="step-title">Submit Delete Confirmation</h3>
              <p className="step-description">
                A confirmation dialog will appear. Carefully read the warning
                and confirm that you want to permanently delete your account.
              </p>
              <div className="highlight">
                <strong>Warning:</strong> This action cannot be undone. All your
                data will be permanently deleted.
              </div>
            </div>
          </div>

          {/* <button className="demo-button" onClick={startDemo}>
            Start Demo
          </button> */}

          <div className="success-message" id="successMessage">
            <strong>Demo Complete!</strong> Your account would be permanently
            deleted in a real scenario.
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div
        className="delete-modal"
        onClick={(e) => e.target === e.currentTarget && closeModal()}
      >
        <div className="modal-content">
          <h3 className="modal-title">⚠️ Delete Account</h3>
          <p className="modal-text">
            Are you sure you want to delete your account? This action cannot be
            undone and all your data will be permanently removed.
          </p>
          <div className="modal-buttons">
            <button className="cancel-btn" onClick={closeModal}>
              Cancel
            </button>
            <button className="confirm-btn" onClick={confirmDelete}>
              Yes, Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
