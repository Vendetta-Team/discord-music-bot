const Discord = require('discord.js')
const client = new Discord.Client();
const ytdl = require('ytdl-core')
const prefix = "!"
client.music = {};
var music = client.music

client.on('ready', () => {
    client.user.setActivity('Music Test')
    console.log('bot is online')
})

async function play(client, args, message, music) {
    try {
        music[message.guild.id].queue[0].dispatcher = await music[message.guild.id].connection.play(ytdl(music[message.guild.id].queue[0].url, { filter: 'audioonly', volume: music[message.guild.id].volume }));
        message.channel.send(`<@!${music[message.guild.id].queue[0].requester}>님이 신청하신 ${music[message.guild.id].queue[0].title}이 재생됩니다.`)
        music[message.guild.id].queue[0].dispatcher.once('finish', () => {
            end(client, args, message, music)
        })
    } catch (e) {
        message.reply(`곡을 재생하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        console.log(e)
    }
}

async function end(client, args, message, music) {
    try {
        if (music[message.guild.id].queue.length > 0) {
            song = await music[message.guild.id].queue.shift()
            play(client, args, message, music)
        } else {
            message.channel.send('신청곡들을 모두 재생하였습니다.\n뮤직을 종료합니다.')
            music[message.guild.id].queue[0].queue[0].dispatcher.destroy();
        }
    } catch (e) {
        message.reply(`곡을 끝내는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        console.log(e)
    }
}

async function volume(client, vol, message, music) {
    try {
        await music[message.guild.id].queue[0].dispatcher.setVolume(vol)
        message.reply(`곡의 볼륨을 ${vol}로 설정하였습니다.`)
    } catch (e) {
        message.reply(`볼륨을 설정하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        console.log(e)
    }
}

async function pause(client, args, message, music) {
    try {
        await music[message.guild.id].queue[0].dispatcher.pause()
        message.reply('곡을 일시정지 했습니다.')
    } catch (e) {
        message.reply(`곡을 일시정지하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        console.log(e)
    }
}

async function resume(client, args, message, music) {
    try {
        await music[message.guild.id].queue[0].dispatcher.resume()
        message.reply('곡을 재시작 했습니다.')
    } catch (e) {
        message.reply(`곡을 재시작 하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
        console.log(e)
    }
}

client.on('message', async (message) => {
    if (message.author.bot) return; //봇 사용자가 봇일시 무시합니다
    if (message.channel.type === "dm") return;//봇 사용채널이 개인 메세지일시 무시합니다S
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
                message.reply('통화방에 먼저 들어가주세요')
                return;
            }
            if (!args[0]) {
                message.reply('재생할 곡을 함께 언급해주세요')
                return;
            }
            let info = await ytdl.getInfo(args[0]);
            music[message.guild.id].queue.push({
                title: info.title,
                request: message.author.id,
                thumbnail: `https://img.youtube.com/vi/${info.video_id}/maxresdefault.jpg`,
                length: info.length_seconds,
                url: args[0],
                requester: message.author.id
            })

            if (!music[message.guild.id].connection) {
                music[message.guild.id].connection = await message.member.voice.channel.join();
            }
            if (!music[message.guild.id].queue[0].dispatcher) {
                play(client, args, message, music)
            } else {
                message.reply('request succese')
            }
        } catch (e) {
            message.reply(`곡을 신청하는 도중 에러가 발생하였습니다\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.`)
            console.log(e)
        }
    }
    if (command == 'volume') {
        try {
            if (!message.guild.me.voice.channel) {
                message.reply('뮤직기능을 먼저 사용해주세요')
            }
            if (!args[0]) {
                message.reply(`현재 볼륨 : ${music[message.guild.id].volume}`)
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
            volume(client, args[0], message, music)
        } catch (e) {
            message.reply('볼륨을 지정하는 도중 에러가 발생하였습니다.\nhttps://vendetta-team.glitch.me/ 에 문의해주세요.')
            console.log(e)
        }
    }
    if (command === "cmd") {
        if (message.author.id !== '589525017352601621' && message.author.id !== '490829962769727498') return;
        try {
            let codein = args.join(" ");
            let code = eval(codein);
            if (typeof code !== 'string')
                code = require('util').inspect(code, { depth: 0 });
            let embed = new Discord.MessageEmbed()
                .setAuthor('이블')
                .setColor('RANDOM')
                .addField(':inbox_tray: 코드', `\`\`\`js\n${codein}\`\`\``)
                .addField(':outbox_tray: 출력', `\`\`\`js\n${code}\n\`\`\``)
            message.channel.send(embed)
        } catch (e) {
            message.channel.send(`\`\`\`js\n${e}\n\`\`\``);
        }
    }
    if (command == 'pause') {
        pause(client, args, message, music)
    }
    if (command == 'resume') {
        resume(client, args, message, music)
    }
})

client.login('Token')
