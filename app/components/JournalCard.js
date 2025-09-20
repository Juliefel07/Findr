
import React, { useState } from "react";


function getContrastColor(hex) {
  if (!hex) return "#000";
  const c = hex.replace("#", "");
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#000" : "#fff";
}

export default function JournalCard({ journal, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(journal.title);
  const [content, setContent] = useState(journal.content);
  const [color, setColor] = useState(journal.color || "#ffffff");
  const [busy, setBusy] = useState(false);

  const textColor = getContrastColor(color);

  const save = async () => {
    setBusy(true);
    try {
      await onUpdate(journal.id, { title: title.trim(), content: content.trim(), color });
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert("Update failed");
    } finally {
      setBusy(false);
    }
  };

  const cancel = () => {
    setIsEditing(false);
    setTitle(journal.title);
    setContent(journal.content);
    setColor(journal.color || "#ffffff");
  };

  return (
    <div
      className="journal-card"
      style={{
        backgroundColor: color,
        color: textColor,
      }}
    >
      {isEditing ? (
        <div style={{ width: "100%" }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="edit-title"
            placeholder="Title"
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="edit-content"
            placeholder="Content"
          />
          <div className="edit-controls">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
            <div className="button-group">
              <button className="btn btn-primary" onClick={save} disabled={busy}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={cancel} disabled={busy}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="card-row">
          <div className="card-left">
            <h3 className="card-title">{journal.title}</h3>
            <p className="card-text">{journal.content}</p>
          </div>

          <div className="card-right">
            <div className="button-group">
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
                aria-label={`Edit ${journal.title}`}
              >
                Edit
              </button>
              <button
                className="btn btn-primary"
                onClick={() => onDelete(journal.id)}
                aria-label={`Delete ${journal.title}`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}