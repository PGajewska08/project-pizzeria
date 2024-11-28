import { select } from "../settings";
import AmountWidget from "./AmountWidget";
class CartProduct {
    constructor(menuProduct, element){
      const thisCartPoduct = this;
      thisCartPoduct.id = menuProduct.id;
      thisCartPoduct.name = menuProduct.name;
      thisCartPoduct.amount = menuProduct.amount;
      thisCartPoduct.priceSingle = menuProduct.priceSingle;
      thisCartPoduct.price = menuProduct.price;
      thisCartPoduct.params = menuProduct.params;
      thisCartPoduct.getElelments(element);
      thisCartPoduct.initAmountWidget();
      thisCartPoduct.initActions();
    }

    getElelments(element){
      const thisCartProduct = this;
      thisCartProduct.dom = {};
      thisCartProduct.dom.wrapper = element;
      thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
      thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
      thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
      thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
      //console.log('thisCartProduct.dom.amountWidget: ',thisCartProduct.dom.amountWidget);
    }

    initAmountWidget(){
      const thisCartPoduct = this;
      thisCartPoduct.amountWidget = new AmountWidget(thisCartPoduct.dom.amountWidget);
      thisCartPoduct.dom.amountWidget.addEventListener('updated', function(){
      thisCartPoduct.amount = thisCartPoduct.amountWidget.value;
       // console.log('amount: ',thisCartPoduct.amount);
       // console.log('amountWidget: ',thisCartPoduct.amountWidget);
       // console.log('priceSingle: ',thisCartPoduct.priceSingle);
       thisCartPoduct.price = thisCartPoduct.amount * thisCartPoduct.priceSingle;

       thisCartPoduct.dom.price.innerHTML = thisCartPoduct.price;

       
      });
    }

    remove(){
      const thisCartPoduct = this;

      const event = new CustomEvent('remove', {
        bubbles: true,
        detail: {
          cartProduct: thisCartPoduct,
        },
      });
      thisCartPoduct.dom.wrapper.dispatchEvent(event);
      //console.log('removed');
    }

    initActions(){
      const thisCartPoduct = this;
      thisCartPoduct.dom.edit.addEventListener('click', function(event){
        event.preventDefault();
      });
      thisCartPoduct.dom.remove.addEventListener('click', function(event){
        event.preventDefault();
        thisCartPoduct.remove();
      });
    }

    getData(){
      const thisCartPoduct = this;
      const data = {
        id: thisCartPoduct.id,
        amount: thisCartPoduct.amount,
        price: thisCartPoduct.price,
        priceSingle: thisCartPoduct.priceSingle,
        name: thisCartPoduct.name,
        params: thisCartPoduct.params,
      }
      return data;
    }
  }

  export default CartProduct;