import express from "express";
import { MongoClient, ObjectId } from "mongodb";
import cors from "cors";

const app = express();
const PORT = 4000;
const mongoURL = "mongodb://localhost:27017";
const dbName = "quirknotes";

let db;

async function connectToMongo() {
  const client = new MongoClient(mongoURL);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    db = client.db(dbName);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

connectToMongo();

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.use(cors());

const COLLECTIONS = {
  notes: "notes",
};

app.get("/getAllNotes", express.json(), async (req, res) => {
  try {
    const collection = db.collection(COLLECTIONS.notes);
    const data = await collection.find().toArray();
    res.json({ response: data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/postNote", express.json(), async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res
        .status(400)
        .json({ error: "Title and content are both required." });
    }

    const collection = db.collection(COLLECTIONS.notes);
    const result = await collection.insertOne({
      title,
      content,
    });
    res.json({
      response: "Note added successfully.",
      insertedId: result.insertedId,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/deleteNote/:noteId", express.json(), async (req, res) => {
  try {
    const noteId = req.params.noteId;
    if (!ObjectId.isValid(noteId)) {
      return res.status(400).json({ error: "Invalid note ID." });
    }

    const collection = db.collection(COLLECTIONS.notes);
    const data = await collection.deleteOne({
      _id: new ObjectId(noteId),
    });

    if (data.deletedCount === 0) {
      return res
        .status(404)
        .json({ error: "Unable to find note with given ID." });
    }
    res.json({ response: `Document with ID ${noteId} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/patchNote/:noteId", express.json(), async (req, res) => {
  try {
    const noteId = req.params.noteId;
    if (!ObjectId.isValid(noteId)) {
      return res.status(400).json({ error: "Invalid note ID." });
    }

    const { title, content } = req.body;
    if (!title && !content) {
      return res
        .status(400)
        .json({ error: "Must have at least one of title or content." });
    }

    const collection = db.collection(COLLECTIONS.notes);
    const data = await collection.updateOne(
      {
        _id: new ObjectId(noteId),
      },
      {
        $set: {
          ...(title && { title }),
          ...(content && { content }),
        },
      }
    );

    if (data.matchedCount === 0) {
      return res
        .status(404)
        .json({ error: "Unable to find note with given ID." });
    }
    res.json({ response: `Document with ID ${noteId} patched.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/deleteAllNotes", express.json(), async (req, res) => {
  try {
    const collection = db.collection(COLLECTIONS.notes);
    const result = await collection.deleteMany({});
    res.json({ response: `${result.deletedCount} notes deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
