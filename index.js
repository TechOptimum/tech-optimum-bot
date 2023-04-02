const Discord = require('discord.js');
const client = new Discord.Client();
const cron = require("node-cron");
const prefix = '.';
const fs = require('fs');
const snippetsFilePath = './snippets.json';
const express = require('express')
const app = express()
const port = 3000
const { MessageButton, MessageActionRow } = require("discord-buttons");


const executiveRoleID = '980269921982349372';

const departments = [
  { name: 'HR', categoryId: '1062188743664078978' },
  { name: 'Marketing & Design', categoryId: '980266883339153428' },
  { name: 'Education', categoryId: '1008138129913413663' },
  { name: 'Development & Tech', categoryId: '961852518630047785' },
  { name: "Hackathon", categoryId: "980268143031246878"},
  { name: "Community", categoryId: "982348540846174220"},
  { name: "Executives", categoryId: "998782484676350032"},
  
];

const logChannelId = "1091976378372591726";

require("discord-buttons")(client);

app.get('/', (req, res) => {
  res.send('the bot is online')
})

app.listen(port, () => {
  console.log(`Tech Optimum bot app listening on port ${port}`)
})

client.once('ready', () => {
  console.log(`Ready`)
  client.user.setPresence({
    status: "online",
    activity: {
      name: "with code",
      type: "PLAYING"
    }
  });
});

client.on('guildMemberAdd', member => {
  const channel = member.guild.channels.cache.find(ch => ch.name === 'joins');
  if (!channel) return;
  const embed = new Discord.MessageEmbed()
    .setAuthor(member.user.username, member.user.displayAvatarURL(), member.user.displayAvatarURL())
    .setDescription(`**${member.user.username}** has joined our staff team.`)
    .setColor('#7289DA')
  channel.send(embed);
});

// new command (-resources 
client.on("message", (message) => {
  if (message.content === "-resources") {
    const embed = new Discord.MessageEmbed()
      .setTitle("Tech Optimum Staff Resources")
       .setDescription("[Staff Handbook](https://techoptimum.notion.site/Staff-Handbook-afb659f99c614c1baad74adc18bf2def) \n [Volunteer Benefits](https://techoptimum.notion.site/Volunteer-Benefits-at-Tech-Optimum-18b3263dda344832a8df1687df92a8f4)" )

      .setColor("#0099ff")
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL());

  

    message.channel.send(embed);
  }
});

//server info command
client.on("message", (message) => {
  if (message.content === "-serverinfo") {
    const embed = new Discord.MessageEmbed()
      .setTitle('Server Information')
      .setColor('#7289DA')
      .setDescription(
        `

        This server is a staff server for all the different departments of tech optimum. In this server, we have staff members from the Web Development, Graphic Design, Hackathon, HR, Discord Bot Development and Discord Moderation teams. 
        
        **Main Channels**
        > <#961850793202450435> - Used for communication within all departments. 
        > <#1010003919776264313> - Used for voice communication within all departments.
        
        If you have any questions, please feel free to reach out to anyone on the <@&980269921982349372>
        
      [**Staff Info**](https://techoptimum.notion.site/Staff-Handbook-afb659f99c614c1baad74adc18bf2def)
       [**Volunteer Hours Form**](https://forms.gle/P3R9RqvncZsT3tYv6)    
        [**Our Community Server**](https://discord.gg/HpRfm7kp3U)`
      );

   
   

  

    message.channel.send(embed);
  }
})

// new command (-members)
client.on('message', message => {
  if (message.content === '-staff') {
    let roles = message.guild.roles.cache.sort((a, b) => b.position - a.position);
    let totalMembers = message.guild.memberCount;
    let embed = new Discord.MessageEmbed()
      .setAuthor(`We have ${totalMembers} staff members in Tech Optimum.`)
    roles.forEach(role => {
      if (role.name === "@everyone" || role.name === "Ticket Tool" || role.name === "carl-bot" || role.name === "Tech Optimum Test Bot" || role.name === "Staff Member" || role.name === "Admin") return;
      let membersWithRole = message.guild.members.cache.filter(member => member.roles.cache.has(role.id));
      let memberList = membersWithRole.map(member => `<@${member.id}>`).join(', ');
      if (memberList) {
        embed.addField(role.name, memberList)
        embed.setFooter(`${message.author.username}`, message.author.displayAvatarURL());
      }
    });
    message.channel.send({ embed });
  }
});


// new command, (requesting features)
client.on("message", message => {
  if (message.content.startsWith("-suggest")) {
    message.channel.send("What would you like to suggest? Please be specific, at least 2 sentences.");
    const filter1 = m => m.author.id === message.author.id;
    message.channel.awaitMessages(filter1, { max: 1, time: 60000, errors: ["time"] })
      .then(collected1 => {
        const feature = collected1.first().content;
        message.channel.send("What is the priority of this request? (Low, Medium, High)");
        const filter2 = m => m.author.id === message.author.id;
        message.channel.awaitMessages(filter2, { max: 1, time: 60000, errors: ["time"] })
          .then(collected2 => {
            const priority = collected2.first().content;
            message.channel.send("How difficult is this request? (Easy, Medium, or Hard)");
            const filter3 = m => m.author.id === message.author.id;
            message.channel.awaitMessages(filter3, { max: 1, time: 60000, errors: ["time"] })
              .then(collected3 => {
                const difficulty = collected3.first().content;
                message.channel.send("Requested sent to <#1084366838328217650> to be voted on.");
                const requestEmbed = new Discord.MessageEmbed()
                  .setTitle("New Suggestion")
                  .addField("Suggestion:", feature)
                  .addField("Priority:", priority)
                  .addField("Difficulty:", difficulty)
                  .setTimestamp()
                  .setFooter(`Suggested by ${message.author.username}`, message.author.displayAvatarURL());
                const requestChannel = client.channels.cache.get("1084366838328217650");
                requestChannel.send(requestEmbed)
                  .then(sentMessage => {
                    sentMessage.react("👍");
                    sentMessage.react("👎");
                  });
              })
              .catch(collected3 => {
                message.channel.send("You did not provide any input. Please try again.");
              });
          })
          .catch(collected2 => {
            message.channel.send("You did not provide any input. Please try again.");
          });
      })
      .catch(collected1 => {
        message.channel.send("You did not provide any input. Please try again.");
      });
  }
});




client.on('message', message => {
  if (message.content === '-help') {
    const embed = new Discord.MessageEmbed()
      .setTitle("Help Menu")
      .setDescription("Here are the available commands:")
      .addField("`-suggest`", "Suggest an improvement for Tech Optimum.")
      .addField("`-staff`", "View the list of all staff members.")
      .setColor("#7289DA")
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL());
    message.channel.send(embed);
  }
});



client.on("message", async (message) => {
  if (message.content === "-ticket") {
    const rows = [
      new MessageActionRow(),
      new MessageActionRow(),
    ];

    departments.forEach((department, index) => {
      const button = new MessageButton()
        .setLabel(department.name)
        .setStyle("green")
        .setID(`create_ticket_${department.name.toLowerCase()}`);

      // If there are more than 5 departments, put the remaining buttons in the second row
      if (index < 4) {
        rows[0].addComponent(button);
      } else {
        rows[1].addComponent(button);
      }
    });

    const embed = new Discord.MessageEmbed()
      .setTitle("Private Discussions")
      .setDescription(
        `Hello! Welcome to **Private Discussions**. This is a place where you can discuss staff-related things within Tech Optimum. Please choose the appropriate department you would like to create a discussion in.`
      )
      .setFooter("Please do not create more than 1 discussion at a time.")
      .setColor("#7289DA");

    await message.channel.send(embed, {
      components: rows,
    });
  }
});


client.on('clickButton', async (button) => {
  const department = departments.find((department) =>
    button.id.startsWith(`create_ticket_${department.name.toLowerCase()}`)
  );

  if (department) {
    const guild = button.guild;
    const member = button.clicker.member;
    const ticketName = `ticket-${department.name}-${member.user.username}`;

    if (guild.channels.cache.find((channel) => channel.name === ticketName)) {
      return button.reply.send('You already have an open ticket!', true);
    }

    guild.channels
      .create(ticketName, {
        type: 'text',
        parent: department.categoryId,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: ['VIEW_CHANNEL'],
          },
          {
            id: member.id,
            allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
          },
        ],
      })
      .then(async (channel) => {
        const closeTicketButton = new MessageButton()
          .setLabel('Close Ticket')
          .setStyle('red')
          .setID('close_ticket');

        const row = new MessageActionRow().addComponent(closeTicketButton);

        await channel.send(
          `||@everyone|| \n\nWelcome, **${member}** to your private discussion! \n  > The executives and directors of the **${department.name} Department** can now privately chat here with you for the  department here. `,
          { components: [row] }
        );
      });

    button.reply.send('Your ticket has been created!', true);
  } else if (button.id === 'close_ticket') {
    const channel = button.channel;

    // Save a transcript of the ticket
    const transcriptChannel = button.guild.channels.cache.get(logChannelId);
    let transcript = `**Transcript for ${channel.name}**\n\n`;

    const fetchedMessages = await channel.messages.fetch({ limit: 100 });
    fetchedMessages.forEach((message) => {
      transcript += `${message.author.username}: ${message.content}\n`;
    });

    await transcriptChannel.send(`\`\`\`${transcript}\`\`\``);

    // Close the ticket
    channel.delete();
  }
});







client.login(process.env.TOKEN)
