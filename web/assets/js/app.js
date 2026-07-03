const cardsContainer = document.getElementById("cards");
const searchInput = document.getElementById("searchInput");
const regionFilter = document.getElementById("regionFilter");
const categoryFilter = document.getElementById("categoryFilter");

const totalDestinations = document.getElementById("totalDestinations");
const totalRegions = document.getElementById("totalRegions");
const totalCategories = document.getElementById("totalCategories");

let destinations = [];
let markersLayer;

const map = L.map("map").setView([27.0, 17.0], 6);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
  attribution: "© OpenStreetMap contributors"
}).addTo(map);

markersLayer = L.layerGroup().addTo(map);

function createCard(item) {
  const imageUrl = item.image ? `assets/images/${item.image}` : "";

  return `
    <article class="card">
      <div class="card-image" style="${imageUrl ? `background-image: url('${imageUrl}')` : ""}"></div>
      <div class="card-body">
        <span class="card-category">${item.category}</span>
        <h3>${item.name_ar}</h3>
        <p>${item.summary_ar}</p>
      </div>
    </article>
  `;
}

function createPopup(item) {
  return `
    <div class="popup">
      <h3>${item.name_ar}</h3>
      <p><strong>المدينة:</strong> ${item.city}</p>
      <p><strong>الإقليم:</strong> ${item.region}</p>
      <p><strong>التصنيف:</strong> ${item.category}</p>
      <p>${item.summary_ar}</p>
    </div>
  `;
}

function fillFilters(items) {
  const regions = [...new Set(items.map(item => item.region).filter(Boolean))];
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];

  regions.forEach(region => {
    const option = document.createElement("option");
    option.value = region;
    option.textContent = region;
    regionFilter.appendChild(option);
  });

  categories.forEach(category => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  totalDestinations.textContent = items.length;
  totalRegions.textContent = regions.length;
  totalCategories.textContent = categories.length;
}

function renderCards(items) {
  if (!items.length) {
    cardsContainer.innerHTML = "<p>لا توجد نتائج مطابقة للبحث الحالي.</p>";
    return;
  }

  cardsContainer.innerHTML = items.map(createCard).join("");
}

function renderMap(items) {
  markersLayer.clearLayers();

  items.forEach(item => {
    if (!item.lat || !item.lon) return;

    const marker = L.circleMarker([item.lat, item.lon], {
      radius: 9,
      color: "#0b3d91",
      weight: 2,
      fillColor: "#c89b3c",
      fillOpacity: 0.9
    });

    marker.bindPopup(createPopup(item));
    marker.addTo(markersLayer);
  });
}

function applyFilters() {
  const searchText = searchInput.value.trim().toLowerCase();
  const selectedRegion = regionFilter.value;
  const selectedCategory = categoryFilter.value;

  const filtered = destinations.filter(item => {
    const searchArea = `
      ${item.name_ar}
      ${item.name_en}
      ${item.city}
      ${item.region}
      ${item.category}
      ${item.summary_ar}
    `.toLowerCase();

    const matchesSearch = !searchText || searchArea.includes(searchText);
    const matchesRegion = !selectedRegion || item.region === selectedRegion;
    const matchesCategory = !selectedCategory || item.category === selectedCategory;

    return matchesSearch && matchesRegion && matchesCategory;
  });

  renderCards(filtered);
  renderMap(filtered);
}

fetch("data/destinations.json")
  .then(response => response.json())
  .then(data => {
    destinations = data;

    fillFilters(destinations);
    renderCards(destinations);
    renderMap(destinations);
  })
  .catch(error => {
    console.error("خطأ في تحميل بيانات Visit Libya:", error);
    cardsContainer.innerHTML = "<p>تعذر تحميل بيانات الوجهات.</p>";
  });

searchInput.addEventListener("input", applyFilters);
regionFilter.addEventListener("change", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
