const axios = require("axios");
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

// Helper function to get DOM elements
const $ = (selector) => document.querySelector(selector);

// DOM elements
const $time = $("#time");
const $date = $("#date");
const $weather = $("#weather");
const $humidity = $("#humidity");
const $imcResult = $("#imc");
const $calculateImcButton = $("#calculateIMC");
const $weightDisplay = $("#weight");
const $heightDisplay = $("#height");
const $newsItems = document.querySelectorAll('.news');

// API URLs and keys
const thingSpeakApiKey = "S3BUKJ9SHJ86YVR5";
const weatherApiKey = "JGS6NRLE802F05KK";
const rapidApiKey = "d1121daaa0msh804e45be823a492p13e1afjsnc68a8c847609";
const baseUrl = "https://api.thingspeak.com";
const weatherApiUrl = `${baseUrl}/channels/2367322/fields/1/last.json?api_key=${weatherApiKey}`;
const humidityApiUrl = `${baseUrl}/channels/2367322/fields/2/last.json?api_key=${weatherApiKey}`;
const weightApiUrl = `${baseUrl}/channels/2367322/fields/3/last.json?api_key=${weatherApiKey}`;
const heightApiUrl = `${baseUrl}/channels/2367322/fields/4/last.json?api_key=${weatherApiKey}`;
const newsApiOptions = {
  method: "GET",
  url: "https://news-api14.p.rapidapi.com/top-headlines",
  params: { country: "mx", language: "es-419", pageSize: "3", category: "technology" },
  headers: { "X-RapidAPI-Key": rapidApiKey, "X-RapidAPI-Host": "news-api14.p.rapidapi.com" },
};
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

// Event listener for IMC calculation
$calculateImcButton.addEventListener("click", async () => {
  const weight = parseFloat($weightDisplay.textContent);
  const height = parseFloat($heightDisplay.textContent);
  const imc = (weight / Math.pow(height / 100, 2)).toFixed(2);

  try {
    await axios.post(`${baseUrl}/update?api_key=${thingSpeakApiKey}`, `field5=${imc}`);
    await set(ref(db, `/imc/` + Date.now()), {value: imc, time: Date.now()});
    $imcResult.innerText = imc;
  } catch (error) {
    console.error('Error posting IMC data:', error);
  }
});

// Function to update time and date every second
const updateTimeAndDate = () => {
  const current = new Date();
  $date.innerText = "Hoy es " + current.toLocaleDateString();
  $time.innerText = current.toLocaleTimeString();
};
setInterval(updateTimeAndDate, 1000);

// Function to fetch and update weather data
const updateWeatherData = async (apiUrl, elementToUpdate, field, units) => {
  try {
    const response = await axios.get(apiUrl);
    const value = JSON.parse(response.data[field]).toFixed(2);
    elementToUpdate.innerText = `${value} ${units}`;
  } catch (error) {
    console.error(`Error fetching data from ${apiUrl}:`, error);
  }
};

// Update weather and humidity every second
setInterval(() => updateWeatherData(weatherApiUrl, $weather, 'field1', '°C'), 1000);
setInterval(() => updateWeatherData(humidityApiUrl, $humidity, 'field2', '%'), 1000);
setInterval(() => updateWeatherData(weightApiUrl, $weightDisplay, 'field3', 'kg'), 1000);
setInterval(() => updateWeatherData(heightApiUrl, $heightDisplay, 'field4', 'cm'), 1000);

// Fetch and update news
const fetchNews = async () => {
  try {
    const response = await axios.request(newsApiOptions);
    response.data.articles.forEach((article, index) => {
      const newsItem = $newsItems[index];
      if (newsItem) {
        newsItem.innerText = article.title;
      }
    });
  } catch (error) {
    console.error('Error fetching news:', error);
  }
};

fetchNews(); // Call the function to fetch news