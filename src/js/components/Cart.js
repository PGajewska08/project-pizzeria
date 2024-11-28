import { settings, select, templates, classNames} from "../settings";
import { utils } from "../utils";
import CartProduct from "./CartProduct";

class Cart {
    constructor(element){
      const thisCart = this;
      thisCart.products = [];

      thisCart.getElelments(element);
      thisCart.initActions();
      //console.log('new cart: ', thisCart);
    }

    getElelments(element){
      const thisCart = this;
      thisCart.dom = {};
      thisCart.dom.wrapper = element;
      thisCart.dom.productList = document.querySelector(select.cart.productList); 

      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

      thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
      thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
      thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
      thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

      thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
     // thisCart.dom.formSubmit = thisCart.dom.wrapper.querySelector(select.cart.formSubmit);
     thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
     thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);

    }

    initActions(){
      const thisCart = this;
      thisCart.dom.toggleTrigger.addEventListener('click', function(){
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });

      thisCart.dom.productList.addEventListener('updated', function(){
        thisCart.update();
      });

      thisCart.dom.productList.addEventListener('remove', function(event){
        thisCart.remove(event.detail.cartProduct);
      });

      thisCart.dom.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisCart.sendOrder();
        //console.log('send');
      });
    }
    
    sendOrder(){
      const thisCart = this;
      //console.log('function sendOrder()');
      const url = settings.db.url + '/' + settings.db.orders;
      //console.log('url: ',url);
      const address = thisCart.dom.address.value;
      const phone = thisCart.dom.phone.value;
      //console.log('address: ', address);
      //console.log('phone: ', phone);

      const totalPrice = thisCart.totalPrice;
      //console.log('totalPrice: ', totalPrice);

      const subtotalPrice = thisCart.subtotalPrice;
      //console.log('subtotalPrice: ', subtotalPrice);

      const totalNumber = thisCart.totalNumber;
      //console.log('totalNumber: ', totalNumber);

      const deliveryFee = thisCart.deliveryFee;
      //console.log('deliveryFee: ', deliveryFee);

      const payload = {
        address: address,
        phone: phone,
        totalPrice: totalPrice,
        subtotalPrice: subtotalPrice,
        totalNumber: totalNumber,
        deliveryFee: deliveryFee,
        products: [],
      }
      for(let prod of thisCart.products){
        payload.products.push(prod.getData());
      }
      //console.log('payload: ', payload);

      // fetch
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      };
      fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      });
    }

    add(menuProduct){
      const thisCart = this;
      const mProduct = menuProduct;
     //console.log('mProduct: ',mProduct);
      const generatedHTML = templates.cartProduct(mProduct);
     // console.log(generatedHTML);
      const generatedDOM = utils.createDOMFromHTML(generatedHTML);
      //console.log(generatedDOM);
      thisCart.dom.productList.appendChild(generatedDOM);
      //console.log(thisCart.dom.productList);


      thisCart.products.push(new CartProduct(mProduct,generatedDOM));
     // console.log('thisCart.products: ', thisCart.products);
     thisCart.update();
    // console.log('tablica produktów: ', thisCart.products);
     //console.log('DOM productList: ',thisCart.dom.productList);
    
    }

    update(){
      const thisCart = this;
      let deliveryFee = 0;
      let totalNumber = 0;
      let subtotalPrice = 0;

      for(let product of thisCart.products){
        totalNumber += product.amount;
        subtotalPrice += product.price;
        //console.log('totalNumber: ',totalNumber);
        //console.log('subtotalPrice: ',subtotalPrice);
      }

      
      //console.log('thisCart.totalPrice: ',thisCart.totalPrice);
      if(totalNumber <= 0){
        deliveryFee = 0;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      }else{
        deliveryFee = settings.cart.defaultDeliveryFee;
        thisCart.dom.deliveryFee.innerHTML = deliveryFee;
      }
      thisCart.totalPrice = subtotalPrice + deliveryFee;
      thisCart.dom.totalNumber.innerHTML = totalNumber;
      thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      for( let totalPriceElement of thisCart.dom.totalPrice){
        totalPriceElement.innerHTML = thisCart.totalPrice;
      }
     // thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
     thisCart.totalNumber = totalNumber;
     thisCart.subtotalPrice = subtotalPrice;
     thisCart.deliveryFee = deliveryFee;
    }

    remove(cartProduct){
      const thisCart = this;
      //console.log('this cart: ', thisCart);
     
      const indexOfCartProduct = thisCart.products.indexOf(cartProduct);
      thisCart.products.splice(indexOfCartProduct,1);
      //console.log('usunięto: ', removedCartProduct);
     // console.log('tablica produktów po usunięciu: ', thisCart.products);
     const elementToRemove = cartProduct.dom.wrapper;
     elementToRemove.remove();
     // console.log(generatedHTML);
      
      thisCart.update();
    }
  }

  export default Cart;