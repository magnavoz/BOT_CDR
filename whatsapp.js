const { json } = require('express/lib/response');
const {requestAll} = require('./cnx');
const {API} = require('./connect')
const imageToBase64 = require('image-to-base64');

const sendMessageWhatsApp = async (message=null,isImage=false,img=null) => {
    
    //var img = './screenshots/picture_kobsa.jpeg';
    let image = "";
    const options = {
        string: true,
        headers: {
          "User-Agent": "my-app"
        }
      };
    if(isImage){
        image = await imageToBase64(img).then((response)=>{return response}).catch((error)=>{return null});
    }
    

    var data = {
        id:"P-927019771",  
        numbers:
        [
            {
                id:"51999096706-1611954084@g.us"
            }
        ],
        message:message,
        isImage:isImage,
        image:image//"https://ychef.files.bbci.co.uk/976x549/p0bdlxm5.jpg"
    }
    //console.log(image)
    let body = JSON.stringify(data)
    requestAll(API.WHATSAPP.SEND,data)
    .then((res) => {

        console.log('respuesta:',res);
    })
    .catch((err) => {
       console.log(err);
    });
}
module.exports = {  
    sendMessageWhatsApp
}

