console.log("Hello World, lets get building");

require('dotenv').config({path: './fsoenvironment.env'})
const express = require('express');
const app = express();
const cors = require('cors');

const Note = require('./models/note')
const PhoneNumber = require('./models/phonenumber')
let notes = [];
let phonenumberlist = [];

const requestLogger = (request, response, next) => {
    console.log("Method: ", request.method);
    console.log(Date.now());
    console.log(request.path);
    console.log(request.body);
    console.log("---");
    next();
}


app.use(express.json());
app.use(cors());
app.use(requestLogger);
app.use(express.static('dist'))

app.get('/', (req, res) => {
    res.send('Hello dave')
})

//Note Region
app.get('/api/notes/', (req, res) => {
    Note.find({})
        .then(notes => {
            console.log("Fetched notes:", notes);
            res.json(notes);
        })
        .catch(err => {
            console.error("Error fetching notes:", err);
            res.status(500).send({ error: "Unable to fetch notes" });
        });
});

app.get('/api/notes/:id', (request, response) => {
    Note.findById(request.params.id).then(note =>  {
        response.json(note);
    });
});

app.post('/api/notes', (request, response) => {

    const body = request.body;

    if (!body.content) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const note = new Note({
        content: body.content,
        important: body.important || false

    });

    note.save().then(savedNote => {
        response.json(savedNote);
    });
})

app.delete('/api/notes/:id', (request, response) => {
    Note.deleteOne({_id: request.params.id}).then(() => {
        console.log("Note deleted");
    });
    const id = request.params.id
    notes = notes.filter(n => n.id !== id)
    response.status(204).end()
})
//

//Phone Region
app.get('/api/phonebook/', (req, res) => {
    PhoneNumber.find({})
        .then(notes => {
            console.log("Fetched notes:", notes);
            res.json(notes);
        })
        .catch(err => {
            console.error("Error fetching notes:", err);
            res.status(500).send({ error: "Unable to fetch notes" });
        });
});

app.get('/api/phonebook/:id', (request, response) => {
    PhoneNumber.findById(request.params.id).then(entry =>  {
        response.json(entry);
    });
});

app.post('/api/phonebook', (request, response) => {

    const body = request.body;

    if (!body.name) {
        return response.status(400).json({
            error: 'content missing'
        })
    }

    const phoneentry = new PhoneNumber({
        name: body.name,
        number: body.number || false

    });

    phoneentry.save().then(savedNumber => {
        response.json(savedNumber);
    });
})

app.delete('/api/phonebook/:id', (request, response) => {
    PhoneNumber.deleteOne({_id: request.params.id}).then(() => {
        console.log("Note deleted");
    });
    const id = request.params.id
    phonenumberlist = phonenumberlist.filter(n=> n.id !== id)
    response.status(204).end()
})
//

const PORT = process.env.PORT ||  3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})
