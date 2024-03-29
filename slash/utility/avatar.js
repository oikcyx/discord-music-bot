const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	cooldown: 5,
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar.')
		.addUserOption(option => option.setName('target').setDescription('The user\'s avatar to show')),
	run: async ({interaction }) => {
		const user = interaction.options.getUser('target');
		if (user) return interaction.editReply(`${user.username}'s avatar: ${user.displayAvatarURL()}`);
		return interaction.editReply(`Your avatar: ${interaction.user.displayAvatarURL()}`);
	},
};