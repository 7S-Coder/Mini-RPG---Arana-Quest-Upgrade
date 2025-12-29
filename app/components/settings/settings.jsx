"use client";

import { useState, useRef, useEffect } from "react";
import { Settings as SettingsIcon, Trash2 } from "lucide-react";
import "../styles/settings.css";

export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        // Stop the game from running
        if ((window).__stopGame) {
          (window).__stopGame();
        }
        
        // Remove all localStorage items
        localStorage.clear();
        
        // Remove all sessionStorage items
        sessionStorage.clear();
        
        // Delete all IndexedDB databases
        if (window.indexedDB) {
          indexedDB.databases?.().then((dbs) => {
            dbs.forEach((db) => {
              indexedDB.deleteDatabase(db.name);
            });
          }).catch(() => {});
        }
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        
        console.log("✓ Account deleted - all data cleared");
        
        // Redirect to home page (fresh load)
        window.location.href = '/';
      } catch (e) {
        console.error("Error deleting account:", e);
        window.location.href = '/';
      }
    }
  };

  return (
    <div className="settings-container" ref={containerRef}>
      <button 
        className="settings-button" 
        onClick={() => setIsOpen(!isOpen)}
        title="Settings"
        aria-label="Settings"
      >
        <SettingsIcon size={20} />
      </button>

      {isOpen && (
        <div className="settings-dropdown">
          <button 
            className="settings-dropdown-item danger" 
            onClick={handleDeleteAccount}
          >
            <Trash2 size={16} />
            Delete Account
          </button>
        </div>
      )}
    </div>
  );
}