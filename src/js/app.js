 import {settings, select, classNames} from './settings.js';
 import Product from './components/Product.js';
 import Cart from './components/Cart.js';
 import Booking from './components/Booking.js';
 import Flickity from './components/Flickity.js';
 const app = {
    initPages: function(){
      const thisApp = this;
      thisApp.pages = document.querySelector(select.containerOf.pages).children;
      thisApp.navLinks = document.querySelectorAll(select.nav.links);
      thisApp.tilesLinks= document.querySelectorAll(select.home.links);

      const idFromHash = window.location.hash.replace('#/','');
     
      //console.log('idFromHash', idFromHash);

      let pageMatchingHash = thisApp.pages[0].id;

      for(let page of thisApp.pages){
        if(page.id == idFromHash){
          pageMatchingHash = page.id;
          console.log('pageMatchingHash', pageMatchingHash);
          break;
        }
      }
      thisApp.activatePage(idFromHash);

      for(let link of thisApp.navLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          // get page id from href attribute
          const id = clickedElement.getAttribute('href').replace('#','');
          // run thisApp.activatePage with that id

          thisApp.activatePage(id);

          // change URL hash
          window.location.hash = '#/' + id;
        });
      }
      for(let link of thisApp.tilesLinks){
        link.addEventListener('click', function(event){
          const clickedElement = this;
          event.preventDefault();

          // get page id from href attribute
          const id = clickedElement.getAttribute('href').replace('#','');
          // run thisApp.activatePage with that id

          thisApp.activatePage(id);

          // change URL hash
          window.location.hash = '#/' + id;
        });
      }
    },

    activatePage: function(pageId){
      const thisApp = this;

      // add class "active" to matching pages, remove from non-matching
      for(let page of thisApp.pages){
        page.classList.toggle(classNames.pages.active, page.id == pageId);
      }
      for(let link of thisApp.navLinks){
        link.classList.toggle(
          classNames.nav.active, 
          link.getAttribute('href') == '#' + pageId);
      }

      // add class "active" to matching links, remove from non-matching
    },

    initMenu: function(){
      const thisApp = this;

      //console.log('thisApp.data: ',thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          //console.log('parsedResponse', parsedResponse);

          // Save parsedResponse as thisApp.data.products
          thisApp.data.products = parsedResponse;

          // Execute initMenu method
          thisApp.initMenu();
        });
      //console.log('thisApp.data', JSON.stringify(thisApp.data));
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    },

    initBooking: function(){
      const bookingWidget = document.querySelector(select.containerOf.booking);
      const booking = new Booking(bookingWidget);
      console.log('new booking: ', booking);
    },

    initCarousel: function(){
      const elem = document.querySelector('.main-carousel');
      const flkty = new Flickity( elem, {
      // options
      cellAlign: 'left',
      contain: true,
      });
      
      console.log(flkty);
    }, 

    init: function(){
      const thisApp = this;
      // console.log('*** App starting ***');
      // console.log('thisApp:', thisApp);
      // console.log('classNames:', classNames);
      // console.log('settings:', settings);
      // console.log('templates:', templates);
      // console.log('..........................................');
      
      thisApp.initPages();

      thisApp.initData();
      //thisApp.initMenu();
      thisApp.initCart();

      thisApp.initBooking();

      thisApp.initCarousel();
      thisApp.activatePage('home');
    },
  };

  app.init();
