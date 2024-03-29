const { SlashCommandBuilder } = require("@discordjs/builders")
const { EmbedBuilder } = require("discord.js")
const { QueryType } = require("discord-player")

module.exports = {
	data: new SlashCommandBuilder()
		.setName("search")
		.setDescription("search for songs using keywords")
		.addStringOption((option) =>
					option.setName("searchterms").setDescription("the search keywords").setRequired(true)
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
               volume: 80,
               leaveOnEmpty: true,
               leaveOnEmptyCooldown: 300000,
               leaveOnEnd: true,
               leaveOnEndCooldown: 300000,
            });
		let embed = new EmbedBuilder()

        let url = interaction.options.getString("searchterms")
        const result = await client.player.search(url, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
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
		
        if (!queue.node.isPlaying) await queue.node.play()
        await interaction.editReply({
            embeds: [embed]
        })
	},
}