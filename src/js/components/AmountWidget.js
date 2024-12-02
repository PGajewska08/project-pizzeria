import { settings, select } from "../settings.js";
import BaseWidget from "./BaseWidget.js";

class AmountWidget extends BaseWidget{
    constructor (element){
      super(element, settings.amountWidget.defaultValu);
      const thisWidget = this;

      
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);

      thisWidget.getElements(element);

      // validate set value
      if(thisWidget.dom.input.value !== null && thisWidget.dom.input.value !== ''){
        thisWidget.setValue(thisWidget.dom.input.value);
      }
      else{
        thisWidget.setValue(1);
      }
      thisWidget.initActions();
    }

    getElements(){
      const thisWidget = this;
      
      thisWidget.dom.input = thisWidget.dom.wrapper.querySelector(select.widgets.amount.input);
      thisWidget.dom.linkDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
      thisWidget.dom.linkIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);
    }

    isValid(value){
      return !isNaN(value)
        && value >= settings.amountWidget.defaultMin 
        && value <= settings.amountWidget.defaultMax;
    }

    //wyświetl bieżącą wartość widgetu na stronie
    renderValue(){
      const thisWidget = this;
      thisWidget.dom.input.value = thisWidget.value;
    }

    initActions(){
      const thisWidget = this;
      thisWidget.dom.input.addEventListener('change', function(){
        thisWidget.setValue(thisWidget.dom.input.value);
      });
      thisWidget.dom.linkDecrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value-1);
        });
      thisWidget.dom.linkIncrease.addEventListener('click', function(event){
        event.preventDefault();
        thisWidget.setValue(thisWidget.value+1);
        });
    }
  }

  export default AmountWidget;