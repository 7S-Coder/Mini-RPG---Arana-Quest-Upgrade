import React from "react";

export default function Modal({ title, onClose, children }: { title?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', left: 0, top: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', zIndex: 40 }} onClick={onClose}>
      <div style={{ background: '#111', color: '#fff', padding: 16, borderRadius: 8, minWidth: 480, maxWidth: '90%', maxHeight: '80%', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        {title && <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, zIndex: 500 }}><h3 style={{ margin: 0 }}>{title}</h3><button className="close" onClick={onClose}>×</button></div>}
        <div>{children}</div>
      </div>
    </div>
  );
}
