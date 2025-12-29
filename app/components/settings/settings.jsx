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
        // Empty localStorage completely by removing all keys
        while (localStorage.length > 0) {
          const key = localStorage.key(0);
          console.log('Removing key:', key);
          localStorage.removeItem(key);
        }
        
        // Double check - remove by specific keys too
        const keysToRemove = [
          'arenaquest_core_v1',
          'arenaquest_progression_v1',
          'arena_quest_tutorials_shown',
          'arenaquest_stats_v1',
          'arenaquest_achievements_v1'
        ];
        keysToRemove.forEach(key => localStorage.removeItem(key));
        
        // Clear sessionStorage
        sessionStorage.clear();
        
        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        
        // Clear IndexedDB
        if (window.indexedDB) {
          indexedDB.databases?.().then((dbs) => {
            dbs.forEach((db) => {
              indexedDB.deleteDatabase(db.name);
            });
          });
        }
        
        console.log("Account deleted - all storage cleared");
        
        // Wait a moment to ensure everything is cleared, then hard reload
        setTimeout(() => {
          window.location.href = window.location.origin + window.location.pathname + window.location.search;
        }, 100);
      } catch (e) {
        console.error("Error deleting account data:", e);
        // Still reload even if there's an error
        setTimeout(() => window.location.reload(), 100);
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