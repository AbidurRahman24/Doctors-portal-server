const express = require('express')
const app = express()
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra')
const fileUpload = require('express-fileupload');
const { MongoClient } = require('mongodb');
require('dotenv').config()
//MiddleWare
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dyzwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const appointmentsCollection = client.db("doctorsPortal").collection("appointments");
    const doctorCollection = client.db("doctorsPortal").collection("doctors");

    app.post('/addAppointment', (req, res) => {
        const appointment = req.body;
        appointmentsCollection.insertOne(appointment)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    });

    app.post('/appointmentsByDate', (req, res) => {
        const date = req.body
        const email = req.body.email

        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                const filter = { date: date.date }
                if (doctors.length === 0) {
                    filter.email = email
                }
                appointmentsCollection.find(filter)
                    .toArray((err, documents) => {
                        // console.log(email, date.date, doctors, documents)
                        res.send(documents);
                    })
            })
    })

    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })


    app.post('/addDoctor', (req, res) => {
        const file = req.files.file;
        const name = req.body.name;
        const email = req.body.email;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        // const filePath = `${__dirname}/doctors/${file.name}`
        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        doctorCollection.insertOne({ name, email, image })
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        // file.mv(filePath, err => {
        //     if (err) {
        //         console.log(err);
        //         return res.status(500).send({ msg: 'feil' })
        //     }
        //     doctorCollection.insertOne({ name, email, img: file.name })
        //         .then(result => {
        //             res.send(result.insertedCount > 0);
        //         })
        // })
    })


    app.get('/appointments', (req, res) => {
        appointmentsCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.get('/doctor', (req, res) => {
        doctorCollection.find({})
            .toArray((err, documents) => {
                res.send(documents);
            })
    })
    app.post('/isDoctor', (req, res) => {
        const email = req.body.email;
        doctorCollection.find({ email: email })
            .toArray((err, doctors) => {
                res.send(doctors.length > 0);
            })
    })
});



app.get('/', (req, res) => {
    res.send('Hello World!')
})

const port = process.env.PORT || 5000
app.listen(port)