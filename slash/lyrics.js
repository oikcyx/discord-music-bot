const { SlashCommandBuilder } = require('@discordjs/builders');
const { lyricsExtractor } =  require('@discord-player/extractor');
const { EmbedBuilder } = require("discord.js")
const lyricsFinder = lyricsExtractor()

module.exports = {
	data: new SlashCommandBuilder()
	.setName("lyrics")
	.setDescription("Get the lyrics of song")
	.addStringOption((option) =>
		option.setName("searchterms").setDescription("the search keywords").setRequired(true)
	),
	run: async ({ client, interaction }) => {

		const song = interaction.options.getString("searchterms");
        const lyrics = await lyricsFinder.search(song).catch(() => null);
		if (!lyrics) return interaction.followUp({ content: 'No lyrics found', ephemeral: true });

		const trimmedLyrics = lyrics.lyrics.substring(0, 1997);

		const embed = new EmbedBuilder()
    		.setTitle(lyrics.title)
			.setURL(lyrics.url)
			.setThumbnail(lyrics.thumbnail)
			.setAuthor({
				name: lyrics.artist.name,
				iconURL: lyrics.artist.image,
				url: lyrics.artist.url
			})
			.setDescription(trimmedLyrics.length === 1997 ? `${trimmedLyrics}...` : trimmedLyrics)

		await interaction.editReply({
			embeds: [embed]
		})
	},
}
