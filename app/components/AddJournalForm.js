
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { db } from "../../firebase/config";

export default function AddJournalForm({ userId }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return alert("Please fill title and content.");
    setLoading(true);
    try {
      await addDoc(collection(db, "travelEntries"), {
        userId,
        title: title.trim(),
        content: content.trim(),
        color,
        timestamp: serverTimestamp(),
      });
      setTitle("");
      setContent("");
      setColor("#ffffff");
    } catch (err) {
      console.error(err);
      alert("Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-form" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Journal title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        placeholder="Write about this trip..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <div className="controls">
        <label style={{fontSize:14}}>Pick color</label>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Entry"}
        </button>
      </div>
    </form>
  );
}