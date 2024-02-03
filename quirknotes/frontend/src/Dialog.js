import React, {useState, useEffect} from "react"
import './App.css';

const baseNote = {title: "", content: ""}

function Dialog({ open, initialNote, closeDialog, postNote: postNoteState, patchNote: patchNoteState }) {
  const [note, setNote] = useState(baseNote);
  const [status, setStatus] = useState("");

    useEffect(() => {
        !initialNote && setNote(baseNote)
        initialNote && setNote(initialNote)
    }, [initialNote])

  const close = () => {
    setStatus("");
    setNote(baseNote);
    closeDialog();
  };

  const postNoteHandler = async () => {
    if (!note || !note.title || !note.content) {
      return;
    }

    setStatus("Loading...");

    try {
      const response = await fetch("http://localhost:4000/postNote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: note.title, content: note.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post note");
      }

      await response.json().then((data) => {
        postNoteState(data.insertedId, note.title, note.content);
        setStatus("Note posted successfully!");
        close();
      });
    } catch (error) {
      setStatus("Error trying to post note");
      console.error("Fetch function failed:", error);
      // You may want to show a message to the user or handle the error in another way
    }
  };

  const patchNoteHandler = async () => {
    try {
      const response = await fetch(`http://localhost:4000/patchNote/${initialNote._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: note.title, content: note.content }),
      });

      if (!response.ok) {
        throw new Error("Failed to patch note");
      }

      await response.json().then(() => {
        patchNoteState(initialNote._id, note.title, note.content);
        setStatus("Note patched successfully!");
        close();
      });
    } catch (error) {
      setStatus("Error trying to patch note");
      console.error("Fetch function failed:", error);
      // You may want to show a message to the user or handle the error in another way
    }
  };

  return (
    <dialog open={open} style={DialogStyle.dialog}>
      <input
        placeholder="Your note title goes here!"
        type="text"
        value={note.title}
        maxLength={30}
        style={DialogStyle.title}
        onChange={(e) => setNote({ ...note, title: e.target.value })}
      />
      <textarea
        placeholder="Your note content goes here!"
        value={note.content}
        rows={5}
        style={DialogStyle.content}
        onChange={(e) => setNote({ ...note, content: e.target.value })}
      />
      <div style={DialogStyle.buttonWrapper}>
        <button
          onClick={() => {
            initialNote ? patchNoteHandler() : postNoteHandler();
          }}
          disabled={!note.title || !note.content}
        >
          {initialNote ? 'Patch Note' : 'Post Note'}
        </button>
        {status && <div>{status}</div>}
        <button style={DialogStyle.closeButton} onClick={() => close()}>
          Close
        </button>
      </div>
    </dialog>
  );
}

export default Dialog;

const DialogStyle = {
  dialog: { width: "75%" },
  title: {
    fontSize: "40px",
    display: "block",
    width: "100%",
  },
  content: {
    fontSize: "20px",
    display: "block",
    width: "100%",
  },
  buttonWrapper: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  closeButton: { justifySelf: "end" },
};