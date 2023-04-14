const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("play")
		.setDescription("play a song")
        .addSubcommand((subcommand) =>
			subcommand
				.setName("song")
				.setDescription("Play song") 
				.addStringOption((option) => option.setName("url").setDescription("YT url").setRequired(true)) 
		)
        .addSubcommand((subcommand) =>
			subcommand
				.setName("playlist")
				.setDescription("Play playlist") 
				.addStringOption((option) => option.setName("url").setDescription("YT playlist URL").setRequired(true)) 
		),

	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel) return interaction.editReply("Join a call first")

		const queue = await client.player.nodes.create(interaction.guild,{
               metadata: {
                    guild: interaction.guild,
                    channel: interaction.channel,
                    client: interaction.guild.members.me,
                    requestedBy: interaction.user,
               },
               selfDeaf: true,
               volume: 100,
               leaveOnEmpty: false,
               leaveOnEmptyCooldown: 300,
               leaveOnEnd: true,
               leaveOnEndCooldown: 300,
            });
		
		let embed = new EmbedBuilder()

        let url = interaction.options.getString("url")
        
        if (interaction.options.getSubcommand() === "playlist") {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_PLAYLIST
            })

            if (result.tracks.length === 0)
                return interaction.editReply("no results") 
            
            const playlist = result.playlist

            if(!queue.connection){
                await client.player.play(interaction.member.voice.channel, result.tracks[0])
                for(let i = 1; i < result.tracks.length; i++ ){
                    queue.addTrack(result.tracks[i]);
                }
            }else {
                for(let i = 0; i < result.tracks.length; i++ ){
                    queue.addTrack(result.tracks[i]);
                }
            }

            embed
                .setDescription(`**${result.tracks.length} tracks from [${playlist.title}](${playlist.url})** has been added to the queue`) 
                // .setThumbnail(playlist.thumbnail)

        } else {
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            if (result.tracks.length === 0)
                return interaction.editReply("No results") 
            
            const song = result.tracks[0]
            
            if(!queue.connection){
                await client.player.play(interaction.member.voice.channel, song)
            }else {
                queue.addTrack(song);
            }
    
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the queue`) 
                .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
        }
        if (!queue.node.isPlaying) await queue.node.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}