import React, { useState, useEffect } from "react";
import './App.css';
import Dialog from "./Dialog";
import Note from "./Note";

function App() {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogNote, setDialogNote] = useState(null);
  const [dialogStatus, setDialogStatus] = useState("");

  useEffect(() => {
    const getNotes = async () => {
      try {
        const response = await fetch("http://localhost:4000/getAllNotes");
        if (!response.ok) {
          console.log("Server failed:", response.status);
        } else {
          const data = await response.json();
          getNoteState(data.response);
        }
      } catch (error) {
        console.log("Fetch function failed:", error);
      } finally {
        setLoading(false);
      }
    };

    getNotes();
  }, []);

  const deleteNote = async (entry) => {
    try {
      // Optimistic UI rendering: Remove the note from the state immediately
      deleteNoteState(entry._id);

      const response = await fetch(`http://localhost:4000/deleteNote/${entry._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Failed to delete note with ID ${entry._id}`);
      }

      console.log(`Note with ID ${entry._id} deleted successfully.`);
    } catch (error) {
      // Rollback the state change on error
      console.error(error.message);
      // You may want to show a message to the user or handle the error in another way
    }
  };

  const deleteAllNotes = async () => {
    try {
      const response = await fetch("http://localhost:4000/deleteAllNotes", {
        method: "DELETE",
      });

      if (!response.ok) {
        console.log("Server failed:", response.status);
      } else {
        await response.json().then(() => {
          deleteAllNotesState();
        });
      }
    } catch (error) {
      console.log("Fetch function failed:", error);
    }
  };

  const patchNote = async (entry) => {
    setDialogNote(entry);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogNote(null);
    setDialogOpen(false);
    setDialogStatus("");
  };

  const editNote = (entry) => {
    setDialogNote(entry);
    setDialogOpen(true);
  };

  const postNote = () => {
    setDialogNote(null);
    setDialogOpen(true);
  };

  const getNoteState = (data) => {
    setNotes(data);
  };

  const postNoteState = (_id, title, content) => {
    setNotes((prevNotes) => [...prevNotes, { _id, title, content }]);
  };

  const deleteNoteState = (noteId) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note._id !== noteId));
  };

  const deleteAllNotesState = () => {
    setNotes([]);
  };

  const patchNoteState = (noteId, newTitle, newContent) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note._id === noteId ? { ...note, title: newTitle, content: newContent } : note
      )
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <div style={dialogOpen ? AppStyle.dimBackground : {}}>
          <h1 style={AppStyle.title}>QuirkNotes</h1>
          <h4 style={AppStyle.text}>The best note-taking app ever </h4>

          <div style={AppStyle.notesSection}>
            {loading ? (
              <>Loading...</>
            ) : notes ? (
              notes.map((entry) => (
                <div key={entry._id}>
                  <Note entry={entry} editNote={editNote} deleteNote={deleteNote} patchNote={patchNote} />
                </div>
              ))
            ) : (
              <div style={AppStyle.notesError}>
                Something has gone horribly wrong! We can't get the notes!
              </div>
            )}
          </div>

          <button onClick={postNote}>Post Note</button>
          {notes && notes.length > 0 && (
            <button onClick={deleteAllNotes}>Delete All Notes</button>
          )}
        </div>

        <Dialog
          open={dialogOpen}
          initialNote={dialogNote}
          closeDialog={closeDialog}
          postNote={postNoteState}
          patchNote={patchNoteState}
          setStatus={setDialogStatus}
        />

        {dialogStatus && <div>{dialogStatus}</div>}
      </header>
    </div>
  );
}

export default App;

const AppStyle = {
  dimBackground: {
    opacity: "20%",
    pointerEvents: "none",
  },
  notesSection: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  notesError: { color: "red" },
  title: {
    margin: "0px",
  },
  text: {
    margin: "0px",
  },
};