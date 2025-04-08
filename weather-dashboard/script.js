const apiKey = "a8dad48090799b39188d4d5485533062";

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getWeather() {
  const cityInput = document.getElementById("cityInput").value.trim();
  if (!cityInput) return alert("Please enter a city name");

  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&units=metric&appid=${apiKey}`)
    .then(res => {
      if (!res.ok) throw new Error("City not found");
      return res.json();
    })
    .then(data => {
      displayWeather(data);
      getForecast(cityInput);
    })
    .catch(err => {
      document.getElementById("weatherResult").innerHTML =
        `<div class="alert alert-danger">${err.message}</div>`;
    });
}

function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`)
        .then(res => res.json())
        .then(data => {
          displayWeather(data);
          getForecast(data.name);
        });
    });
  } else {
    alert("Geolocation not supported");
  }
}

function displayWeather(data) {
  const html = `
    <div class="weather-display mx-auto">
      <h3>${data.name}, ${data.sys.country}</h3>
      <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" class="weather-icon" alt="Weather icon">
      <div class="weather-detail"><strong>Temperature:</strong> ${data.main.temp.toFixed(1)} °C</div>
      <div class="weather-detail"><strong>Weather:</strong> ${capitalize(data.weather[0].main)}</div>
      <div class="weather-detail"><strong>Description:</strong> ${capitalize(data.weather[0].description)}</div>
      <div class="weather-detail"><strong>Humidity:</strong> ${data.main.humidity}%</div>
      <div class="weather-detail"><strong>Wind Speed:</strong> ${data.wind.speed} m/s</div>
    </div>
  `;
  document.getElementById("weatherResult").innerHTML = html;
}

function getForecast(cityName) {
  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.length === 0) throw new Error("City not found for forecast.");
      const { lat, lon } = data[0];
      return fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`);
    })
    .then(res => res.json())
    .then(data => {
      displayForecast(data);
    })
    .catch(error => {
      console.error("Forecast error:", error);
      document.getElementById("forecastResult").classList.add("d-none");
    });
}

function displayForecast(data) {
  const forecastResult = document.getElementById("forecastResult");
  const forecastCards = document.getElementById("forecastCards");
  forecastCards.innerHTML = "";

  const dailyData = data.list.filter(item => item.dt_txt.includes("12:00:00"));

  dailyData.forEach(day => {
    const date = new Date(day.dt_txt);
    const icon = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;
    const dayName = date.toLocaleDateString("en-US", { weekday: 'short' });

    const card = `
      <div class="col-md-2 col-sm-4 mb-3">
        <div class="card text-center shadow-sm p-2 bg-light">
          <h6 class="fw-bold">${dayName}</h6>
          <img src="${icon}" alt="icon" style="width:50px">
          <div class="small">${capitalize(day.weather[0].description)}</div>
          <div class="fw-bold mt-1">${day.main.temp.toFixed(1)} °C</div>
        </div>
      </div>
    `;
    forecastCards.innerHTML += card;
  });

  forecastResult.classList.remove("d-none");
}

function getCitySuggestions() {
  const input = document.getElementById("cityInput").value;
  const suggestionBox = document.getElementById("suggestions");

  if (input.length < 2) {
    suggestionBox.innerHTML = "";
    return;
  }

  fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${input}&limit=5&appid=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      suggestionBox.innerHTML = "";
      data.forEach(city => {
        const item = document.createElement("div");
        item.textContent = `${city.name}, ${city.country}`;
        item.onclick = () => {
          document.getElementById("cityInput").value = city.name;
          suggestionBox.innerHTML = "";
          getWeather();
        };
        suggestionBox.appendChild(item);
      });
    });
}
