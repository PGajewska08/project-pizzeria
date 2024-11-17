/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

//const { active } = require("browser-sync");

{
  'use strict';
//  obiekt zawierający selektory, które będą nam potrzebne w tym module
const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

//  nazwy klas, którymi nasz skrypt będzie manipulował (nadawał i usuwał)  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

//  ustawienia naszego skryptu, wszystkie wartości, które wygodniej będzie zmieniać w jednym miejscu
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

//  szablony Handlebars, do których wykorzystujemy selektory z obiektu select
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data){
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElelments();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      //console.log('new Product: ', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* generate html based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log(generatedHTML);

      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);

      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElelments(){
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      //console.log(thisProduct.accordionTrigger);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      //console.log(thisProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      //console.log(thisProduct.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      //console.log(thisProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      //console.log(thisProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);

      thisProduct.amountWidgetElement = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;
      
      // find the clickable trigger (the element that should react to clicking)
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable); // CLICKABLE - NAGŁÓWEK 
      // console.log(clickableTrigger);
     
      // start: add event listener to clickable trigger on event click
      thisProduct.accordionTrigger.addEventListener('click',function(event){
        // prevent default action for event 
        event.preventDefault();
        // toggle active class on thisProduct.element 
        thisProduct.element.classList.toggle('active');
        
        //console.log('kliknięty element: ',thisProduct.element); // ELEMENT DOM - ARTYKUŁ
        // find active product (product that has active class)
        const activeProduct = document.querySelector('.product.active');
        
        
        // if there is active product and it's not thisProduct.element, remove class active from it
        if((activeProduct)&&(activeProduct!=thisProduct.element)){
          activeProduct.classList.remove('active');
        }
      });  
    }  
    
    // Metoda : dodawanie listenerów eventów do formularza, jego kontrolek i guzika dodania do koszyka
    initOrderForm(){
      const thisProduct = this;

      // po zatwierdzeniu formularza uruchamiamy funkcję processOrder
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      // po zmianie w inputach formularza (zaznaczenie / odznaczenie opcji) uruchamiamy funkcję processOrder
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      // po kliknięciu w przycisk karty uruchamiamy funkcję processOrder
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }

    processOrder(){
      const thisProduct = this;
      
      // convert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives',['redPeppers']] } 
      const formData = utils.serializeFormToObject(thisProduct.form); //dane z formularzy - ktore są zaznaczone

      //set price to default price
      let price = thisProduct.data.price;  // domyślna cena 

      // for every category (param)... dla każdej kategorii np. sos, dodatki, typ kawy
      for(let paramId in thisProduct.data.params){
        //determine param value, e.g. paramId= 'toppings', param = {label: 'Toppings', type: 'checkboxes'...}
        const param = thisProduct.data.params[paramId]; // param - cały obiekt, paramId - tylko nazwa parametru
        
        // for every option in this category - dla każdej opcji w kategorii
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log(optionId, option);
          const optionImageClass = '.'+ paramId + '-' + optionId;
          
          const optionImage = thisProduct.imageWrapper.querySelector(optionImageClass);
          // check if there is param with a name of paramId in formData and if it includes optionId
          if(formData[paramId] && formData[paramId].includes(optionId)) {
            // check if the option is not default
            if(option.default!='true') {
              price += option.price;
            }else {
              // check if the option is default
              if(option.default=='true') {
                price -= option.price;
              }
            }
            
            if(optionImage){
              optionImage.classList.add(classNames.menuProduct.imageVisible);
            }
          }
          else{
            if(optionImage){
              optionImage.classList.remove(classNames.menuProduct.imageVisible);
            }
          } 
        }
      }

      //multiply price by amount
      price *= thisProduct.amountWidget.value;
      //update calculated price in the html
      thisProduct.priceElem.innerHTML = price;
    }

    initAmountWidget(){
      const thisProduct = this;
      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElement);
      thisProduct.amountWidgetElement.addEventListener('updated', function(){
        thisProduct.processOrder();
      })
    }
  }

  class AmountWidget {
    constructor (element){
      const thisWidget = this;

      
      console.log('AmountWidget: ', thisWidget);
      console.log('constructor arguments: ', element);

      thisWidget.getElements(element);

      // validate set value
      if(thisWidget.input.value !== null && thisWidget.input.value !== ''){
        thisWidget.setValue(thisWidget.input.value);
      }
      else{
        thisWidget.setValue(1);
      }
      thisWidget.initActions();
    }

    getElements(element){
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
      thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);
    }

    setValue(value){
      const thisWidget = this;

      const newValue = parseInt(value);

      // To do: Add validation:

      
      if( (!isNaN(newValue)) && (newValue !== thisWidget.value) ){
        if( (newValue >= settings.amountWidget.defaultMin) && (newValue <= settings.amountWidget.defaultMax) ){
          thisWidget.value = newValue;
          thisWidget.announce();
          console.log('newValue: ',newValue);
        }
      }
      else{
        console.log('blad');
      }
      thisWidget.input.value = thisWidget.value;
      
    } 

    initActions(){
      const thisWidget = this;
      thisWidget.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.input.value);
      });
      thisWidget.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
        });
      thisWidget.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
        });
    }

    announce(){
      const thisWidget = this;

      const event = new Event('updated');
      thisWidget.element.dispatchEvent(event);
    }
  }

//  obiekt, który pomoże nam w organizacji kodu naszej aplikacji
  const app = {
    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data: ',thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },

    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      console.log('..........................................');

      thisApp.initData();
      thisApp.initMenu();
    },
  };

//  wywołanie metody, która będzie uruchamiać wszystkie pozostałe komponenty strony
  app.init();
}
