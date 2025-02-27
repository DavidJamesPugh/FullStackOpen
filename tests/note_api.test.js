import {
  test, after, beforeEach, describe,
} from 'node:test';
import mongoose from 'mongoose';
import supertest from 'supertest';
import assert from 'assert';
import { Helper } from './test_helper.js';
import app from '../app.js';
import Note from '../models/note.js';

const api = supertest(app);

describe('when there are some notes saved initially', () => {
  beforeEach(async () => {
    await Note.deleteMany({});
    await Note.insertMany(Helper.initNotes);
  });

  test('notes are returned as json', async () => {
    await api
      .get('/api/notes')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all notes are returned', async () => {
    const response = await api.get('/api/notes');

    assert.strictEqual(response.body.length, Helper.initNotes.length);
  });

  test('a specific note is within the returned notes', async () => {
    const response = await api.get('/api/notes');

    const contents = response.body.map((r) => r.content);
    assert(contents.includes('Browser can execute only JavaScript'));
  });

  describe('viewing a specific note', () => {
    test('succeeds with a valid id', async () => {
      const notesAtStart = await Helper.notesInDB();

      const noteToView = notesAtStart[0];

      const resultNote = await api
        .get(`/api/notes/${noteToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);

      assert.deepStrictEqual(resultNote.body, noteToView);
    });

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await Helper.nonExistingId();

      await api
        .get(`/api/notes/${validNonexistingId}`)
        .expect(404);
    });

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445';

      await api
        .get(`/api/notes/${invalidId}`)
        .expect(400);
    });
  });

  describe('addition of a new note', () => {
    test('succeeds with valid data', async () => {
      const newNote = {
        content: 'async/await simplifies making async calls',
        important: true,
      };

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/);

      const notesAtEnd = await Helper.notesInDB();
      assert.strictEqual(notesAtEnd.length, Helper.initNotes.length + 1);

      const contents = notesAtEnd.map((n) => n.content);
      assert(contents.includes('async/await simplifies making async calls'));
    });

    test('fails with status code 400 if data invalid', async () => {
      const newNote = {
        important: true,
      };

      await api
        .post('/api/notes')
        .send(newNote)
        .expect(400);

      const notesAtEnd = await Helper.notesInDB();

      assert.strictEqual(notesAtEnd.length, Helper.initNotes.length);
    });
  });

  describe('deletion of a note', () => {
    test('succeeds with status code 204 if id is valid', async () => {
      const notesAtStart = await Helper.notesInDB();
      const noteToDelete = notesAtStart[0];

      await api
        .delete(`/api/notes/${noteToDelete.id}`)
        .expect(204);

      const notesAtEnd = await Helper.notesInDB();

      assert.strictEqual(notesAtEnd.length, Helper.initNotes.length - 1);

      const contents = notesAtEnd.map((r) => r.content);
      assert(!contents.includes(noteToDelete.content));
    });
  });
});

after(async () => {
  await mongoose.connection.close();
});
