const apiKey = '3fd2be6f0c70a2a598f084ddfb75487c';
const language = 'ru-RU';
const postersWidth = 'w500';

const filmsPostersUrl = (posterPath) => `https://image.tmdb.org/t/p/${postersWidth}${posterPath}`;
const filmsGenresUrl = `https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=${language}`;

const filmsDataUrl = (apiKey, language, sort, sortDirection, page) => 
  `https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&language=${language}&sort_by=${sort}.${sortDirection}&include_adult=false&include_video=false&page=${page}&with_watch_monetization_types=flatrate`;
const filmsDataSearchUrl = (apiKey, language, page, searchQuery = '') => `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&language=${language}&query=${searchQuery}&page=${page}&include_adult=false`;

window.onload = async function() {
  const rootNode = document.querySelector('#root');
  const { content: filmTemplate } = document.querySelector('#film-template');
  const filmsGenres = (await getData(filmsGenresUrl)).genres;

  document.querySelector('#search-input').focus();

  document.querySelector('#search-input').addEventListener('change', (e) => {
    e.preventDefault();
    searchQuery = e.target.value;
    showFilms();
  });

  document.querySelector('#clear-search-button').addEventListener('click', (e) => {
    e.preventDefault();
    searchQuery && (document.querySelector('#search-input').value = '');
    searchQuery && (searchQuery = '');
    showFilms();
  })

  let currentPage = 1;
  let sort = 'popularity';
  let sortDirection = 'desc';
  let searchQuery = '';

  showFilms();

  // Функции для работы с блоками
  async function showFilms() {
    rootNode.innerHTML = '';
    const filmsData = searchQuery ? (await getData(filmsDataSearchUrl(apiKey, language, currentPage, searchQuery))).results : (await getData(filmsDataUrl(apiKey, language, sort, sortDirection, currentPage))).results;
    filmsData.forEach(data => rootNode.append(film(data, filmTemplate)));
  }

  function film(filmData, filmTemplate) {
    const {
      adult,
      original_language,
      title,
      original_title,
      vote_average,
      release_date,
      poster_path,
      genre_ids,
      popularity,
      overview,
    } = filmData;

    const filmNode = document.importNode(filmTemplate, true);

    poster_path && (filmNode.querySelector('#film-poster').src = filmsPostersUrl(poster_path));
    filmNode.querySelector('#film-name').innerText = title;
    filmNode.querySelector('#film-original-name').innerText = original_title;
    filmNode.querySelector('#film-rating').innerHTML += vote_average;
    release_date && (filmNode.querySelector('#film-release-date').innerHTML += release_date.slice(0, 4));
    filmNode.querySelector('#film-popularity').innerHTML += Math.floor(popularity);
    filmNode.querySelector('#film-original-language').innerHTML += original_language;
    filmNode.querySelector('#film-description').innerHTML += overview;

    genre_ids.forEach((genreID, i) => {
      const genreName = filmsGenres[filmsGenres.findIndex(genre => genre.id === genreID)].name;
      filmNode.querySelector('#film-genres').innerText += (i !== genre_ids.length - 1) ? `${genreName}, ` : genreName;
    });

    if (adult) {
      const adultBadge = document.createElement('span');
      adultBadge.setAttribute('class', 'film-adult film-badge');
      adultBadge.innerText = '18+';

      filmNode.querySelector('#film-badges').append(adultBadge);
    }

    filmNode.querySelector('#film-show-description-button').addEventListener('click', (e, filmNodeNum) => {
      e.target.parentNode.classList.toggle('film-info-wrapper_open');
      e.target.parentNode.parentNode.childNodes[5].classList.toggle('film-description_open');
    });

    return filmNode;
  }
}

async function getData(dataUrl) {
  const res = await fetch(dataUrl);
  const data = await res.json();

  return data;
}