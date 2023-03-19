const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play a song") // listen to music by Youtube
		.addSubcommand((subcommand) =>
			subcommand
				.setName("song")
				.setDescription("Play song") // loading a song
				.addStringOption((option) => option.setName("url").setDescription("With YT url").setRequired(true)) // the url of the song is:
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("playlist")
				.setDescription("Play playlist") // loading a song from the playlist
				.addStringOption((option) => option.setName("url").setDescription("With YT playlist URL").setRequired(true)) // the url of the playlist is:
		)
		.addSubcommand((subcommand) =>
			subcommand
				.setName("search")
				.setDescription("Search for song") // Search a song by typing song name
				.addStringOption((option) =>
					option.setName("searchterms").setDescription("the search keywords").setRequired(true)
				)
		),
	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) return interaction.editReply("Join a call first") // Please enter to a voicechat

		const queue = await client.player.nodes.create(interaction.guild,{
               metadata: {
                guild: interaction.guild,
                channel: interaction.channel,
                client: interaction.guild.members.me,
                requestedBy: interaction.user,
               },
               selfDeaf: true,
               volume: 80,
               leaveOnEmpty: true,
               leaveOnEmptyCooldown: 300000,
               leaveOnEnd: true,
               leaveOnEndCooldown: 300000,
            });
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)
        // if(!queue.connection) await client.player.play(interaction.member.voice.channel, songToPlay)
        

		let embed = new EmbedBuilder()

		if (interaction.options.getSubcommand() === "song") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("No results") //No result
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the queue`) // have been added to queue
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})

		} else if (interaction.options.getSubcommand() === "playlist") {
            let url = interaction.options.getString("url")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.editReply("no results") //No result
            
            const playlist = result.playlist
            await queue.addTrack(result.tracks)
            embed
                .setDescription(`**${result.tracks.length} tracks from [${playlist.title}](${playlist.url})** has been added to the queue`) // have been added to queue
                .setThumbnail(playlist.thumbnail)
		} else if (interaction.options.getSubcommand() === "search") {
            let url = interaction.options.getString("searchterms")
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.AUTO
            })

            if (result.tracks.length === 0)
                return interaction.editReply("No results") //No result
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the queue`) // have been added to queue
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		}
        if (!queue.node.isPlaying) await queue.node.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}