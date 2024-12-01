import {
  ActionRowBuilder,
  CommandInteraction,
  ModalBuilder,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("commit")
  .setDescription("Create a commitment")
  .addUserOption((option) =>
    option
      .setName("payee")
      .setDescription("The user who will receive the payment (optional)")
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  const payee = interaction.options.get("payee");

  const modal = new ModalBuilder()
    .setCustomId("commitmentModal")
    .setTitle("Create a Commitment");

  const dueDateInput = new TextInputBuilder()
    .setCustomId("dueDate")
    .setLabel("Due Date (YYYY-MM-DD)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const amountInput = new TextInputBuilder()
    .setCustomId("amount")
    .setLabel("Commitment Amount ($)")
    .setStyle(TextInputStyle.Short)
    .setRequired(true);

  const descriptionInput = new TextInputBuilder()
    .setCustomId("description")
    .setLabel("Description")
    .setStyle(TextInputStyle.Paragraph)
    .setRequired(true);

  const firstActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    dueDateInput
  );
  const secondActionRow =
    new ActionRowBuilder<TextInputBuilder>().addComponents(amountInput);
  const thirdActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents(
    descriptionInput
  );

  modal.addComponents(firstActionRow, secondActionRow, thirdActionRow);

  await interaction.showModal(modal);

  // Store the payee information for use when the modal is submitted
  // You'll need to implement a way to associate this with the modal submission
  // This could be done through a temporary storage mechanism or by including it in the modal's custom ID
}
