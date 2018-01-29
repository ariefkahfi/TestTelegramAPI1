const Telegraf = require("telegraf");
const myBot = new Telegraf("YOUR_BOT_TOKEN");
let myQuery = require("./models/database-model");




myBot.start((ctx)=>{
    ctx.reply("Welcome xD \n" + 
    " use /help for more info ");
});

myBot.command("help",(ctx)=>{
    ctx.reply(
        "1. /load \n" +
        "2. /send \n" +
        "3. /register"
    );
});

myBot.command("register",(ctx)=>{
    let username = ctx.from.username;
    let chat_id = ctx.from.id;
    let value = 0 ;

    if(username === undefined){
        username = "unknown";
    }

    let registerUser = {
        value : value,
        chat_id : chat_id,
        username  : username
    };

    myQuery.insertData(registerUser,(data)=>{
        ctx.reply(data);
    },(err)=>{
        ctx.reply("error ocurred when register user !!")
        console.log(err);
    });
});

myBot.command("load",(ctx)=>{
    let chat_id  = ctx.from.id;
    myQuery.getDataById(chat_id,(data)=>{
        if(data.length > 0) {
            let thisUser = data[0];
            ctx.reply(
                "your points : " + thisUser.value  + "\n" +
                "username : " + thisUser.username + "\n" +
                "chat_id : " + thisUser.chat_id + "\n"
            );
        }else{
            ctx.reply("this user hasn't been registered \n" 
            + "please , go to /register");
        }
    },(err)=>{
        ctx.reply("error ocurred when load data !!");
        console.log(err);
    });
});




myBot.command("send",(ctx)=>{
    let textMesssage = ctx.message.text.toString();
    let inputMsg = textMesssage.split(" ");
    
    let toChatId = inputMsg[1];
    let pointsValue = inputMsg[2];
    let fromChatId = ctx.from.id;
    
    myQuery.getDataById(fromChatId,(data)=>{
        if(data.length > 0){
            if(toChatId === undefined || pointsValue === undefined){
                ctx.reply("your command not valid use this \n" + 
                "example : /send chat_id points_value \n\n" +  
                "use commands above with space delimiter");
            }else if (parseInt(toChatId) === parseInt(fromChatId)){
                ctx.reply("you cannot send points to yourself");
            }else{
                myQuery.getPointsFromChatId(fromChatId,(data)=>{
                    let currentPoints = data[0].value;
                    if(currentPoints <= 0){
                        ctx.reply(
                            "you haven't any points yet : "
                        );
                    }else{
                        if(pointsValue > currentPoints){
                            ctx.reply("your input points must be lower than your current points");
                        }else{
                            myQuery.sendPoints({
                                // sender_chat_id here
                                chat_id : fromChatId
                            },{
                                // receiver_chat_id here
                                chat_id : toChatId
                            },pointsValue,(data)=>{
                                ctx.reply(data);
                            },(err,textErr)=>{
                                console.log(err);
                                ctx.reply(textErr);
                            },ctx.telegram);
                        }
                    }
                },(err)=>{
                    console.log(err);
                    ctx.reply("error when get your current points !!");
                });
            }
        }else{
            ctx.reply(
                "this user hasn't been registered \n" +
                "please go to /register to sign up"
            );
        }
    },(err)=>{
        console.log("error when getDataUserById at /send",err);
        ctx.reply("error when getData...");
    });

    
}); 

myBot.on("text",(ctx)=>{
    ctx.reply("use /help");
});

myBot.startPolling();
