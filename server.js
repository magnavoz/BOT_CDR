const puppeteer = require('puppeteer-extra');
const express = require('express');
const http = require('http');
const fs = require('fs');
const os = require('os');
const path = require('path')
const { response } = require('express');
const { Console } = require('console');
const app = express();
const server = http.createServer(app);
require('dotenv').config()
const companies = require('./env.json');
const uploadfile = require('./ftp');
const screenshot = require('screenshot-desktop')
const { sendMessageTelegram, sendPictureTelegram } = require('./telegram')
const { sendMessageWhatsApp } = require('./whatsapp')

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));
var dir = process.cwd()

const login = async (COMPANY, D = null) => {

    console.log(COMPANY,D)

    if (!fs.existsSync("screenshots")) {
        fs.mkdirSync("screenshots");
    }

    await sendMessageTelegram(null, 'Iniciando BOT '+COMPANY);
    await sendMessageWhatsApp('Iniciando BOT '+COMPANY);

    const data = companies.find(x => x.COMPANY == COMPANY)

    const browser = await puppeteer.launch({
    
        headless: false,
        ignoreHTTPSErrors: true,
       
        userDataDir: './session/' + data.COMPANY,
       
    });


    const page = await browser.newPage();

    const navigationPromise = page.waitForNavigation();
    await page.setViewport({ width: 1366, height: 768 });


    await sendMessageTelegram(null, 'Accediendo a la web');
    await sendMessageWhatsApp('Accediendo a la web');
    await page.goto('https://magnavoz-us.digitalkcloud.com/Login');
   

    const loginInput = await page.waitForSelector('#Username');

    const loginPassword = await page.waitForSelector('#Password');

    await loginInput.type("albertr@magnavoz.com");

    await loginPassword.type("Albert2018a")

    await screenShotAndSendTelegram(page, 'Ingresando credenciales');

    await page.click('#LoginButton');

    await page.waitForSelector(".breadcrumb-item").catch(async (err) => {
        await screenShotAndSendTelegram(page, 'Error');
        await sendMessageTelegram(null, 'finalizando proceso');
        await sendMessageWhatsApp('finalizando proceso');
        await delay(3000)
        process.exit(1);
    });
    //KOBSA
    //await page.goto('https://magnavoz-us.digitalkcloud.com/Reporting/BIReports/cdrs.html#A2021-10-14%2000%3A00%3A00:2021-10-14%2023%3A59%3A59/-300/asig_carrier_group=cc%20Kobsa%20Prepago'
    await sendMessageTelegram(null, 'Accediendo al reporte precargado');
    await sendMessageWhatsApp('Accediendo al reporte precargado');
    if (COMPANY == 'KOBSA') {
        if (D != null) {
            let date_ob = new Date();
            if (D != null) {
                date_ob.setDate(date_ob.getDate() - Number(D));
                console.log("ejecutando:", date_ob.getDate())
            }
            let date = ("0" + date_ob.getDate()).slice(-2);
            let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
            let year = date_ob.getFullYear();

            await page.goto(`https://magnavoz-us.digitalkcloud.com/Reporting/BIReports/cdrs.html#A${year}-${month}-${date}%2000%3A00%3A00:${year}-${month}-${date}%2023%3A59%3A59/-300/asig_carrier_group=cc%20Kobsa%20Prepago`
                , {
                    waitUntil: 'networkidle0',
                }
            );
        }
    }else{

        await page.goto(data.LINK
            , {
                waitUntil: 'networkidle0',
            }
        );
        
    } 
    
    // if(COMPANY == 'RECSA') {
    //     await page.goto(data.LINK
    //         , {
    //             waitUntil: 'networkidle0',
    //         }
    //     );
    // }

    // if(COMPANY == 'HDC') {
    //     await page.goto(data.LINK
    //         , {
    //             waitUntil: 'networkidle0',
    //         }
    //     );
    // }

    // await page.screenshot({ path: `./screenshots/github-profile.jpeg` });
    await screenShotAndSendTelegram(page, 'Reporte precargado');

    await page.click('#actionMenuButton');

    await page.click('#export');

    await page.waitForResponse(response => response.status() === 200)

    console.log('cargo 200')

    const ExportTemplates = await page.waitForSelector('#ExportTemplates', {
        visible: true,
        // timeout: 0
    });

    // await ExportTemplates.select('81,26,29,30,32,33,34,37,38,16,17,18,49'); 
    // await sendMessageTelegram(null,'Aplicando filtro para exportar');
    await screenShotAndSendTelegram(page, 'Aplicando filtro para exportar');
    await ExportTemplates.select(data.FILTER);

    const Export = await page.waitForSelector('#Export', {
        visible: true,
        // timeout: 0
    });

    await Export.click();

    // await sendMessageTelegram(null,'descargando.....');
    await screenShotAndSendTelegram(page, 'descargando.....',true);
    var chFile = await checkFile(data,D);
    // console.log(chFile)
    if (chFile) {
        await sendMessageTelegram(null, 'archivo descargado, iniciando carga al ftp');
        await sendMessageWhatsApp('archivo descargado, iniciando carga al ftp');
        console.log('exitoso,Iniciando subida');
        try {
            let res = await uploadFile(data,D);
            if (res) {
                await sendMessageTelegram(null, 'archivo cargado.');
                await sendMessageWhatsApp('archivo cargado.');
                console.log('datos subidos')
                await sendMessageTelegram(null, 'finalizando proceso');
                await sendMessageWhatsApp('finalizando proceso');         
                process.exit(0)
            } else{
                await sendMessageTelegram(null, 'Error al subir fichero');
                await sendMessageWhatsApp('Error al subir fichero');  
                process.exit(0)
            }
        } catch (err) {
            await sendMessageWhatsApp('Error al subir fichero'+err);
            await sendMessageWhatsApp('Fin del proceso');
            process.exit(0) 
        }
        
    }



}

async function delay(time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    });
}

const selecting = async (p, dom, v, att) => {
    var d = await p.$('[' + att + '="' + dom + '"]');
    await d.select(v);
}

const checkFile = async (data, D = null) => {

    let date_ob = new Date();
    if (D != null) {
        date_ob.setDate(date_ob.getDate() - Number(D));
    }
    let date = ("0" + date_ob.getDate()).slice(-2);
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();

    let oldPath ="";
    if(data.COMPANY=="RECSA"){
        date = "01";
        oldPath = `cdrs_${year}${month}${date}_000000.csv`
    }else{
        oldPath = `cdrs_${year}${month}${date}_050000.csv`
    } 


    //const oldPath = `cdrs_${year}${month}${date}_050000.csv`
    // console.log(oldPath)
    const newPath = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/${year}${month}${date}.csv`
    const directory = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/`
    return await new Promise(resolve => {

        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log('Directorio creado')
        }

        const refreshId = setInterval(() => {

            fs.access(oldPath, fs.F_OK, (err) => {
                if (err) {
                    // console.error(err)
                    console.log('archivo no existe')

                } else {
                    //file exists
                    console.log('archivo existe')
                    fs.rename(oldPath, newPath, function (err) {
                        if (err) throw err
                        console.log('Successfully renamed - AKA moved!')
                        resolve(true);
                        clearInterval(refreshId);
                        //return true
                    })
                }
            })
        }, 6000);

    })

}

const uploadFile = async (data, D = null) => {
    try {
        console.log(D)
        let date_ob = new Date();
        if (D != null) {
            date_ob.setDate(date_ob.getDate() - Number(D));
        }
        let date = ("0" + date_ob.getDate()).slice(-2);
        let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        let year = date_ob.getFullYear();
        // console.log(oldPath)
        if(data.COMPANY=="RECSA"){
            date = "01";            
        }

        const path = `C:/tmp/${data.COMPANY}/${year}/${month}/${date}/${year}${month}${date}.csv`

        if (data.COMPANY == "KOBSA") {
            return await uploadfile(path, `${data.FTP_FOLDER_MAIN}/${year}/${month}/`, `${year}${month}${date}.csv`, data.FTP_CN);
        } else {
            return await uploadfile(path, `${data.FTP_FOLDER_MAIN}/${year}/`, `${year}${month}${date}.csv`, data.FTP_CN);
        } 
    } catch (ex) {
        throw ex
    }
    



}

const screenShotAndSendTelegram = async (page, message, all = false) => {
    let rute = `./screenshots/picture_kobsa.jpeg`
    if(all){
        await screenshot({ filename: rute });
    }else{
        await page.screenshot({ path: rute });
    }
    
    await sendPictureTelegram(null, rute, message);

    await sendMessageWhatsApp(message,true,rute);
}

const getArgs = async () => {
    const args = {};

    process.argv
        .slice(2, process.argv.length)
        .forEach(arg => {
            // console.log(arg)
            // long arg
            if (arg.slice(0, 2) === '--') {
                const longArg = arg.split('=');
                const longArgFlag = longArg[0].slice(2, longArg[0].length);
                const longArgValue = longArg.length > 1 ? longArg[1] : true;
                args[longArgFlag] = longArgValue;
            }
            // flags
            else if (arg[0] === '-') {
                const flags = arg.slice(1, arg.length).split('');
                flags.forEach(flag => {
                    args[flag] = true;
                });
            }
        });

    //process.env.PORT

    //console.log(args.COMPANY);

    await login(args.COMPANY, args.D)
    // const data = companies.find(x=>x.COMPANY == args.COMPANY)
    // uploadFile(data,args.D)


    //console.log(result)
    //return args;
}

getArgs();

//login();