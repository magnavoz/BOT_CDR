const Client = require('ssh2-sftp-client');
const cn = require('./cnx')

const uploadfile = async(path,to,file,cn) =>{
    //path = './files/test.txt'
    //to = '/Kobsa-IN/test.txt';
    let sftp = new Client();
    let res = "";
    await sftp.connect(cn).then(async() => {
        //return (sftp.list(to));
        let option = {
            flags: 'w',  // w - write and a - append
            encoding: null, // use null for binary files
            mode: 0o666, // mode to use for created file (rwx)
            autoClose: true // automatically close the write stream when finished
          }
          try {
            sftp.mkdir(to, true).catch(err=>console.log('error: ',err.code));
          }catch(err) {
              console.log("error al crear directorio")
          }
        
        return await new Promise(resolve => {
            setTimeout(() => {
                resolve(sftp.put(path, to+file).then(data=>console.log(data)));
            }, 5000);
        })
        
        
    })
    .then(data => {
        res = true;
        //console.log(data, 'the data info'); 
        // data.forEach(res => {
        //     //console.log(file)
        //     if(res.type=='-' && res.name==file){
        //         console.log(res)          
        //     }
        // });           
    })
    .catch(err => {
        console.log(err, 'catch error');
        return false
        
    });

    return res;
}

module.exports = uploadfile;
//CustomFtp();