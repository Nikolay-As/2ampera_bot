const {Telegraf,session,Scenes:{BaseScene,Stage},Markup}=require('telegraf')

const bot_token=require( './botinfo')  // получаем токен бота

console.log("AgACAgIAAxkBAAIBu2FCHXuyta-AFMfza5T95BRwmhewAAI3uDEb3bwQSoPZNOas0PWsAQADAgADcwADIAQ")
const mysql = require("mysql2");
  
const pool = mysql.createPool({
    host: 'nikolayhs.beget.tech',
    user: 'nikolayhs_bot',
    database: 'nikolayhs_bot',
    password:'Nikolayhs_bot',
    //connectionLimit: 1000,
  });

//console.log(bot_token)

const remove_keyboard=Markup.removeKeyboard()
const menu_keyboard=Markup.keyboard(['💸Оставить заявку на оплату',
                                    '💻Оставить заявку на изменение/добавление MAC-адресов',
                                    '👀Проверить статус заявки',
                                    '📋Инструкции',
                                    '🚨Пнуть админа,чтобы обработал заявку🤬']).oneTime() // общее меню бота

// Сцена, спрашиваем как зовут --------
const nameScene=new BaseScene('shablon')
nameScene.enter(ctx=>ctx.reply(''))
nameScene.on('text',ctx=>{
    ctx.session.name=ctx.message.text
    return ctx.scene.leave()
})
nameScene.leave(ctx=>ctx.reply(`Имя записано`))
// ------------------


// Сцена, для заявки на оплату -------- ( номер комнаты)
const PaymentScene_1=new BaseScene('PaymentScene_1')
PaymentScene_1.enter(ctx=>ctx.reply('Напиши номер комнаты',remove_keyboard))
PaymentScene_1.on('text',ctx=>{
    ctx.session.number_room=ctx.message.text
    return ctx.scene.enter('PaymentScene_2') // Переходи в сцену PaymentScene_2
})
// ------------------

// Сцена, для заявки на оплату -------- ( Фамилилия на которую зареган инет )
const PaymentScene_2=new BaseScene('PaymentScene_2')
PaymentScene_2.enter(ctx=>ctx.reply('Напиши фамилию на которую зарегестрировал сеть'))
PaymentScene_2.on('text',ctx=>{
    ctx.session.fio=ctx.message.text
    return ctx.scene.enter('PaymentScene_3') // Переходи в сцену PaymentScene_3
})
// ------------------

// Сцена, для заявки на оплату -------- ( Скрин оплаты инет )
const PaymentScene_3=new BaseScene('PaymentScene_3')
PaymentScene_3.enter(ctx=>ctx.reply('Отправь скрин платежа'))
 PaymentScene_3.on('photo',ctx=>{
    ctx.session.foto=ctx.message.photo[0].file_id
    return ctx.scene.leave()
})
PaymentScene_3.leave(ctx=>{
    ctx.reply(`Заявка принята`,menu_keyboard)
    ctx.reply(`Содержание вашей заявки:\n- №комнаты:${ctx.session.number_room}\n- ФИО:${ctx.session.fio}\n- Скрин:`);
    ctx.replyWithPhoto(ctx.session.foto)

    let getHours=new Date().getHours()
    let getMinutes=new Date().getMinutes();
    let getSeconds=new Date().getSeconds();
    let time=getHours+':'+getMinutes+':'+getSeconds;


    let year=new Date().getFullYear();
    let mounth=new Date().getMonth();
    let day=new Date().getDay();
    let date=year+'-'+mounth+'-'+day;
    //let date=

    const data=[ctx.from.id,'Оплата',ctx.session.number_room,ctx.session.fio,ctx.session.foto,date,time];
   // console.log(data)
   const sql = "INSERT INTO applications(id_user,type,  room_number,fio_user,file_id,date,time) VALUES(?,?, ?,?,?,?)";

   pool.query(sql, data   , function(err, results) {
    if(err) console.log(err);
    else {
        console.log("Заявка принята");
        mes="Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.";
       // bott.sendMessage(chatId,"Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.")
    }

});


    /*
    const sql2 = "INSERT INTO users(chat_id,first_name,last_name,username,status) VALUES(?,?, ?,?,?)";
    
    */

/*
    const users=[msg.chat.id,msg.chat.first_name,msg.chat.last_name,msg.chat.username,1];
    const sql2 = "INSERT INTO users(chat_id,first_name,last_name,username,status) VALUES(?,?, ?,?,?)";
    pool.query(sql2, users   , function(err, results) {
        if(err) console.log(err);
        else {
            console.log("Adds user");
            mes="Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.";
           // bott.sendMessage(chatId,"Поздравляем! Вы подписались на Бот\n\nИспользуйте /off чтобы приостановить подписку.")
        }

    });
    */
})
// ------------------





const stage=new Stage([PaymentScene_1,PaymentScene_2,PaymentScene_3])
const bot=new Telegraf(bot_token)        // подключаемся к боту
bot.use(session())
bot.use(stage.middleware())
bot.command('/start',ctx=>ctx.reply(`Привет, меня зовут Мартин, я бот сети II AMPERA`,menu_keyboard))
bot.command('/name',ctx=>ctx.scene.enter('PaymentScene'))

bot.hears('💸Оставить заявку на оплату', ctx=>ctx.scene.enter('PaymentScene_1'))


bot.launch()