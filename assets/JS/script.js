/* Search Bar */
const clearInput = () => {
  const input = document.getElementsByTagName("input")[0];
  input.value = "";
};

/* Declare variables */
const searchBar = document.getElementById("search-bar");
const form = document.getElementById("search-form");
const searchBtn = document.getElementById("btn");
const cityTitle = document.querySelector("h2");
const cityDesc = document.querySelector(".description");
const results = document.getElementById("results");
const mark = document.getElementById("mark");
const markWrap = document.querySelector(".text-mark");
const ul = document.querySelector(".list");
const li = document.querySelector(".list-items");
const resultsContainer = document.querySelector(".results-container");
let searchAttempt = 0;

/* Event on submit */
form.addEventListener("submit", (e) => {
  e.preventDefault();
  searchAttempt++;
  let city = searchBar.value.toLowerCase();
  if (city.includes(" ") === true) {
    /* Handling spaces input */
    let noSpaceCity = city.replaceAll(" ", "-");
    if (noSpaceCity[noSpaceCity.length - 1] == "-") {
      let noLastSpace = noSpaceCity.substring(0, noSpaceCity.length - 1);
      showCity(noLastSpace);
    } else {
      showCity(noSpaceCity);
    }
  } else {
    showCity(city);
  }
});

/* Array within cities */
var arrayCities = [];

/* Fetch API */
getData();
async function getData() {
  let result = await fetch("https://api.teleport.org/api/urban_areas");
  let data = await result.json();
  let arrayCity = data._links["ua:item"];
  var arrayCities = [];
  for (let array in arrayCity) {
    arrayCities.push(arrayCity[array].name.toLowerCase());
  }
  listCities(arrayCities);
}

/* Show city */
async function showCity(city) {
  let res = await fetch(
    `https://api.teleport.org/api/urban_areas/slug:${city}/scores/`
  );
  let data = await res.json();
  if (res.status === 200) {
    /* City Description */
    cityDesc.innerHTML = data.summary;
    /* Show and Hide content */
    resultsContainer.classList.remove("d-none");
    ul.classList.add("d-none");
    markWrap.classList.remove("d-none");
    /* Charts function */
    getChartData(data, city);
    /* Add city to title (space handling) */
    if (city.includes("-") === true) {
      let newCity = city.replaceAll("-", " ");
      cityTitle.textContent = `Welcome to ${newCity}`;
    } else {
      cityTitle.textContent = `Welcome to ${city}`;
    }
    /* Show City mark */
    mark.textContent = Math.floor(data["teleport_city_score"]);
    searchBar.value = "";
  } else {
    //Error Handling
    ul.classList.add("d-none");
    let alertBanner = document.querySelector(".alert-banner");
    alertBanner.classList.add("show-alert");
    setTimeout(function () {
      alertBanner.classList.remove("show-alert");
    }, 2000);
  }
}

function listCities(arrayCities) {
  searchBar.addEventListener("keyup", (e) => {
    ul.classList.remove("d-none");
    removeElements();
    for (let element of arrayCities) {
      if (
        element.toLowerCase().startsWith(searchBar.value.toLowerCase()) &&
        searchBar.value != ""
      ) {
        // Create li element
        let listItem = document.createElement("li");
        listItem.classList.add("list-items");
        listItem.style.cursor = "pointer";
        listItem.setAttribute("onclick", "displayNames('" + element + "')");
        // Display matched part in bold
        let word = element.substr(0, searchBar.value.length);
        word += element.substr(searchBar.value.length);
        listItem.innerHTML = word;
        let ul = document.querySelector(".list");
        ul.appendChild(listItem);
      }
    }
  });
}

function displayNames(value) {
  searchBar.value = value;
}

function removeElements() {
  // Clear all the item
  let items = document.querySelectorAll(".list-items");
  items.forEach((item) => {
    item.remove();
  });
}

/* Event on li click */
ul.addEventListener("click", (e) => {
  let city = e.target.textContent;
  /* Handling spaces input */
  if (city.includes(" ") === true) {
    let noSpaceCity = city.replaceAll(" ", "-");
    if (noSpaceCity[noSpaceCity.length - 1] == "-") {
      let noLastSpace = noSpaceCity.substring(0, noSpaceCity.length - 1);
      showCity(noLastSpace);
    } else {
      showCity(noSpaceCity);
    }
  } else {
    showCity(city);
  }
});

/* **************CHART************** */

/* Get Toronto Data */
let torontoName = [];
let torontoScore = [];
async function getChartData(data, city) {
  /* Third Chart Data */
  let resT = await fetch(
    `https://api.teleport.org/api/urban_areas/slug:toronto/scores/`
  );
  let dataT = await resT.json();
  for (i = 12; i < 17; i++) {
    torontoName.push(dataT.categories[i].name);
    torontoScore.push(
      Math.round(dataT.categories[i]["score_out_of_10"] * 100) / 100
    );
  }
  /* Get All the data for the Charts */
  chartData(data, city);
  torontoName = [];
  torontoScore = [];
}

searchBar.addEventListener("input", (e) => {
  if (searchBar.value === "") {
    ul.classList.add("d-none");
  }
});

/* Set array for the chart */

function chartData(data, city) {
  /* First Chart data */
  var arrayLabels = [];
  var arrayLabels2 = [];
  var arrayVotes = [];
  var arrayVotes2 = [];
  var arrayVotes3 = [];
  let chartObj = data.categories;
  chartObj.forEach((e) => {
    if (arrayLabels.length < 6) {
      arrayLabels.push(e.name);
    }
    if (arrayVotes.length < 6) {
      arrayVotes.push(Math.round(e["score_out_of_10"] * 100) / 100);
    }
  });

  /* Second Chart Data */

  for (i = 6; i < 12; i++) {
    arrayLabels2.push(chartObj[i].name);
    arrayVotes2.push(Math.round(chartObj[i]["score_out_of_10"] * 100) / 100);
  }
  for (i = 12; i < 17; i++) {
    arrayVotes3.push(Math.round(chartObj[i]["score_out_of_10"] * 100) / 100);
  }

  /* Destroy previous Charts */
  if (window.myChart != null) {
    window.myChart.destroy();
  }
  if (window.myChart2 != null) {
    window.myChart2.destroy();
  }
  if (window.myChart3 != null) {
    window.myChart3.destroy();
  }

  /* Main Chart */
  var ctx = document.getElementById("canvas").getContext("2d");
  window.myChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: arrayLabels,
      datasets: [
        {
          label: "",
          data: arrayVotes,
          backgroundColor: [
            "rgba(255, 99, 132, 0.3)",
            "rgba(54, 162, 235, 0.3)",
            "rgba(255, 206, 86, 0.3)",
            "rgba(75, 192, 192, 0.3)",
            "rgba(153, 102, 255, 0.3)",
            "rgba(255, 159, 64, 0.3)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 0,
          },
        },
      },
      legend: {
        labels: {
          boxSize: 0,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
        },
      },
    },
  });
  /* Second Chart */
  var ctx2 = document.getElementById("canvas2").getContext("2d");
  window.myChart2 = new Chart(ctx2, {
    type: "bar",
    data: {
      labels: arrayLabels2,
      datasets: [
        {
          label: "",
          data: arrayVotes2,
          backgroundColor: [
            "rgba(105, 213, 206, 0.7",
            "rgba(90, 191, 189, 0.7",
            "rgba(69, 160, 165, 0.7",
            "rgba(56, 142, 151, 0.7",
            "rgba(43, 124, 137, 0.7",
            "rgba(34, 109, 126, 0.7",
            "rgba(23, 93, 113, 0.7",
            "rgba(9, 74, 98, 0.7",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            boxWidth: 0,
          },
        },
      },
      indexAxis: "y",
      legend: {
        labels: {
          boxSize: 0,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false,
          },
        },
        x: {
          grid: { display: false },
          max: 10,
        },
      },
    },
  });

  /* Third Chart */

  let newCity = city[0].toUpperCase() + city.substring(1);
  window.myChart3 = new Chart(document.getElementById("canvas3"), {
    type: "radar",
    data: {
      labels: torontoName,
      datasets: [
        {
          label: "Toronto",
          fill: true,
          backgroundColor: "rgba(179,181,198,0.2)",
          borderColor: "rgba(179,181,198,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(179,181,198,1)",
          data: torontoScore,
        },
        {
          label: newCity,
          fill: true,
          backgroundColor: "rgba(255,99,132,0.2)",
          borderColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          pointBackgroundColor: "rgba(255,99,132,1)",
          pointBorderColor: "#fff",
          data: arrayVotes3,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      title: {
        display: true,
        text: "Distribution in % of world population",
      },
    },
  });
}
