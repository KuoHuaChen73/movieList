const Display_Mode = {
  CardMode: 'CardMode',
  ListMode: 'ListMode'
}

const movieSource = {
  BASE_URL: 'https://webdev.alphacamp.io',
  INDEX_URL: 'https://webdev.alphacamp.io/api/movies/',
  POSTER_URL: 'https://webdev.alphacamp.io/posters/'
}


const view = {
  //渲染電影清單:卡片模式
  renderMovieListByCardMode(data) {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
    <div class="col-sm-3">
      <div class="mb-2">
        <div class="card">
          <img
            src="${movieSource.POSTER_URL + item.image}"
            class="card-img-top" alt="Movie Poster">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
          </div>
          <div class="card-footer">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
            data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    </div>
    `
    })
    htmlElement.dataPanel.innerHTML = rawHTML
  },
//渲染電影清單:列表模式
  renderMovieListByListMode(data) {
    let rawHTML = ''
    data.forEach((item) => {
      rawHTML += `
      <div class='d-flex mb-2 align-items-center'>
      <h5 class="movie-title me-auto">${item.title}</h5>
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
            data-bs-target="#movie-modal" data-id="${item.id}">More</button>
            <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
      </div>
      <hr>
    `
    })
    htmlElement.dataPanel.innerHTML = rawHTML
  },

  renderPaginator(amount) {
    const numberOfPage = Math.ceil(amount / model.Movies_Per_Page)
    let rawHTML = ''
    for (let page = 1; page <= numberOfPage; page++) {
      rawHTML += `
    <li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>
    `
    }
    htmlElement.paginator.innerHTML = rawHTML
  },

  showMovieModal(id) {
    htmlElement.modalTitle.innerText = null
    htmlElement.modalImg.innerHTML = null
    htmlElement.modalDate.innerText = null
    htmlElement.modalDescription.innerText = null
    axios.get(movieSource.INDEX_URL + id).then((response) => {
      const data = response.data.results
      htmlElement.modalTitle.innerText = data.title
      htmlElement.modalImg.innerHTML = `<img src="${movieSource.POSTER_URL + data.image}" alt="movie-poster" class="img-fluid">`
      htmlElement.modalDate.innerText = 'Release date: ' + data.release_date
      htmlElement.modalDescription.innerText = data.description
    })
  }
}

const model = {
  Movies_Per_Page: 12,
  movies: [],
  filteredMovies: [],
  currentPage: 1,

  getMoviesByPage(page) {
    const data = this.filteredMovies.length ? this.filteredMovies : this.movies
    const startIndex = (page - 1) * this.Movies_Per_Page
    return data.slice(startIndex, startIndex + this.Movies_Per_Page)
  },

  addToFavorite(id) {
    const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
    const movie = model.movies.find(movie => movie.id === id)
    if (list.some((movie) => movie.id === id)) {
      return alert('此部電影已經在收藏清單中')
    }
    list.push(movie)
    localStorage.setItem('favoriteMovies', JSON.stringify(list))
  }
}

const controller = {
  currentMode: Display_Mode.CardMode,

  getMovieSource() {
    axios
      .get(movieSource.INDEX_URL)
      .then((response) => {
        model.movies.push(...response.data.results)
        this.dispatchRenderAction()
        view.renderPaginator(model.movies.length)
      })
      .catch((err) => console.log(err))
  },
//切換顯示模式
  switchDisplayMode(mode) {
    if (mode.target.classList.contains('fa-th')) {
      this.currentMode = Display_Mode.CardMode
    }
    else if (mode.target.classList.contains('fa-bars')) {
      this.currentMode = Display_Mode.ListMode
    }
    this.dispatchRenderAction()
  },
//渲染行為
  dispatchRenderAction() {
    switch (this.currentMode) {
      case Display_Mode.CardMode:
        view.renderMovieListByCardMode(model.getMoviesByPage(model.currentPage))
        break
      case Display_Mode.ListMode:
        view.renderMovieListByListMode(model.getMoviesByPage(model.currentPage))
        break
    }
  }
}

const htmlElement = {
  dataPanel: document.querySelector('#data-panel'),
  paginator: document.querySelector('#paginator'),
  searchInput: document.querySelector('#search-input'),
  searchForm: document.querySelector('#search-form'),
  modalTitle: document.querySelector('#movie-modal-title'),
  modalImg: document.querySelector('#movie-modal-image'),
  modalDate: document.querySelector('#movie-modal-date'),
  modalDescription: document.querySelector('#movie-modal-description'),
  mode: document.querySelector('#mode')
}

htmlElement.dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    view.showMovieModal(Number(event.target.dataset.id))
  }
  else if (event.target.matches('.btn-add-favorite')) {
    model.addToFavorite(Number(event.target.dataset.id))
  }
})

htmlElement.searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = htmlElement.searchInput.value.trim().toLowerCase()
  model.filteredMovies = model.movies.filter((movie) => {
    return movie.title.toLowerCase().includes(keyword)
  })
  if (model.filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字 : ${keyword} 沒有符合條件的電影`)
  }
  model.currentPage = 1
  controller.dispatchRenderAction()
  view.renderPaginator(model.filteredMovies.length)
})

htmlElement.paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return
  model.currentPage = Number(event.target.dataset.page)
  controller.dispatchRenderAction()
})

htmlElement.mode.addEventListener('click', event => {
  controller.switchDisplayMode(event)
})

controller.getMovieSource()