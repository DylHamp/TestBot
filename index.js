const Discord = require('discord.js');
const bot = new Discord.Client();


const cheerio = require('cheerio');
const request = require('request');

//Default times made to help prevent bot from crashing.
const DEFAULT_TIME = "1969-07-4T12:00:00.000Z";
const DEFAULT_ID = "NO_ID";
const DEFAULT_FLAG = "United States";
const BASIC_EMPTY_SIDE = { 
  seedNumber: 1,
  winner: false,
  disqualified: false,
  teamID: DEFAULT_ID,
  readyAt: DEFAULT_TIME,
  challengedAt: DEFAULT_TIME,
  score: 0,
  team: {
    _id: DEFAULT_ID,
    name: 'no_name',
    userID: DEFAULT_ID,
    ownerID: DEFAULT_ID,
    tournamentID: DEFAULT_ID,
    customFields: [Array],
    countryFlag: DEFAULT_FLAG,
    captainID: DEFAULT_TIME,
    playerIDs: [Array],
    createdAt: DEFAULT_TIME,
    updatedAt: DEFAULT_TIME
  }
};



class Bracket {
  constructor()
  {
    this.id = "new bracket";
    this.data = [{
      _id: DEFAULT_ID,
      top: BASIC_EMPTY_SIDE,
      bottom: BASIC_EMPTY_SIDE,
      matchType: 'winner',
      matchNumber: 0,
      roundNumber: 0,
      isBye: false,
      next: {
        winner: {
          position: 'bottom',
          matchID: DEFAULT_ID
        }
      },
      createdAt: DEFAULT_TIME,
      updatedAt: DEFAULT_TIME,
      doubleLoss: false,
      stageID: DEFAULT_ID,
      schedule: {
        startTime: '',
        reschedulingRequested: false
      },
      stats: [
        {
          matchID: DEFAULT_ID,
          gameID: DEFAULT_ID,
          tournamentID: DEFAULT_ID,
          stageID: DEFAULT_ID,
          gameNumber: 1,
          stats: [Object],
          createdAt: DEFAULT_ID,
          _id: DEFAULT_ID
        },
        {
          matchID: DEFAULT_ID,
          gameID: DEFAULT_ID,
          tournamentID: DEFAULT_ID,
          stageID: DEFAULT_ID,
          gameNumber: 2,
          stats: [Object],
          createdAt: DEFAULT_TIME,
          _id: DEFAULT_ID
        }
      ],
      isComplete: true,
      completedAt: DEFAULT_TIME
    }];
  }

  getTop(matchNum) {
    try {
      return this.data[matchNum].top;
    }
    catch(err) {
      return BASIC_EMPTY_SIDE;
    }
  }

  getBottom(matchNum) {
    if(this.data[matchNum].isBye)
    {
      return { 
        seedNumber: 1,
        winner: false,
        disqualified: false,
        teamID: DEFAULT_TIME,
        readyAt: DEFAULT_TIME,
        challengedAt: DEFAULT_TIME,
        score: 0,
        team: {
          _id: DEFAULT_ID,
          name: 'BYE',
          userID: DEFAULT_ID,
          ownerID: DEFAULT_ID,
          tournamentID: DEFAULT_ID,
          customFields: [Array],
          countryFlag: DEFAULT_FLAG,
          captainID: DEFAULT_TIME,
          playerIDs: [Array],
          createdAt: DEFAULT_TIME,
          updatedAt: DEFAULT_TIME
        }
      };
    }
    else {
      try {
        return this.data[matchNum].bottom;
      }
      catch(err) {
        return BASIC_EMPTY_SIDE;
      }
    }
  }



}




const ch = '561574448277225493';
let bracket = new Bracket();
let timer;

setInterval(function() {
  let date = new Date();
  let seconds = (toString(date.getUTCSeconds()).length > 1) ? date.getUTCSeconds() : "0"+date.getUTCSeconds();
  bot.channels.get(ch).send("Refreshing Bracket at " + date.getUTCFullYear()+"-"+date.getUTCMonth()+"-"+date.getUTCDay()+"T"+date.getUTCHours()+":"+date.getUTCMinutes()+":"+seconds);
}, 10000);



bot.login('NTYxNTY3NjYxMzM5NzA1Mzc0.XJ-Gyg.z5gZZT8ozpbEF4pwaqIwPsTXaZk');



bot.on("message", (message) => {

    if((message.content[0] === '!'))
    {
        let input = message.content.substr(1, message.content.length).split(' ');

        switch(input[0].toLowerCase())
        {

            //**************BRACKET STUFF***************
            case "setbracket":
              request("https://api.battlefy.com/stages/"+ input[1].slice(-33).slice(0, -9) + "/matches", function (error, response, html) {
                if (!error && response.statusCode == 200) {
                  bracket.data = JSON.parse(html);
                  bracket.id = input[1].slice(-33).slice(0, -9);
                  message.reply("Bracket set to " + bracket.id);
                  console.log(bracket.data[9]);
                }
                else{
                  message.reply("Uh oh. I didn't find the page. The ID you gave me was " + input[1].slice(-33).slice(0, -9));
                }
              });

              break;
            
            case "settimer":
              timer = parseInt(input[1]) * 60000;
              setTimeout(checkReady, timer);
              message.reply("Timer was set for " + timer/60000 + " minutes.");
              break;

            case "match":
              try {
                let status_message = "";
                let m = parseInt(input[1]) - 1;
                let top = bracket.getTop(m);
                let bot = bracket.getBottom(m);
                status_message += "Showing Match#" + (m+1) + "\n" + 
                "Top Player: " + top.team.name + " was ready at " + top.readyAt + "\n" +
                "Bottom Player: " + bot.team.name + " was ready at " + bot.readyAt;
                if(bracket.data[m].isComplete)
                {
                  status_message += "\nMatch has been completed.";
                }
                message.reply(status_message);
              }
              catch(err) {
                message.reply("Format: !match <match number> Must be within range of how many matches there are.");
                console.log(err);
              }
              break;
              
            default:
                message.reply("Sorry I didn't understand you. Please try again.");
                break;
        }
    }
});