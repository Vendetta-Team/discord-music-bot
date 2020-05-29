const Discord = require('discord.js')
const client = new Discord.Client();
const ytdl = require('ytdl-core')
const prefix = "!"
client.music = {};
music = client.music

client.on('ready', () => {
    console.log('bot is online')
})

async function play(client, args, music) {
    try {
        music.queue.dispatcher = await connection.play(ytdl(music[message.guild.id].queue[0].url, { filter: 'audioonly', volume: music[message.guild.id].volume }));
        message.channel.send(`<@!${music[message.guild.id].queue[0].requester}>님이 신청하신 ${music.queue[0].title}이 재생됩니다.`)
        music.dispatcher.once('finish', () => {
            end(client, args, music)
        })
    } catch (e) {
        message.reply(`곡을 일시정지하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
    }
}

async function end(client, args, music) {
    try {
        if (music[message.guild.id].queue.length > 0) {
            song = await music[message.guild.id].queue.shift()
            play(client, args, music)
        } else {
            message.channel.send('신청곡들을 모두 재생하였습니다.\n뮤직을 종료합니다.')
            music[message.guild.id].dispatcher.destroy();
        }
    } catch (e) {
        message.reply(`곡을 일시정지하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
    }
}

async function volume(client, vol, music) {
    try {
        await music.queue.dispatcher.setVolume(vol)
        message.reply(`곡의 볼륨을 ${vol}로 설정하였습니다.`)
    } catch (e) {
        message.reply(`곡을 일시정지하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
    }
}

async function pause(client, args, music) {
    try {
        await music.queue.dispatcher.pause()
        message.reply('곡을 일시정지 했습니다.')
    } catch (e) {
        message.reply(`곡을 일시정지하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
    }
}

async function resume(client, args, music) {
    try {
        await music.queue.dispatcher.resume()
        message.reply('곡을 재시작 했습니다.')
    } catch (e) {
        message.reply(`곡을 재시작 하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
    }
}

client.on('message', (message) => {
    if (message.author.bot) return; //봇 사용자가 봇일시 무시합니다
    if (message.channel.type === "dm") return;//봇 사용채널이 개인 메세지일시 무시합니다S
    if (message.content.indexOf(prefix) !== 0) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();

    if (command == 'play') {
        try {
            if (!music) {
                music[message.guild.id] = {
                    guild: message.guild.id,
                    channel: message.channel.id,
                    volume: 0.5,
                    queue: {}
                }
            }
            if (!args[0]) {
                message.reply('재생할 곡을 함께 언급해주세요')
                return;
            }
            let info = await ytdl.getInfo(args[0]);
            music.queue.push({
                title: info.title,
                request: message.author.id,
                thumbnail: `https://img.youtube.com/vi/${info.video_id}/maxresdefault.jpg`,
                length: info.length_seconds,
                url: args[0],
                requester: message.author.id
            })
            if (!music.queue.dispatcher) {
                play(client, args, music)
            } else {
                message.reply('request succese')
            }
        } catch (e) {
            message.reply(`곡을 신청하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        }
    }
    if (command == 'volume') {
        try {
            if (!args[0]) {
                message.reply('볼륨을 함께 적어주세요')
            }
            if (isNaN(args[0])) {
                message.reply('알맞은 볼륨을 적어주세요.')
                return;
            }
            if (args[0] > 150) {
                message.reply('볼륨은 150 보다 클 수 없습니다.')
                return;
            }
            if (args[0] < 0) {
                message.reply('볼륨은 0보다 작을 수 없습니다.')
                return;
            }
            volume(client, vol, music)
        } catch (e) {
            message.reply('볼륨을 지정하는 도중 에러가 발생하였습니다.\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.')
        }
    }
    if (command == 'pause') {
        pause(client, args, music)
    }
    if (command == 'resume') {
        resume(client, args, music)
    }
})

client.login('토큰')
