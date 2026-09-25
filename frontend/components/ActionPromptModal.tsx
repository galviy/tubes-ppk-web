'use client';

import { useState, useEffect } from 'react';

export interface ActionModalConfig {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  label?: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning' | 'success';
  showInput?: boolean;
  requireInput?: boolean;
  onConfirm: (val: string) => void;
}

interface ActionPromptModalProps {
  config: ActionModalConfig;
  onClose: () => void;
}

export default function ActionPromptModal({ config, onClose }: ActionPromptModalProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (config.isOpen) {
      setValue(config.defaultValue || '');
      setError('');
    }
  }, [config.isOpen, config.defaultValue]);

  if (!config.isOpen) return null;

  function handleConfirm() {
    if (config.showInput && config.requireInput && !value.trim()) {
      setError(`Mohon isi ${config.label?.toLowerCase() || 'bidang ini'} terlebih dahulu.`);
      return;
    }
    config.onConfirm(value.trim());
    onClose();
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey || !config.showInput)) {
      e.preventDefault();
      handleConfirm();
    }
  }

  const isDanger = config.confirmVariant === 'danger';
  const isWarning = config.confirmVariant === 'warning';
  const isSuccess = config.confirmVariant === 'success';

  return (
    <div className="modal-overlay" onClick={onClose} onKeyDown={handleKeyDown}>
      <div
        className="action-dialog-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header with icon badge & close button */}
        <div className="action-dialog-header">
          <div className={`action-dialog-badge ${config.confirmVariant || 'primary'}`}>
            {isSuccess ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : isDanger ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            ) : isWarning ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {/* Status Pill Badge */}
            {isSuccess && (
              <div style={{ marginBottom: 6 }}>
                <span className="action-status-pill success">SUCCESS • BERHASIL</span>
              </div>
            )}
            {isDanger && (
              <div style={{ marginBottom: 6 }}>
                <span className="action-status-pill danger">FAILED • GAGAL</span>
              </div>
            )}
            {isWarning && (
              <div style={{ marginBottom: 6 }}>
                <span className="action-status-pill warning">PERINGATAN</span>
              </div>
            )}

            <h3 className="action-dialog-title">{config.title}</h3>
            {config.subtitle && (
              <p className="action-dialog-desc">{config.subtitle}</p>
            )}
          </div>

          <button
            type="button"
            className="action-dialog-close"
            onClick={onClose}
            aria-label="Tutup"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Optional Input / Textarea */}
        {config.showInput && (
          <div className="action-dialog-body">
            {config.label && (
              <label className="action-dialog-label" htmlFor="action-modal-input">
                {config.label} {config.requireInput && <span style={{ color: '#dc2626' }}>*</span>}
              </label>
            )}

            <textarea
              id="action-modal-input"
              className={`action-dialog-textarea ${error ? 'has-error' : ''}`}
              placeholder={config.placeholder || 'Tuliskan catatan atau alasan di sini...'}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError('');
              }}
              rows={3}
              autoFocus
            />

            {error && (
              <div className="action-dialog-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="action-dialog-footer">
          <button
            type="button"
            className="action-dialog-btn-cancel"
            onClick={onClose}
          >
            {config.cancelText || 'Batal'}
          </button>

          <button
            type="button"
            className={`action-dialog-btn-confirm ${config.confirmVariant || 'primary'}`}
            onClick={handleConfirm}
          >
            {config.confirmText || 'Konfirmasi'}
          </button>
        </div>
      </div>
    </div>
  );
}
