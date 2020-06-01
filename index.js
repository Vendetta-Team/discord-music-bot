const Discord = require('discord.js')
const client = new Discord.Client();
const ytdl = require('ytdl-core')
const ytsearch = require('yt-search')
const prefix = "!"
client.music = {};
var music = client.music

client.on('ready', () => {
    client.user.setActivity('Music Test')
    console.log('bot is online')
})

async function addqueue(client, args, message, music) {
    console.log(args)
    let video = await ytdl.validateURL(args[0]);
    if (!video) {
        return search(client, args, message, music)
    }

    let info = await ytdl.getInfo(args[0]);

    if (!music[message.guild.id].connection) {
        music[message.guild.id].connection = await message.member.voice.channel.join();
    } else {
        if (message.member.voice.channel != message.guild.me.voice.channel) {
            message.reply('Please use it in the same channel as the bot')
            return;
        }
    }
    music[message.guild.id].queue.push({
        title: info.title,
        request: message.author.id,
        thumbnail: `https://img.youtube.com/vi/${info.video_id}/maxresdefault.jpg`,
        length: info.length_seconds,
        url: args[0],
        requester: message.author.id
    })


    if (!music[message.guild.id].queue[0].dispatcher) {
        play(client, args, message, music)
    } else {
        message.reply('request succese')
    }
}

async function play(client, args, message, music) {
    try {
        console.log(music[message.guild.id].queue[0].url)
        console.log(typeof music[message.guild.id].queue[0].url)
        console.log('get playing')
        music[message.guild.id].queue[0].dispatcher = await music[message.guild.id].connection.play(ytdl(music[message.guild.id].queue[0].url, { filter: 'audioonly' }))
        await music[message.guild.id].queue[0].dispatcher.setVolume(music[message.guild.id].volume / 100)
        message.channel.send(`now playing ${music[message.guild.id].queue[0].title}\nrequester : <@!${music[message.guild.id].queue[0].requester}>`)
        music[message.guild.id].queue[0].dispatcher.once('finish', () => {
            end(client, args, message, music)
        })
    } catch (e) {
        message.reply(`An error occurred while playing a song\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

async function search(client, args, message, music) {
    const msg = await message.channel.send(`Searching for ${args.join(" ")}`);
    ytsearch(args.join(" "), async (err, res) => {
        msg.delete();
        let videos = res.videos.slice(0, 10);
        let resp = '';
        for (var i in videos) {
            resp += `**[${parseInt(i) + 1}]:** ${videos[i].title}\n`;
        }
        resp += `\n<@${message.author.id}> **\n\`1~${videos.length}\`**\nChoose the number you want`
        const infomsg = await message.channel.send(`🔎 \`\`Search result of ${args.join(" ")}\`\`\n${resp}`);
        const filter = (m) => {
            if (m.author.id === message.author.id) {
                if (m.content.startsWith("c") || m.content.startsWith("!play")) {
                    return true;
                } else if (!isNaN(m.content) && m.content < videos.length + 1 && m.content > 0 && m.author.id == message.author.id) {
                    return true;
                }
            }
        }
        const collector = message.channel.createMessageCollector(filter);
        collector.videos = videos;
        collector.once('collect', function (m) {
            infomsg.delete();
            if (m.content.startsWith("!play")) {
                message.reply("Cancelled")
                return
            }
            if (m.content.startsWith("c")) {
                message.reply("Cancelled")
                return
            }
            if (m.content.startsWith("C")) {
                message.reply("Cancelled")
                return
            }
            console.log([this.videos[parseInt(m.content) - 1].url])
            addqueue(client, [this.videos[parseInt(m.content) - 1].url], message, music)
        });
    });
}

async function end(client, args, message, music, lang) {
    try {
        if (music[message.guild.id].queue.length > 1) {
            song = await music[message.guild.id].queue.shift()
            play(client, args, message, music, lang)
        } else {
            message.channel.send('All the requested songs have been played.\nMusic ends.')
            music[message.guild.id].queue[0].dispatcher.destroy();
            music[message.guild.id].queue = []
            music[message.guild.id].connection = null
            message.guild.me.voice.channel.leave();
        }
    } catch (e) {
        message.reply(`An error occurred while ending the song\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

async function volume(client, vol, message, music) {
    try {
        await music[message.guild.id].queue[0].dispatcher.setVolume(vol / 100)
        music[message.guild.id].volume = vol
        message.reply(`volume is now set ${vol}`)
    } catch (e) {
        message.reply(`An error occurred while setting the volume\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

async function skip(client, args, message, music, lang) {
    try {
        await music[message.guild.id].queue[0].dispatcher.end();
        message.reply('The song was successfully skipped.')
    } catch (e) {
        message.reply(`An error occurred while skiping the song.\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

async function pause(client, args, message, music, lang) {
    try {
        await music[message.guild.id].queue[0].dispatcher.pause()
        message.reply('The song has been paused.')
    } catch (e) {
        message.reply(`An error occurred while pausing the song\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

async function resume(client, args, message, music, lang) {
    try {
        await music[message.guild.id].queue[0].dispatcher.resume()
        message.reply('The song has been restarted.')
    } catch (e) {
        message.reply(`An error occurred while restarting the song\nhttps://vendetta-team.glitch.me/ Please contact us.`)
        console.log(e)
    }
}

client.on('message', async (message) => {
    if (message.author.bot) return;
    if (message.channel.type === "dm") return;
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == 'play') {
        try {
            if (!music[message.guild.id]) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 25,
                    queue: [],
                    connection: null
                }
            }
            if (!message.member.voice.channel) {
                message.reply('Please enter the voice channel first')
                return;
            }
            if (!args[0]) {
                message.reply('Please mention the song you want to play')
                return;
            }
            addqueue(client, args, message, music, lang)
        } catch (e) {
            message.reply(`An error occurred while requesting a song\nhttps://vendetta-team.glitch.me/ Please contact us.`)
            console.log(e)
        }
    }
    if (command == 'volume') {
        try {
            if (!music[message.guild.id]) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 25,
                    queue: [],
                    connection: null
                }
            }
            if (message.member.voice.channel != message.guild.me.voice.channel) {
                message.reply('Please use it in the same channel as the bot')
                return;
            }
            if (!args[0]) {
                message.reply(`Volume : ${music[message.guild.id].volume}`)
                return;
            }
            if (isNaN(args[0])) {
                message.reply('Please write the right volume.')
                return;
            }
            if(args[0] == music[message.guild.id].volume){
                message.reply(`Volume is already ${args[0]}`)
                return;
            }
            if (args[0] > 150) {
                message.reply('Volume cannot be greater than 150.')
                return;
            }
            if (args[0] < 0) {
                message.reply('Volume cannot be less than 0.')
                return;
            }
            volume(client, args[0], message, music, lang)
        } catch (e) {
            message.reply('An error occurred while specifying the volume.\nhttps://vendetta-team.glitch.me/ Please contact us.')
            console.log(e)
        }
    }
    if (command == 'pause') {
        try {
            if (!music[message.guild.id]) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 25,
                    queue: [],
                    connection: null
                }
            }
            if (message.member.voice.channel != message.guild.me.voice.channel) {
                message.reply('Please use it in the same channel as the bot')
                return;
            }
            if (music[message.guild.id].queue[0]) {
                pause(client, args, message, music, lang)
            } else {
                message.reply('There is no song to pause.')
            }
        } catch (e) {
            message.reply('An error occurred while requesting pause.\nhttps://vendetta-team.glitch.me/ Please contact us.')
            console.log(e)
        }
    }
    if (command == 'resume') {
        try {
            if (!music[message.guild.id]) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 25,
                    queue: [],
                    connection: null
                }
            }
            if (message.member.voice.channel != message.guild.me.voice.channel) {
                message.reply('Please use it in the same channel as the bot')
                return;
            }
            if (music[message.guild.id].queue[0]) {
                resume(client, args, message, music, lang)
            } else {
                message.reply('There are no songs to resume.')
            }
        } catch (e) {
            message.reply('An error occurred while requesting resume.\nhttps://vendetta-team.glitch.me/ Please contact us.')
            console.log(e)
        }
    }
    if (command == 'skip') {
        try {
            if (!music[message.guild.id]) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 25,
                    queue: [],
                    connection: null
                }
            }
            if (message.member.voice.channel != message.guild.me.voice.channel) {
                message.reply('Please use it in the same channel as the bot')
                return;
            }
            if (music[message.guild.id].queue[0]) {
                skip(client, args, message, music, lang)
            } else {
                message.reply('There are no songs')
            }
        } catch (e) {
            message.reply('An error occurred while requesting a skip.\nhttps://vendetta-team.glitch.me/ Please contact us.')
            console.log(e)
        }
    }
})

client.login('토큰')
