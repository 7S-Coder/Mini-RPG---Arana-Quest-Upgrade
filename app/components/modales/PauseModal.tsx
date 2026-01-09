"use client";

import React, { useEffect } from "react";
import "../styles/pauseModal.css";

interface PauseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PauseModal({ isOpen, onClose }: PauseModalProps) {
  // Handle Escape key to close pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        e.stopImmediatePropagation();
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (confirm("This will permanently delete all your game data. Click OK again to confirm.")) {
        try {
          // Stop the game from running
          if ((window as any).__stopGame) {
            (window as any).__stopGame();
          }
          
          // Stop any running intervals/timeouts
          for (let i = 1; i < 99999; i++) {
            clearInterval(i);
            clearTimeout(i);
          }
          
          // Disable any auto-save mechanisms
          if ((window as any).__arenaquest_save_game) {
            (window as any).__arenaquest_save_game = () => {};
          }
          
          // Wait a moment before clearing storage
          setTimeout(() => {
            try {
              // Remove all localStorage items
              localStorage.clear();
              
              // Remove all sessionStorage items
              sessionStorage.clear();
              
              // Reload the page to reset everything
              window.location.reload();
            } catch (e) {
              console.error("Error clearing data:", e);
              alert("Error deleting account. Please try again.");
            }
          }, 500);
        } catch (e) {
          console.error("Error in deletion process:", e);
          alert("Error deleting account. Please try again.");
        }
      }
    }
  };

  return (
    <div className="pause-modal-overlay">
      <div className="pause-modal-content">
        <h1 className="pause-title">PAUSED</h1>
        
        <div className="pause-info">
          <p>Press <span className="key">ESC</span> to resume</p>
        </div>

        <div className="pause-actions">
          <button 
            className="pause-button resume-button"
            onClick={onClose}
          >
            Resume Game
          </button>

          <button 
            className="pause-button delete-button"
            onClick={handleDeleteAccount}
          >
            Delete Account
          </button>
        </div>

        <div className="pause-footer">
          <p>All progress is automatically saved</p>
        </div>
      </div>
    </div>
  );
}
