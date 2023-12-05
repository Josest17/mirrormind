//Importing libraries
const { initializeApp } = require('firebase/app');
const { getDatabase, ref, set } = require('firebase/database');
const sensor = require('node-dht-sensor');
const axios = require('axios');

//Setting up API
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

// Setting up DHT11 sensor
const sensorType = 11; // DHT11
const pin = 25; // GPIO pin where the sensor is connected

setInterval(() => {
  try {
    const result = sensor.read(sensorType, pin);
    const temperatureC = result.temperature.toFixed(1);
    const humidity = result.humidity.toFixed(1);
    
    axios.post(apiUrl, `field1=${temperatureC}&field2=${humidity}`);
    set(ref(db, '/temperature/' + Date.now()), {value: temperatureC, time: Date.now()});
    set(ref(db, '/humidity/' + Date.now()), {value: humidity, time: Date.now()});
    console.log(`Temp: ${temperatureC} C   Humidity: ${humidity}%`);
  } catch (error) {
    console.error(error);
  }
}, 2000);