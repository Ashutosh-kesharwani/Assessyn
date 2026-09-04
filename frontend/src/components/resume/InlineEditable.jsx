import { useState, useRef, useEffect, createContext, useContext } from 'react';
import { Trash2, Plus, ExternalLink, Edit2, Check, X } from 'lucide-react';

/**
 * 🔒 Global Read-Only Context for Clean Document Preview Mode
 */
export const ResumeReadOnlyContext = createContext(false);

/**
 * ✏️ Inline Editable Text Component
 * Allows double-click or single-click in-place live editing directly on the resume.
 * If readOnly is true, renders clean text without edit wrappers.
 */
export function EditableText({
  value = '',
  onChange,
  className = '',
  tag: Tag = 'span',
  placeholder = 'Click to edit...',
  multiline = false,
  doubleClickOnly = false,
  readOnly = false,
}) {
  const contextReadOnly = useContext(ResumeReadOnlyContext);
  const isLocked = readOnly || contextReadOnly;

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || '');
  const inputRef = useRef(null);

  useEffect(() => {
    setDraft(value || '');
  }, [value]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current.select) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  if (isLocked) {
    return <Tag className={className}>{value}</Tag>;
  }

  const handleCommit = () => {
    setIsEditing(false);
    if (draft !== value && onChange) {
      onChange(draft);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setDraft(value || '');
      setIsEditing(false);
    } else if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleCommit();
    }
  };

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          ref={inputRef}
          value={draft}
          onChange={(e) => {
            setDraft(e.target.value);
            if (onChange) onChange(e.target.value);
          }}
          onBlur={handleCommit}
          onKeyDown={handleKeyDown}
          rows={3}
          className={`w-full p-1.5 bg-blue-50/70 border border-blue-400 rounded text-stone-900 font-sans text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 leading-relaxed resize-y ${className}`}
        />
      );
    }

    return (
      <input
        ref={inputRef}
        type="text"
        value={draft}
        onChange={(e) => {
          setDraft(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
        className={`px-1 py-0.5 bg-blue-50/70 border border-blue-400 rounded text-stone-900 focus:outline-none focus:ring-1 focus:ring-blue-500 inline-block ${className}`}
      />
    );
  }

  const triggerEvents = doubleClickOnly
    ? { onDoubleClick: () => setIsEditing(true) }
    : {
        onClick: () => setIsEditing(true),
        onDoubleClick: () => setIsEditing(true),
      };

  return (
    <Tag
      {...triggerEvents}
      title="Click or Double-click to edit directly"
      className={`group/edit cursor-text transition-colors hover:bg-blue-50/50 hover:outline hover:outline-1 hover:outline-dashed hover:outline-blue-400 rounded px-0.5 -mx-0.5 ${className}`}
    >
      {value || <span className="text-stone-400 italic">{placeholder}</span>}
    </Tag>
  );
}

/**
 * 🔗 Inline Editable Link
 * Allows editing both display text and target URL with double-click popover.
 */
export function EditableLink({
  label = '',
  url = '',
  onChange,
  icon: Icon,
  className = '',
  readOnly = false,
}) {
  const contextReadOnly = useContext(ResumeReadOnlyContext);
  const isLocked = readOnly || contextReadOnly;

  const [isOpen, setIsOpen] = useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftUrl, setDraftUrl] = useState(url);

  useEffect(() => {
    setDraftLabel(label);
    setDraftUrl(url);
  }, [label, url]);

  if (isLocked) {
    const href = url ? (url.startsWith('http') ? url : `https://${url}`) : '#';
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1 hover:underline text-inherit ${className}`}
      >
        {Icon && <Icon className="w-3 h-3 text-stone-500 flex-shrink-0" />}
        <span>{label || url}</span>
      </a>
    );
  }

  const handleSave = () => {
    if (onChange) {
      onChange({ label: draftLabel, url: draftUrl });
    }
    setIsOpen(false);
  };

  return (
    <div className="relative inline-flex items-center gap-1 group/link">
      {Icon && <Icon className="w-3 h-3 text-stone-500 flex-shrink-0" />}

      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onDoubleClick={() => setIsOpen(true)}
        title="Click to edit link & text"
        className={`hover:text-blue-700 hover:underline cursor-pointer transition-colors ${className}`}
      >
        <span>{label || url || 'Add Link'}</span>
      </button>

      {/* Popover Editor */}
      {isOpen && (
        <div
          className="no-print absolute left-0 top-full mt-1.5 z-50 w-64 bg-[#0e1020] border border-white/20 rounded-xl p-3 shadow-2xl space-y-2 text-left animate-in fade-in zoom-in-95 select-none"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between pb-1 border-b border-white/10">
            <span className="text-[10px] font-mono font-bold text-white uppercase flex items-center gap-1">
              <ExternalLink size={11} /> Edit Link Details
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-secondary hover:text-white rounded cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] font-mono text-secondary uppercase">Display Text</label>
            <input
              type="text"
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              placeholder="e.g. github.com/alex"
              className="w-full px-2 py-1 bg-surface border border-subtle rounded text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9.5px] font-mono text-secondary uppercase">Target URL</label>
            <input
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-2 py-1 bg-surface border border-subtle rounded text-xs text-white font-mono focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-2 py-1 rounded bg-surface hover:bg-white/10 text-[10px] font-mono text-secondary hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-2.5 py-1 rounded bg-brand-500 hover:bg-brand-600 text-[10px] font-mono text-white font-bold cursor-pointer"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * 🎯 Inline Editable Bullet List
 * Allows live in-place editing of bullet points, adding new bullets, and deleting.
 */
export function EditableBulletList({
  bullets = [],
  onChange,
  className = '',
  bulletClassName = '',
  readOnly = false,
}) {
  const contextReadOnly = useContext(ResumeReadOnlyContext);
  const isLocked = readOnly || contextReadOnly;

  if (isLocked) {
    return (
      <ul className={`list-disc list-outside pl-4 space-y-1 ${className}`}>
        {bullets.map((bullet, idx) => (
          <li key={idx} className={bulletClassName}>
            {bullet}
          </li>
        ))}
      </ul>
    );
  }

  const handleUpdate = (index, newValue) => {
    const updated = [...bullets];
    updated[index] = newValue;
    if (onChange) onChange(updated);
  };

  const handleDelete = (index) => {
    const updated = bullets.filter((_, i) => i !== index);
    if (onChange) onChange(updated);
  };

  const handleAddBullet = () => {
    const updated = [...bullets, 'Demonstrated high-impact technical achievement optimizing system throughput.'];
    if (onChange) onChange(updated);
  };

  return (
    <ul className={`list-disc list-outside pl-4 space-y-1 ${className}`}>
      {bullets.map((bullet, idx) => (
        <li key={idx} className="group/bullet relative">
          <div className="flex items-start justify-between gap-1">
            <div className="flex-1">
              <EditableText
                value={bullet}
                onChange={(val) => handleUpdate(idx, val)}
                multiline={true}
                className={bulletClassName}
              />
            </div>

            {/* Quick delete bullet button (Hidden during print) */}
            <button
              type="button"
              onClick={() => handleDelete(idx)}
              title="Delete bullet point"
              className="no-print opacity-0 group-hover/bullet:opacity-100 transition-opacity p-0.5 text-stone-400 hover:text-rose-600 rounded cursor-pointer flex-shrink-0"
            >
              <Trash2 size={11} />
            </button>
          </div>
        </li>
      ))}

      {/* Add Bullet Button (Hidden during print) */}
      <li className="no-print list-none -ml-4 pt-0.5">
        <button
          type="button"
          onClick={handleAddBullet}
          className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-stone-500 hover:text-blue-700 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-blue-50"
        >
          <Plus size={11} />
          <span>Add bullet point</span>
        </button>
      </li>
    </ul>
  );
}

/**
 * ➕ Section Actions (Add Experience, Project, Education)
 * Completely hidden during print or in readOnly mode.
 */
export function SectionAddButton({ label, onClick, readOnly = false }) {
  const contextReadOnly = useContext(ResumeReadOnlyContext);
  if (readOnly || contextReadOnly) return null;

  return (
    <div className="no-print pt-1.5 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 border border-stone-300 text-[10.5px] font-mono font-bold text-stone-700 hover:text-stone-950 transition-all cursor-pointer shadow-xs"
      >
        <Plus size={12} />
        <span>{label}</span>
      </button>
    </div>
  );
}
