const axios = require('axios');
const BalanceBoard = require("wii-balance-board-pi");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

const apiUrl = "https://api.thingspeak.com/update?api_key=S3BUKJ9SHJ86YVR5";
const firebaseConfig = {
    apiKey: "AIzaSyD5YfjESgVEMinKF0JNT9rM9QM91HEjDzk",
    authDomain: "mirrormind-app.firebaseapp.com",
    databaseURL: "https://mirrormind-app-default-rtdb.firebaseio.com",
    projectId: "mirrormind-app",
    storageBucket: "mirrormind-app.appspot.com",
    messagingSenderId: "452306067179",
    appId: "1:452306067179:web:0513381ee3f920e0a828ae"
  };
const app = initializeApp(firebaseConfig);
const db = getDatabase();

var balanceBoard = new BalanceBoard()
let newWeight = 0;
let newDistance = 0;
let lastData;

balanceBoard.connect()
balanceBoard.on("data", data => {
    lastData = data
})

setInterval(() => {
    if (lastData.connected) {
        if (lastData.totalWeight > 40) {
            newWeight = lastData.totalWeight + 3.6
            fetchData()
            let IMC = newWeight / ((newDistance/100) * (newDistance/100))
            console.log("Peso:" + newWeight, "Estatura:" + newDistance, "IMC:" + IMC)
            axios.post(apiUrl, `field3=${newWeight}&field4=${newDistance}`);
            set(ref(db, '/weight/' + Date.now()), {value: newWeight,time: Date.now()})
            set(ref(db, '/height/' + Date.now()), {value: newDistance,time: Date.now()})
        }
    }
    else {
        console.log(lastData.connected)
    }
}, 2000)

function fetchData() {
    axios.get('http://0.0.0.0:5000/distance')
        .then(response => {
            const distance = response.data.distance
            if (distance > 50) {
                newDistance = distance
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error)
        });
}