require('dotenv').config();
const { Bot, Keyboard, session } = require("grammy");

const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN);
const admin = process.env.TELEGRAM_ADMIN_TOKEN;

let orders = [];

bot.use(session(
    {
        initial:()=>({waiting:false})
    }
))

bot.api.setMyCommands([
    {command:'start',description:'Запустить бота'},
    {command:'help',description:'Список команд'},
    {command:'list',description:'Список заказов'}
])

bot.command('start',async (ctx)=>{
    const startkeybord = new Keyboard().text("Сделать заказ").text("О нас").row().text("Команды").resized()
    await ctx.reply("Добро пожаловать! Я ваш помощник в оформлении заказов 🛍️",{
        reply_markup:startkeybord
    })
})
bot.command('list', async(ctx)=>{
    if(admin == ctx.from.id){
        if (orders.length === 0) {
        await ctx.reply("📭 Список заказов пуст.");
        return;
    }
    let Listorder = "Списки задач\n\n";
    console.log(ctx)

    orders.forEach((order,index)=>{
        Listorder += `Заказ #${index + 1}\n`;
        Listorder += `Пользователь @${order.userName}\n`;
        Listorder += `Артикул ${order.article}\n`;
        Listorder += `Время ${order.date}\n`;
        Listorder += `Status ${order.status}\n\n`
        
    })
    await ctx.reply(Listorder)
    }else{await ctx.reply("У вас нет прав!")}
})

bot.command('help',async (ctx)=>{
    await ctx.reply(`📋 Доступные команды:\n\n/start - Запустить бота\n/list - Посмотреть список заказов`)
})

bot.hears('Сделать заказ', (ctx)=>{
     ctx.session.waiting = true;
     ctx.reply("Пожалуйста, напишите артикул товара 🔢",{
        reply_markup:{remove_keyboard:true}
    })
})

bot.on('message', async (ctx)=>{
    const adminId = admin;
    if(ctx.session.waiting && ctx.message.text){
        const usermessage = ctx.message.text
        const newOrder = {
            userId:ctx.from.id,
            userName:ctx.from.username || `Пользователь @${ctx.from.id}`,
            article:usermessage,
            status:"Новый",
            date: new Date().toLocaleString("ru-RU"),
        }

        orders.push(newOrder);
        const orderNotific = `Новый заказ \n\n`+
        `Имя: @${newOrder.userName}\n` +
        `Артикул: ${newOrder.article}\n` +
        `Дата ${newOrder.date}\n\n` +
        `Всего заказов ${orders.length}`;

        await bot.api.sendMessage(adminId,orderNotific);

        await ctx.reply("✅ Спасибо! Ваш заказ принят. С вами свяжутся в ближайшее время.");
        ctx.session.waiting = false;
    }


})

bot.hears('Команды', async(ctx)=>{
    await ctx.reply(`📋 Доступные команды:\n\n/start - Запустить бота\n/list - Посмотреть список заказов`)
})

bot.hears('О нас', async(ctx)=>{
    await ctx.reply("Мы - команда профессионалов, готовых помочь вам с выбором товаров! 💼")
})

bot.catch((err) => {
    console.error('Error in bot:', err);
})

bot.start()