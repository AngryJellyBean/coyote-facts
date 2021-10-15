import * as cron from "node-cron";
import * as fs from "fs";
import * as path from "path";
import * as YAML from "yaml";

import { Client, Guild, Intents, TextChannel } from "discord.js";

require("dotenv").config();

const WELCOME_MESSAGE =
    "Thanks for signing up for Coyote Facts! You now will receive fun daily facts about COYOTES!";
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

/**
 * Sends a random fact to all registered servers.
 */
const sendFact = (): void => {
    const factsObj = parseFacts();

    let randomFact =
        factsObj[Math.floor(Math.random() * 100) % factsObj.length]["text"];
    client.guilds.cache.forEach((guild) => {
        console.log(`${guild.name} | ${guild.id}`);

        const generalChannel: TextChannel = guild.channels.cache.find(
            (channel) => channel.name == "general"
        ) as TextChannel;
        generalChannel.send("> " + randomFact);
    });
};

const parseFacts = (): any => {
    const factsFileText = fs.readFileSync(
        path.join(__dirname, "..", "data", "facts.yaml"),
        {
            encoding: "utf-8",
        }
    );

    return YAML.parse(factsFileText)["facts"];
};

/**
 * Responsible for registering all client event callbacks.
 */
const registerClientEvents = (): void => {
    client.on("ready", (client: Client) => {
        console.log(`Logged in as: ${client?.user?.tag}`);
    });

    client.on("guildCreate", (guild: Guild) => {
        console.log("Added to server: " + guild.name);

        const generalChannel: TextChannel = guild.channels.cache.find(
            (channel) => channel.name == "general"
        ) as TextChannel;
        generalChannel.send(WELCOME_MESSAGE);
    });

    client.on("guildDelete", (guild: Guild) => {
        console.log("Removed from server: " + guild.name);
    });
};

const main = (): void => {
    registerClientEvents();
    client.login(process.env.CLIENT_TOKEN);

    cron.schedule("1 0 * * *", sendFact, { timezone: "America/New_York" });
};

main();
