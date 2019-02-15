module.exports = function(controller, assistant, contextos) {
    controller.on(['direct_message', 'interactive_message_callback','message_received', 'facebook_postback'], function(bot, message) {		
		resolveMessage(assistant, contextos, bot, message)
    });
};

function resolveMessage(assistant, contextos, bot, message){
	var key = message.user;
	var contexto = null;
	if (!contextos[key]){
		assistant.createSession({
			assistant_id: process.env.assistant_id
		}, (err, response)=>{
			if (err) {
				console.error(err);
			} else {
				contexto = response.session_id;
				contextos[key] = contexto;
				sendMessage(contexto, message, bot, assistant)
			}
		})
	}else{
		contexto = contextos[key];
		sendMessage(contexto, message, bot, assistant)
	}
}

function createQuickReplies(list_buttons, texto) {
	console.log("replies", list_buttons);
    var quick_replies = [];
    list_buttons.forEach(function (item) {
        quick_replies.push({
            "content_type":"text",
            "title":item,
            "payload":item
        })
    });
    return {
        "text": ""+texto,
        "quick_replies":quick_replies
    };
}

function sendMessage(contexto, message, bot, assistant){
	assistant.message({
		assistant_id: process.env.assistant_id,
		session_id: contexto,
		input: {
			'message_type': 'text',
			'text': message.text,
			'options': {
				'return_context': true
			}
		}
		}, function(err, response) {
			if (err) {
				console.log('error:', err);
			}else{
				//console.log('response', JSON.stringify(response, null, 2));
				var quick_replies =  response.context.skills['main skill'].user_defined.quick_replies.replies
				var resp = response.output.generic[0].text
				if (typeof quick_replies !== 'undefined' && quick_replies.length > 0) {
					response = createQuickReplies(quick_replies, resp)
					bot.reply(message, response)
				} else{
					bot.reply(message, resp);
				}	
			}
		}
	);
}
