require('dotenv').config();

const {
    default: sansekaiConnect,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeInMemoryStore,
    Browsers,
    makeCacheableSignalKeyStore,
    delay,
} = require("@whiskeysockets/baileys");

const { QuickDB } = require('quick.db');
const { MongoDriver   } = require('quickmongo');
const { Collection } = require('discord.js');

// Handlers
const MessageHandler = require('./Handlers/Message');
const EventsHandler = require('./Handlers/Events');
const { groups } = require('./Handlers/Mods');
const econ = require("./Database/Models/economy");
const contact = require('./Structures/Contact');
const utils = require('./Structures/Functions');
const CardHandler = require('./Handlers/card')
const PokeHandler = require('./Handlers/poke')
const express = require("express");
const app = express();
const { imageSync } = require('qr-image');
const mongoose = require('mongoose');
const pino = require('pino');
const axios = require('axios');
const { Boom } = require('@hapi/boom');
const { join } = require('path');
const { readdirSync } = require('fs-extra');
const chalk = require('chalk');

const port = process.env.PORT || process.env.SERVER_PORT||3000;
const driver = new MongoDriver (process.env.URL)
//const driver = new MongoDriver (process.env.URL); //Un commit this line and remove above line Check models/eco i have improved there as well
const log = pino({ level: 'silent' });
const path= require("path");
let sessionName = process.env.SESSION
const fs = require("fs");
// Response maps
const m1 = new Map();
const m2 = new Map();
const m3 = new Map();
const m4 = new Map();
const m5 = new Map();
const m6 = new Map();
const m7 = new Map();
const m8 = new Map();
const m9 = new Map();
const m10 = new Map();
const m11 = new Map();
let QR_GENERATE
const color = (text, color) => {
    return !color ? chalk.green(text) : chalk.keyword(color)(text);
};

async function startZeroTwo() {


    await driver.connect()
    const store = makeInMemoryStore({ logger: log.child({ level: "silent", stream: "store" }) });
    const { state, saveCreds } = await useMultiFileAuthState(`./${sessionName ? sessionName : "session"}`);
    const { version, isLatest } = await fetchLatestBaileysVersion();
    console.log(`using WA v${version.join(".")}, isLatest: ${isLatest}`);

    let client = sansekaiConnect({
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
        },
        version,
        printQRInTerminal: true,
        logger: pino({ level: "fatal" }).child({ level: "fatal" }),
        browser: ["Twilight", "Safari", "1.0.0"], //Don't change this connection will be closed sice bot is connected with twilight credentials
    });
    
    store.bind(client.ev);

    client.prefix = process.env.PREFIX || ':';
    client.name = process.env.NAME || 'Aurora'
    client.mods = ('916239664935,917980329866,919775689150,917379899475,923274079362').split(',');

    // Devs
    client.groups = groups();

    client.cardMap = m1
    client.aucMap = m2
    client.sellMap = m3
    client.sell = m9
    client.haigushaResponse = m10
    client.pokemonResponse = m4
    client.pokemonMoveLearningResponse = m5
    client.pokemonEvolutionResponse = m6
    client.pokemonBattleResponse = m7
    client.pokemonBattlePlayerMap = m8
    client.pokemonChallengeResponse = m11

    
    // Database
    client.DB = new QuickDB({ filePath: "./src/Database/DB.sqlite" });

    // Tables
    client.contactDB = new QuickDB({ filePath: "./src/Database/users.sqlite" });

    // Contacts
    client.contact = contact;

    // Experience
    client.exp = new QuickDB({ filePath: "./src/Database/exp.sqlite" });

    // Cards
    client.card = new QuickDB({ filePath: "./src/Database/card.sqlite" });

    // Economy 
    client.econ = new QuickDB({ filePath: "./src/Database/economy.sqlite" });
    
    // active points
    client.act = new QuickDB({ filePath: "./src/Database/act.sqlite" });

    // Events
    client.pkmn = new QuickDB({ filePath: "./src/Database/pkmn.sqlite" });
    
    // Commands
    client.cmd = new Collection();

    // Utils
    client.utils = utils;
    
    // Groups
    client.getAllGroups = async () => Object.keys(await client.groupFetchAllParticipating());

    client.public = true;

    client.log = (text, color = 'green') =>
        color ? console.log(chalk.keyword(color)(text)) : console.log(chalk.green(text));

    const loadCommands = async () => {
        const readCommand = (rootDir) => {
            readdirSync(rootDir).forEach(($dir) => {
                const commandFiles = readdirSync(join(rootDir, $dir)).filter((file) => file.endsWith('.js'))
                for (let file of commandFiles) {
                    const command = require(join(rootDir, $dir, file))
                    client.cmd.set(command.name, command)
                }
            })
            client.log('Commands loaded!')
        }
        readCommand(join(__dirname, '.', 'Commands'))
    }

    // Handle error
    const unhandledRejections = new Map();
    process.on("unhandledRejection", (reason, promise) => {
        unhandledRejections.set(promise, reason);
        console.log("Unhandled Rejection at:", promise, "reason:", reason);
    });
    process.on("rejectionHandled", (promise) => {
        unhandledRejections.delete(promise);
    });
    process.on("Something went wrong", function (err) {
        console.log("Caught exception: ", err);
    });

    client.public = true;

    client.serializeM = (m) => smsg(client, m, store);
    client.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            QR_GENERATE = qr;
        }
 
        if (connection === "close") {
            let reason = new Boom(lastDisconnect?.error)?.output.statusCode;
            if (reason === DisconnectReason.badSession) {
                console.log(`Bad Session File, Please Delete Session and Scan Again`);
                process.exit();
            } else if (reason === DisconnectReason.connectionClosed) {
                console.log("Connection closed, reconnecting....");
                startZeroTwo();
            } else if (reason === DisconnectReason.connectionLost) {
                console.log("Connection Lost from Server, reconnecting...");
                startZeroTwo();
            } else if (reason === DisconnectReason.connectionReplaced) {
                console.log("Connection Replaced, Another New Session Opened, Please Restart Bot");
                process.exit();
            } else if (reason === DisconnectReason.loggedOut) {
                console.log(`Device Logged Out, Please Delete Folder Session RA-ONE and Scan Again.`);
                process.exit();
            } else if (reason === DisconnectReason.restartRequired) {
                console.log("Restart Required, Restarting...");
                startZeroTwo();
            } else if (reason === DisconnectReason.timedOut) {
                console.log("Connection TimedOut, Reconnecting...");
                startZeroTwo();
            } else {
                console.log(`Unknown DisconnectReason: ${reason}|${connection}`);
                startZeroTwo();
            }
        } else if (connection === "open") {
            await delay(20000);
            loadCommands();
            client.state = 'open';
            client.log('Connected to WhatsApp', 'green');
            client.log('Total Mods: ' + client.mods.length);
            client.ev.on('messages.upsert', async (messages) => await MessageHandler(messages, client));
            client.ev.on('group-participants.update', async (event) => await EventsHandler(event, client));
            client.ev.on('contacts.update', async (update) => await contact.saveContacts(update, client));
 
        }
    });

    client.ev.on("creds.update", saveCreds);
    client.decodeJid = (jid) => {
        if (!jid) return jid;
        if (/:\d+@/gi.test(jid)) {
          let decode = jidDecode(jid) || {};
          return (decode.user && decode.server && decode.user + "@" + decode.server) || jid;
        } else return jid;
      };

      await CardHandler(client);
      await PokeHandler(client); 
    return client;
}

startZeroTwo();
if (!process.env.URL) return console.error('You have not provided any MongoDB URL!!')
app.get('/', (req, res) => {
    res.status(200).setHeader('Content-Type', 'image/png').send(QR_GENERATE);
});
driver
    .connect()
    .then(() => {
        console.log('Connected to the database!');
        // Starts the script if gets a success in connecting with Database
     //   start();
    // startZeroTwo();
    })
    .catch((err) => console.error(err));

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


 
