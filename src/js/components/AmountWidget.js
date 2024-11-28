import { settings, select } from "../settings";

class AmountWidget {
    constructor (element){
      const thisWidget = this;

      
      //console.log('AmountWidget: ', thisWidget);
      //console.log('constructor arguments: ', element);

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
          //console.log('newValue: ',newValue);
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

      const event = new CustomEvent('updated', {
        bubbles: true
      });
      thisWidget.element.dispatchEvent(event);
    }
  }

  export default AmountWidget;