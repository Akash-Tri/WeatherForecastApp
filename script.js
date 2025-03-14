document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchButton").addEventListener("click", getWeatherByCity);
    document.getElementById("locationButton").addEventListener("click", getWeatherByLocation);
});

const API_KEY = "289d7573980380edb88230c7de3fa580"; // ✅ Replace this with your actual API key
const API_URL = "https://api.openweathermap.org/data/2.5/weather?";
const FORECAST_API_URL = "https://api.openweathermap.org/data/2.5/forecast?";
const ICON_URL = "https://openweathermap.org/img/wn/";

// Fetch weather by city
async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        showError("City name cannot be empty.");
        return;
    }
    fetchWeather(`${API_URL}q=${city}&appid=${API_KEY}&units=metric`, city);
}

// Fetch weather by user location
function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetchWeather(`${API_URL}lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`, "Current Location");
            },
            (error) => {
                showError("Location access denied or unavailable.");
            }
        );
    } else {
        showError("Geolocation not supported.");
    }
}

// Fetch weather data
async function fetchWeather(url, city) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error("City not found. Please enter a valid city name.");
            } else if (response.status === 401) {
                throw new Error("Invalid API Key. Please check your OpenWeatherMap API key.");
            } else {
                throw new Error("Failed to fetch weather data. Please try again.");
            }
        }

        const data = await response.json();
        displayWeather(data);
        getExtendedForecast(city);
    } catch (error) {
        showError(error.message);
    }
}

// Display weather
function displayWeather(data) {
    document.getElementById("cityName").textContent = `${data.name} (${new Date().toISOString().split('T')[0]})`;
    document.getElementById("temperature").textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById("windSpeed").textContent = `Wind: ${data.wind.speed} M/S`;
    document.getElementById("humidity").textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById("weatherIcon").src = `${ICON_URL}${data.weather[0].icon}@2x.png`;

    document.getElementById("weatherInfo").classList.remove("hidden");
}

// Show error messages
function showError(message) {
    const errorMessage = document.getElementById("errorMessage");
    errorMessage.textContent = message;
    errorMessage.classList.remove("hidden");
    setTimeout(() => errorMessage.classList.add("hidden"), 5000);
}

// Fetch and display 5-day forecast
async function getExtendedForecast(city) {
    try {
        const response = await fetch(`${FORECAST_API_URL}q=${city}&appid=${API_KEY}&units=metric`);
        if (!response.ok) {
            throw new Error("Failed to fetch the extended forecast.");
        }
        displayForecast(await response.json());
    } catch (error) {
        console.error("Forecast Error:", error);
    }
}

// Display 5-day forecast
function displayForecast(data) {
    const forecastContainer = document.getElementById("forecast");
    forecastContainer.innerHTML = "";

    const dailyForecasts = {};
    data.list.forEach((forecast) => {
        const date = new Date(forecast.dt_txt).toISOString().split('T')[0];
        if (!dailyForecasts[date] && forecast.dt_txt.includes("12:00:00")) {
            dailyForecasts[date] = forecast;
        }
    });

    Object.values(dailyForecasts).forEach((forecast) => {
        forecastContainer.innerHTML += `
            <div class="bg-white p-4 rounded-lg shadow-md text-center border">
                <p class="text-gray-700 font-semibold">(${forecast.dt_txt.split(" ")[0]})</p>
                <img src="${ICON_URL}${forecast.weather[0].icon}@2x.png" class="mx-auto my-2">
                <p>Temp: ${forecast.main.temp}°C</p>
                <p>Wind: ${forecast.wind.speed} M/S</p>
                <p>Humidity: ${forecast.main.humidity}%</p>
            </div>`;
    });

    document.getElementById("forecastContainer").classList.remove("hidden");
}
