const autoCompleteConfig = {
  // Render a list of movies
  renderOption(movie) {
    // Hide empy movie poster if not available
    const imgSrc = movie.Poster === 'N/A' ? '' : movie.Poster;
    return `
      <img src= "${imgSrc}" />
      ${movie.Title} (${movie.Year})
    `;
  },

  inputValue(movie) {
    return movie.Title;
  },
  async fetchData(searchTerm) {
    // Retreiving data from omdbapi.com
    const response = await axios.get('http://www.omdbapi.com/', {
      params: {
        apikey: '7a6cb94a',
        s: searchTerm,
      },
    });
    if (response.data.Error) {
      return [];
    }
    // return list of fetched movies
    return response.data.Search;
  },
};

//********* 0. Very first function call *********
createAutoComplete({
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#left-summary'), 'left');
  },
  root: document.querySelector('#left-autocomplete'),
});

createAutoComplete({
  ...autoCompleteConfig,
  onOptionSelect(movie) {
    document.querySelector('.tutorial').classList.add('is-hidden');
    onMovieSelect(movie, document.querySelector('#right-summary'), 'right');
  },
  root: document.querySelector('#right-autocomplete'),
});

// Fetching movie details
let left;
let right;
const onMovieSelect = async (movie, summaryElement, side) => {
  const response = await axios.get('http://www.omdbapi.com/', {
    params: {
      apikey: '7a6cb94a',
      i: movie.imdbID,
    },
  });
  summaryElement.innerHTML = movieTemplate(response.data);
  if (side === 'left') {
    left = response.data;
  } else {
    right = response.data;
  }
  // When information from left and right side are available, run comparison
  if (left && right) {
    runComparison(response.data);
  }
};

const runComparison = (data) => {
  const leftSideStats = document.querySelectorAll('#left-summary .compare');
  const rightSideStats = document.querySelectorAll('#right-summary .compare');

  leftSideStats.forEach((leftStat, index) => {
    const rightStat = rightSideStats[index];
    const rightSideValue = parseFloat(rightStat.dataset.value);
    const leftSideValue = parseFloat(leftStat.dataset.value);
    if (leftSideValue > rightSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else if (leftSideValue === rightSideValue) {
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    } else if (isNaN(rightSideValue) && isNaN(leftSideValue)) {
      leftStat.classList.remove('is-primary');
      rightStat.classList.remove('is-primary');
    } else if (isNaN(rightSideValue)) {
      rightStat.classList.remove('is-primary');
      leftStat.classList.remove('is-primary');
      leftStat.classList.add('is-warning');
    } else if (isNaN(leftSideValue)) {
      leftStat.classList.remove('is-primary');
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    } else if (leftSideValue < rightSideValue) {
      rightStat.classList.remove('is-primary');
      rightStat.classList.add('is-warning');
    }
  });
};

// Template layout to display selected movie
const movieTemplate = (movieDetail) => {
  // removing $ , from the string, and convert to integer
  const dollars = parseInt(
    movieDetail.BoxOffice.replace(/\$/g, '').replace(/,/g, '')
  );
  const rottenRating = parseInt(movieDetail.Ratings[1].Value.replace(/%/g, ''));
  const metascore = parseInt(movieDetail.Metascore);
  const imdbRating = parseFloat(movieDetail.imdbRating);
  const imdbVotes = parseInt(movieDetail.imdbVotes.replace(/,/g, ''));
  // const runtime = parseInt(movieDetail.Runtime.replace(/\D+/, ''));
  const awards = movieDetail.Awards.split(' ').reduce((prev, word) => {
    const value = parseInt(word);
    if (isNaN(value)) {
      return prev;
    } else {
      return prev + value;
    }
  }, 0);
  return `
    <article class="media">
      <figure class="media-left">
        <p class="image">
          <img src="${movieDetail.Poster}" />
        </p>
      </figure>
      <div class="media-content">
        <div class="content">
          <h1>${movieDetail.Title} (${movieDetail.Year})</h1>
          <h4>${movieDetail.Genre}</h4>
          <p>${movieDetail.Plot}</p>
        </div>
      </div>
    </article>
    <article data-value=${awards} class="compare notification is-primary">
      <p class="title is-4">${movieDetail.Awards}</p>
      <p class="subtitle">Awards</p>
    </article>
    <article data-value=${dollars} class="compare notification is-primary">
      <p class="title">${movieDetail.BoxOffice}</p>
      <p class="subtitle">Box Offices</p>
    </article>
    <article data-value=${rottenRating} class="compare notification is-primary">
      <p class="title">${movieDetail.Ratings[1].Value}</p>
      <p class="subtitle">Rotten Tomatoes</p>
    </article>
    <article data-value=${metascore} class="compare notification is-primary">
      <p class="title">${movieDetail.Metascore}</p>
      <p class="subtitle">Metascore</p>
    </article>
    <article data-value=${imdbRating} class="compare notification is-primary">
      <p class="title">${movieDetail.imdbRating}</p>
      <p class="subtitle">IMDB Rating</p>
    </article>
    <article data-value=${imdbVotes} class="compare notification is-primary">
      <p class="title">${movieDetail.imdbVotes}</p>
      <p class="subtitle">IMDB Votes</p>
    </article>
    <article class="notification is-primary">
      <p class="title">${movieDetail.Runtime}</p>
      <p class="subtitle">Movie Length</p>
    </article>
    
  `;
};
