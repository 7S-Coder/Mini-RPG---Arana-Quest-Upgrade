"use client";

import React, { useEffect } from "react";

export default function Modal({ title, onClose, children }: { title?: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    try { document.body.classList.add('modal-open'); } catch (e) {}
    return () => { try { document.body.classList.remove('modal-open'); } catch (e) {} };
  }, []);
  return (
    <div
      className="app-modal-backdrop"
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.5)',
        zIndex: 1000000,
      }}
      onClick={onClose}
    >
      <div
        className="app-modal-panel"
        style={{
          position: 'relative',
          pointerEvents: 'auto',
          zIndex: 1000001,
          background: '#111',
          color: '#fff',
          padding: 16,
          borderRadius: 8,
          minWidth: 480,
          maxWidth: '90%',
          maxHeight: '80%',
          overflow: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, zIndex: 500 }}>
            <h3 style={{ margin: 0 }}>{title}</h3>
            <button className="close" onClick={onClose}>×</button>
          </div>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
}
