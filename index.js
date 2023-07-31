const Discord = require("discord.js");
require("dotenv").config();
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const fs = require("fs");
const { Player } = require("discord-player");
const { Client } = require('discord.js');
const { ApplicationCommandOptionType } = require("discord.js");

const TOKEN = process.env.TOKEN
const CLIENT_ID = process.env.clientId

const client = new Client({
    intents: [
        "Guilds",
        "GuildVoiceStates",
        "GuildMessages",
        "MessageContent",
        "GuildMembers"
    ]
})
client.slashcommands = new Discord.Collection()

client.slashcommands.clear() // Clear the collection before loading commands

client.player = new Player(client, {
    ytdlOptions: {
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
})

const slashFolders = fs.readdirSync("./slash").filter(folder => !folder.includes("."))
for (const folder of slashFolders) {
    const slashFiles = fs.readdirSync(`./slash/${folder}`).filter(file => file.endsWith(".js"))
    for (const file of slashFiles) {
        const slashcmd = require(`./slash/${folder}/${file}`)
        client.slashcommands.set(slashcmd.data.name, slashcmd)
    }
}

const rest = new REST({ version: "9" }).setToken(TOKEN)
console.log("Deploying slash commands")
rest.put(Routes.applicationCommands(CLIENT_ID), {body: client.slashcommands.map(cmd => cmd.data.toJSON())})
.then(() => {
    console.log("Successfully loaded")
    client.on("ready", () => {
        console.log(`Logged in as ${client.user.tag}`)
    })
    client.on("interactionCreate", (interaction) => {
        async function handleCommand() {
            if (!interaction.isCommand()) return
            const slashcmd = client.slashcommands.get(interaction.commandName)
            if (!slashcmd) interaction.reply("Not a valid slash command")

            await interaction.deferReply()
            await slashcmd.run({ client, interaction })
        }
        handleCommand()
    })
    client.login(TOKEN)
})
.catch((err) => {
    if (err){
        console.log(err)
        process.exit(1)
    }
})