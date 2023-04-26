import ImagesApiService from './js/PixabayAPI';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';

const refs = {
   galleryContainer: document.querySelector('.gallery'),
   searchForm: document.querySelector('.search-form'),
   toTopBtn: document.querySelector('.to-top'),
   wrapper: document.querySelector('.wrapper'),
};

const imagesApiService = new ImagesApiService();
const gallery = new SimpleLightbox('.gallery a');

// Set options for the IntersectionObserver API
const optionsForObserver = {
  rootMargin: '250px', // Trigger the callback function when the target element is within 250px of the viewport
};

// Create a new IntersectionObserver instance with the callback function and the options
const observer = new IntersectionObserver(onEntry, optionsForObserver);

// Attach event listeners
refs.searchForm.addEventListener('submit', onSearch);
refs.toTopBtn.addEventListener('click', onTopScroll);
window.addEventListener('scroll', onScrollToTopBtn);

function onSearch(e) {
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

   imagesApiService.fetchImages().then(({ hits, totalHits }) => {
      if (!hits.length) {
      // If no hits are returned, show an error message
      return erorrQuery();
      }

    // Observe the wrapper element
   observer.observe(refs.wrapper);

    // Increment the number of loaded hits and create the gallery markup
   imagesApiService.incrementLoadedHits(hits);
   createGalleryMarkup(hits);

    // Show a success message and refresh the lightbox gallery
   accessQuery(totalHits);
   gallery.refresh();

   if (hits.length === totalHits) {
      // If all hits have been loaded, unobserve the wrapper element and show an info message
      observer.unobserve(refs.wrapper);
      endOfSearch();
      }
   });

  // Unobserve the wrapper element
   observer.unobserve(refs.wrapper);
}

function onEntry(entries) {
   entries.forEach((entry) => {
      if (entry.isIntersecting && imagesApiService.query) {
      // If the target element is within the viewport and there is a search query, fetch more images
      imagesApiService
         .fetchImages()
         .then(({ hits, totalHits }) => {
          // Increment the number of loaded hits and create the gallery markup
         imagesApiService.incrementLoadedHits(hits);

            if (totalHits <= imagesApiService.loadedHits) {
            // If all hits have been loaded, unobserve the wrapper element and show an info message
            observer.unobserve(refs.wrapper);
            endOfSearch();
            }
            createGalleryMarkup(hits);
            smoothScrollGallery();
            gallery.refresh();
         })
         .catch((error) => {
            console.warn(`${error}`);
         });
      }
   });
}

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

// function onScrollToTopBtn() {
//    const offsetTrigger = 100;
//    const pageOffset = window.pageYOffset;

//    pageOffset > offsetTrigger
//       ? refs.toTopBtn.classList.remove('is-hidden')
//       : refs.toTopBtn.classList.add('is-hidden');
// }

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