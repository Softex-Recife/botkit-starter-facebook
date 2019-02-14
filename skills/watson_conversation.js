module.exports = function(controller, assistant, contextos) {
    controller.on('message_received', function(bot, message) {		
		resolveMessage(assistant, contextos, bot, message)
    });
};

function resolveMessage(assistant, contextos, bot, message){
	key = message.user;
	var contexto = null;
	if (!contextos[key]){
		assistant.createSession({
			assistant_id: "65431f3c-bf2d-4121-85fb-a78e5cb46ce2"
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

function sendMessage(contexto, message, bot, assistant){
	assistant.message({
		assistant_id: '65431f3c-bf2d-4121-85fb-a78e5cb46ce2',
		session_id: contexto,
		input: {
			'message_type': 'text',
			'text': message.text
		}
		}, function(err, response) {
			if (err) {
				console.log('error:', err);
			}else{					
				bot.reply(message, response.output.generic[0].text);
			}
		}
	);
}
