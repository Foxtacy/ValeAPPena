const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu


function appOnReady(){
    //console.log("startup succesfull");
    console.log("app start successfull");
    //[1,2,3].forEach( _ => {
        let win = new BrowserWindow({
            width: 800,
            height: 600
        }); 

        win.loadURL(`file://${__dirname}/newview.html`);
        
        win.on('closed', _ => {
            console.log("closed");
            mainWindow = null;
        });        
        
        

    //});
}

app.on("ready", appOnReady);