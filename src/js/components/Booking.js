import {select, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
class Booking {
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        //console.log('element: ', element);
        thisBooking.initWidgets();
    }

    render(element){
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
       // console.log('co: ', thisBooking.element);
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = document.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = document.querySelector(select.booking.hoursAmount);
        //console.log(thisBooking.dom.peopleAmount);
        //console.log(thisBooking.dom.hoursAmount);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
        thisBooking.dom.peopleAmount.addEventListener('click', function(event){
            event.preventDefault();
        });  
        thisBooking.dom.hoursAmount.addEventListener('click', function(event){
            event.preventDefault();
        });   
    }
}

export default Booking;