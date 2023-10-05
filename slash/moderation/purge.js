const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('pruge')
		.setDescription('Prune up to 99 messages.')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('Number of messages to prune')
				.setMinValue(1)
				.setMaxValue(100)),
	run: async ({ client, interaction }) =>  {
		const amount = interaction.options.getInteger('amount');

		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			interaction.editReply({ content: 'There was an error trying to prune messages in this channel!', ephemeral: true });
		});

		return interaction.editReply({ content: `Successfully pruned \`${amount}\` messages.`, ephemeral: true });
	},
};