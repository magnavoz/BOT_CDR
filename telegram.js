const TelegramBot = require('node-telegram-bot-api');

const token = '1634094022:AAG2hF6QBodnb0MHjF8PdYcV6nlniA28QTM';

const bot = new TelegramBot(token, {polling: true});

const sendMessageTelegram = async (idGroup=null,message=null) =>{    

    await bot.sendMessage('-595274547', message);

}

const sendPictureTelegram = async(chatId=null,url,message=null) => {
    //await bot.sendMessage('-595274547', message);
    bot.sendPhoto('-595274547', url,{caption:message});
}

module.exports =  {
    sendMessageTelegram,
    sendPictureTelegram
};