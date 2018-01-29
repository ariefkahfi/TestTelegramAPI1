let sworm = require("sworm");


let mysqlDB = sworm.db({
    driver : "mysql",
    config : { 
        user : "arief",
        password : "arief",
        host : "localhost",
        database : "api1"
    }
});



let usersPointsModel = mysqlDB.model({table : "points"});


class MyQuery{
    getDataById(chat_id,callbackA,callbackB){
            usersPointsModel
            .query("select * from points where chat_id = @id",{
                id : chat_id
            }).then((data)=>{
                callbackA(data);
            }).catch((err)=>{
                callbackB(err);
            });
    }
    getPointsFromChatId(chat_id,callbackA,callbackB){
        usersPointsModel.query("select value from points " + 
        " where chat_id = @id",{
            id : chat_id
        }).then((data)=>{
            callbackA(data);
        }).catch((err)=>{
            callbackB(err);
        })
    }
    sendPoints(sender,receiver,pointsValue,callbackA,callbackB,telegram){
        mysqlDB.statement(
            "update points set value = value - @sender_value " + 
            "where chat_id = @sender_chat_id",{
                sender_value : pointsValue,
                sender_chat_id : sender.chat_id
            }).then(()=>{
                mysqlDB.statement(
                    "update points set value = value + @sender_value " + 
                    "where chat_id = @receiver_chat_id",{
                        sender_value : pointsValue,
                        receiver_chat_id : receiver.chat_id
                    });
                // mysqlDB.statement(
                //     "update points set value = value + @sender_value " + 
                //     "where chat_id = @receiver_chat_id",{
                //         sender_value : pointsValue,
                //         receiver_chat_id : receiver.chat_id
                //     }).then(()=>{
                //         telegram
                //             .sendMessage(sender.chat_id,"transaction done")
                //             .then(()=>{
                //                 telegram.sendMessage(receiver.chat_id,
                //                     "you get " +pointsValue+ " points \n" + 
                //                     "from chat_id : " + sender.chat_id);
                //             }).catch((err)=>{
                //                 console.log(err);
                //                 ctx.reply("error when send transaction message");
                //             });
                //     }).catch((err)=>{
                //         callbackB(err,"transaction error");
                //     });
            }).then(()=>{
                telegram.sendMessage(sender.chat_id,"transaction done");
            }).then(()=>{
                telegram.sendMessage(receiver.chat_id,
                    "you get " +pointsValue+ " points \n" + 
                    "from chat_id : " + sender.chat_id);
            }).catch((err)=>{
                callbackB(err,"error while transfer to receiver  : " + receiver.chat_id);
            });
    }

    insertData(user,callbackA,callbackB){
        usersPointsModel({
            value : user.value ,
            chat_id : user.chat_id,
            username : user.username
        }).save()
            .then(()=>{
                callbackA("register done !!");
            })
            .catch((err)=>{
                callbackB(err);
            });
    }
}
module.exports = new MyQuery();