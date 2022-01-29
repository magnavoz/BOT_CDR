// process.env.NTBA_FIX_319 = 1;

let Client = require('ssh2-sftp-client');
// const TelegramBot = require('node-telegram-bot-api');
const cn = require('./cnx')


// return

let sftp = new Client();
// const token = '1634094022:AAG2hF6QBodnb0MHjF8PdYcV6nlniA28QTM';
// const chatId = '-595274547';

// const bot = new TelegramBot(token, {polling: true});

// bot.sendMessage(chatId, "prueba nodejs api");

// const photo = `${__dirname}/files/pngegg.png`;
//   bot.sendPhoto(chatId, photo, {
//     caption: "I'm a bot!"
//   });

//   const file = `${__dirname}/files/test.txt`;
//   bot.sendDocument(chatId, file);

sftp.connect(cn).then(() => {
  return sftp.list('/');
  //return sftp.fastPut('files/test.txt', '/Kobsa-IN/prueba/test.txt');
}).then(data => {
  console.log(data, 'the data info');
//   bot.sendMessage(chatId, data);
}).catch(err => {
  console.log(err, 'catch error');
});