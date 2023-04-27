import ImagesApiService from './PixabayAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
  galleryContainer: document.querySelector('.gallery'),
  searchForm: document.querySelector('.search-form'),
};

const imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

// Attach event listeners
refs.searchForm.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();

  // Update the query with the value entered in the search field
  imagesApiService.query = e.currentTarget.elements.searchQuery.value.trim();

  // Reset the loaded hits and page of the API service, and clear the gallery container
  imagesApiService.resetLoadedHits();
  imagesApiService.resetPage();
  clearGelleryContainer();

  if (!imagesApiService.query) {
    // If the query is empty, show an error message
    return erorrQuery();
  }

  try {
    const { hits, totalHits } = await imagesApiService.fetchImages();

    if (!hits.length) {
      // If no hits are returned, show an error message
      return erorrQuery();
    }

    // Increment the number of loaded hits and create the gallery markup
    imagesApiService.incrementLoadedHits(hits);
    createGalleryMarkup(hits);

    // Show a success message and refresh the lightbox gallery
    accessQuery(totalHits);
    gallery.refresh();

    if (hits.length === totalHits) {
      // If all hits have been loaded, show an info message
      // endOfSearch();
    }
  } catch (error) {
    console.warn(`${error}`);
  }
}

window.addEventListener('scroll', async () => {
  const scrollPosition = window.innerHeight + window.scrollY;
  const documentHeight = document.documentElement.offsetHeight;
  if (scrollPosition >= documentHeight && imagesApiService.query && !imagesApiService.isLoading) {
    // If the user has scrolled to the bottom of the page and there is a search query, fetch more images
    const { hits, totalHits } = await imagesApiService.fetchImages();

    // Increment the number of loaded hits and create the gallery markup
    imagesApiService.incrementLoadedHits(hits);
    createGalleryMarkup(hits);
    gallery.refresh();

    if (imagesApiService.loadedHits >= totalHits) {
      // If all hits have been loaded, show an info message
      endOfSearch();
    }
  }
});

function accessQuery(totalHits) {
  // Show a success message with the total number of hits
  Notify.success(`Hooray! We found ${totalHits} images.`);
}

function endOfSearch() {
  // Show an info message when all hits have been loaded
  Notify.info("We're sorry, but you've reached the end of search results.");
}

function erorrQuery() {
  // Notification function for an error in the search query
  Notify.failure('Sorry, there are no images matching your search query. Please try again.');
}

function clearGelleryContainer() {
  // Function to clear the gallery container
  refs.galleryContainer.innerHTML = '';
}

function createGalleryMarkup(images) {
  // Map through each image in the array and return a string with the HTML markup for each photo card
  const markup = images
      .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
          return `
      <div class="photo-card">
          <a href="${webformatURL}">
          <img
            class="photo-card__img"
            src="${largeImageURL}" 
            alt="${tags}" 
            loading="lazy" 
            width="320"
            height="212"
          />
      </a>
      <div class="info">
          <p class="info-item">
          <b>Likes</b>
          <span>${likes}</span>
          </p>
          <p class="info-item">
            <b>Views</b>
            <span>${views}</span>
          </p>
          <p class="info-item">
            <b>Comments</b>
            <span>${comments}</span>
          </p>
          <p class="info-item">
            <b>Downloads</b>
            <span>${downloads}</span>
          </p>
      </div>
      </div>
      `;
      })
      // Join all the markup strings together into a single string
      .join('');

     // Insert the markup into the gallery container
    refs.galleryContainer.insertAdjacentHTML('beforeend', markup);
}


function onTopScroll() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
}

function smoothScrollGallery() {
    const { height } = refs.galleryContainer.firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: height * 2,
      behavior: 'smooth',
    });
}

