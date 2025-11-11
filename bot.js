require('dotenv').config();
const {Bot, Keyboard,session} = require("grammy");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKE);
const admin = process.env.TELEGRAM_ADMIN_TOKE;


bot.use(session(
    {
        initial:()=>({waiting:false})
    }
))

bot.api.setMyCommands([
    {command:'start',description:'Запустить бота'},
    {command:'help',description:'Список команд'}
])

bot.command('start',async (ctx)=>{
    const startkeybord = new Keyboard().text("Сделать заказ").text("О нас").row()   .text("Команды").resized()
    await ctx.reply("Я бот помощник",{
        reply_markup:startkeybord
    })
})

bot.command('help',async (ctx)=>{
    await ctx.reply(`/start - старт бота\n\n/list - лист заказов`)
})
bot.hears('Сделать заказ',  (ctx)=>{
     ctx.session.waiting = true;
     ctx.reply("Напишите артикул",{
        reply_markup:{remove_keyboard:true}
    })

})
    bot.on('message', async (ctx)=>{
        const adminId = admin;
        if(ctx.session.waiting === true){
            await ctx.forwardMessage(adminId,{text:ctx.message.text});
            await ctx.reply("С вами скоро...")
        }
    })
bot.hears('Команды', async(ctx)=>{
    await ctx.reply(`/start - старт бота\n\n/list - лист заказов`,{
    })
})

bot.start()