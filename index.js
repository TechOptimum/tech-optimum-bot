const Discord = require('discord.js');
const config = require('./config.json')
const client = new Discord.Client();
const cron = require("node-cron");
const prefix = '.';
const fs = require('fs');
const snippetsFilePath = './snippets.json';
const express = require('express')
const app = express()
const port = 3000

// Define an empty object to hold the snippets
let snippets = {};


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
  if (message.content.startsWith("-requestfeature")) {
    message.channel.send("What feature would you like to request? Please be specific, at least 2 sentences.");
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
                  .setTitle("Feature Request")
                  .addField("Feature:", feature)
                  .addField("Priority:", priority)
                  .addField("Difficulty:", difficulty)
                  .setTimestamp()
                  .setFooter(`Feature suggested by ${message.author.username}`, message.author.displayAvatarURL());
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

// new COMMAND, snippets
if (fs.existsSync('./snippets.json')) {
  snippets = JSON.parse(fs.readFileSync('./snippets.json'));
}

client.on('message', message => {
  if (message.content.startsWith(prefix)) {
    const args = message.content.slice(prefix.length).trim().match(/\[.+?]/g).map(arg => arg.slice(1, -1));
    const command = args.shift().toLowerCase();

    if (command === 'snippet-create') {
      const content = args.shift();
      const name = args.shift();

      if (content && name) {
        const variables = content.match(/{\w+}/g) || [];

        snippets[name] = { content, variables };

        fs.writeFileSync('./snippets.json', JSON.stringify(snippets, null, 2));

        message.channel.send(`Snippet "${name}" created.`);
      } else {
        message.channel.send('Invalid arguments. Usage: .snippet-create [content] [name]');
      }
    } else {
      const snippet = snippets[command];
      if (snippet) {
        let response = snippet.content;

        snippet.variables.forEach(variable => {
          const varName = variable.slice(1, -1);
          const arg = args.shift() || '';
          response = response.replace(variable, arg);
        });

        message.channel.send(response);
      }
    }
  }
});



client.on('message', message => {
  if (message.content === '-help') {
    const embed = new Discord.MessageEmbed()
      .setTitle("Help Menu")
      .setDescription("Here are the available commands:")
      .addField("`-requestfeature`", "Request a new feature or suggest an improvement for Tech Optimum.")
      .addField("`-staff`", "View the list of all staff members.")
      .setColor("#7289DA")
      .setFooter(`Requested by ${message.author.username}`, message.author.displayAvatarURL());
    message.channel.send(embed);
  }
});




// new code




client.login(process.env.TOKEN)
