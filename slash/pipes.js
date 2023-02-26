const { SlashCommandBuilder, EmbedBuilder } = require("@discordjs/builders")
const { ReactionUserManager} = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pipes")
		.setDescription("music to your ears :)"),
	run: async ({ client, interaction }) => {
		if (!interaction.member.voice.channel)
            return interaction.editReply("You need to be in a VC to use this command")

		const queue = await client.player.createQueue(interaction.guild)
		if (!queue.connection) await queue.connect(interaction.member.voice.channel)

		let embed = new EmbedBuilder()
        let url = "https://www.youtube.com/watch?v=_O7NYn_7WLc"
            const result = await client.player.search(url, {
                requestedBy: interaction.user,
                searchEngine: QueryType.YOUTUBE_VIDEO
            })
            
            const song = result.tracks[0]
            await queue.addTrack(song)
            embed
                .setDescription(`**[${song.title}](${song.url})** has been added to the Queue`)
                // .setThumbnail(song.thumbnail)
                .setFooter({ text: `Duration: ${song.duration}`})
		
        if (!queue.playing) await queue.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}