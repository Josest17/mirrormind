const { app, BrowserWindow} = require('electron')

const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    })
    win.loadFile('src/index.html')
}

app.whenReady().then(() => {
    createWindow()
})