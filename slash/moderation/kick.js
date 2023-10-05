const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Select a member and kick them (but not really).')
		.addUserOption(option => option.setName('target').setDescription('The member to kick').setRequired(true)),
	run: async ({ client, interaction }) => {
		const member = interaction.options.getMember('target');
		return interaction.editReply({ content: `You wanted to kick: ${member.user.username}`, ephemeral: true });
	},
};