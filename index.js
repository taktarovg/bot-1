const telegramApi = require('node-telegram-bot-api')

const sequelize = require('./db');
const User = require('./models');

const UserModel = require('./models');

const token = '1627664594:AAFiH2ilHJK2iJL-y0wRwV49RBDZtXCQioQ';

const bot = new telegramApi(token, {polling: true});

const {gameOptions, apInOptions} = require('./options')

const chats = {}



const startGame  = async (chatId) => {
    await bot.sendMessage(chatId, 'Угадай, какой число от 0 до 9 я загадал');
            const randomNumber = Math.floor(Math.random() * 10);
            chats[chatId] = randomNumber;
            await bot.sendMessage(chatId, 'Отгадывай', gameOptions);
}

const start = async () => {

    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Подключение к БД сломалось', e)
    }

    bot.setMyCommands( [
        {command: '/start', description: 'Начальное приветствие'},
        {command: '/name', description: 'Узнать имя пользователя'},
        {command: '/game', description: 'Игра - угадай число'},
    ])
    
    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;


        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.eu/_/stickers/ee9/fa8/ee9fa8b6-2555-3d28-a06c-9af0e1b28f41/4.webp')
                return bot.sendMessage(chatId, 'Добро пожаловать в тестовго бота');
            }
        
            if (text === '/name') {
                const user = await UserModel.findOne({chatId})
                return bot.sendMessage(chatId, `Тебя зовут ${msg.from.first_name} ${msg.from.last_name}, в игре у тебя правильных ответов ${user.right}, неправильных ${user.wrong}`);
            
            }
    
            if (text === '/game') {
                return startGame(chatId);                   
            }
    
            return bot.sendMessage(chatId, 'Я тебя не понимаю, попробуй еще раз!');

        } catch (e) {
            return bot.sendMessage(chatId, 'Произошла какая то ошибка');
        }
    
        
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if(data === '/again') {
            return startGame(chatId)
        }

        const user = await UserModel.findOne({chatId})

        if(data == chats[chatId]) {
            user.right += 1;
            await bot.sendMessage(chatId, `Поздравляю, ты угадал цифру ${chats[chatId]}`, apInOptions);
            } else {
                user.wrong += 1;
                await bot.sendMessage(chatId, `Упс, ты не угадал, я загадал цифру ${chats[chatId]}`, apInOptions);
            }
            await user.save();
        })
}

start()