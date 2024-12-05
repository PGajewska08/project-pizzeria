import {classNames, select, settings, templates} from '../settings.js';
import {utils} from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
    constructor(element){
        const thisBooking = this;
        thisBooking.starters = [];

        thisBooking.selectedTable = '';

        thisBooking.render(element);
        //console.log('element: ', element);
        thisBooking.initWidgets();

        thisBooking.getData();

        thisBooking.initActions();

    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

        const params = {
            bookings: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };
        //console.log('getData params',params);

        const urls = {
            bookings:      settings.db.url + '/' + settings.db.bookings 
                                           + '?' + params.bookings.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
            eventsRepeat:  settings.db.url + '/' + settings.db.events   
                                           + '?' + params.eventsCurrent.join('&'),
        };

        Promise.all([
            fetch(urls.bookings),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
          .then(function(allResponses){
            const bookingsResponse = allResponses[0];
            const eventsCurrentResponse = allResponses[1];
            const eventsRepeatResponse = allResponses[2];
            return Promise.all([
                bookingsResponse.json(),
                eventsCurrentResponse.json(),
                eventsRepeatResponse.json(),
            ]);
          })
           .then(function([bookings, eventsCurrent, eventsRepeat]){
            //console.log(bookings);
            //console.log(eventsCurrent);
            //console.log(eventsRepeat);
            thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
           })

    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of eventsCurrent){// dla każdego wydarzenia jednorazowego
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of bookings){// dla każdej rezerwacji
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePicker.minDate;
        const maxDate = thisBooking.datePicker.maxDate;

        for(let item of eventsRepeat){// dla każdego wydarzenia cyklicznego
            if(item.repeat == 'daily'){ // sprawdzamy czy wydarzenie jest codziennie - powtarza się każdego dnia, jeśli tak:
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }
                thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
            }   
        }

        //console.log('thisBooking.booked: ',thisBooking.booked);
        thisBooking.updateDOM();
    }

    updateDOM(){
        const thisBooking = this;

        //wartości wybrane aktualnie przez użytkownika:
        thisBooking.date = thisBooking.datePicker.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

        let allAvaliable = false; // zmienna oznaczająca że tego dnia, o tej godzinie wszystkie stoliki są dostępne

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined' // jeśli dla tej daty nie ma obiektu
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined' // lub dla tej daty i godziny nie istnieje tablica
        ){
            allAvaliable = true; // żaden stolik nie jest zajęty
        }

        for(let table of thisBooking.dom.tables){ // dla wszystkich stolików widocznych na stronie
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            // sperawdzamy czy któryś stolik jest zajęty
            if(
                !allAvaliable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ){
                table.classList.add(classNames.booking.tableBooked);
            }else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;
        // sprawdzamy czy mamy jakąś rezerwację dla danej daty, czyli czy obiekt thisBooking.booked[date] nie jest undefined
        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {}; // jeśli jest undefined - tworzymy pusty obiekt
        }

        const startHour = utils.hourToNumber(hour); // konwersja godziny na liczbę

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){ // sprawdzamy czy dla danej godziny jest jakaś rezerwacja, czy tablica thisBooking.booked[date][startHour] nie jest undefined
                thisBooking.booked[date][hourBlock] = []; // jeśli jest undefined, tworzymy pustą tablicę
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    render(element){
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();
        thisBooking.element = utils.createDOMFromHTML(generatedHTML);
       // console.log('co: ', thisBooking.element);
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.tablesWrapper = thisBooking.dom.wrapper.querySelector(select.booking.tablesWrapper);
        console.log('thisBooking.dom.tablesWrapper: ',thisBooking.dom.tablesWrapper);

        thisBooking.dom.hoursAmountValue = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmountValue);
        thisBooking.dom.peopleAmountValue = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmountValue);

        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);

        thisBooking.dom.startersContainer = thisBooking.dom.wrapper.querySelector(select.booking.starters);
    }

    initWidgets(){
        const thisBooking = this;
        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.peopleAmount.addEventListener('click', function(event){
            event.preventDefault();
            thisBooking.resetSelectedTable();
        });  
        thisBooking.dom.hoursAmount.addEventListener('click', function(event){
            event.preventDefault();
            thisBooking.resetSelectedTable();
        });   

        thisBooking.dom.datePicker.addEventListener('click', function(event){
            event.preventDefault();
            thisBooking.resetSelectedTable();
        });

        thisBooking.dom.hourPicker.addEventListener('click', function(event){
            event.preventDefault();
            thisBooking.resetSelectedTable();
        });

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
        });

        thisBooking.dom.tablesWrapper.addEventListener('click', function(event){
            event.preventDefault();
            const clickedElement = event.target;
            const tableId = clickedElement.getAttribute('data-table');
            //const tables = thisBooking.dom.tablesWrapper.querySelectorAll('.table');
            if(clickedElement.classList.contains('table')){
                if(thisBooking.selectedTable == tableId){
                    thisBooking.resetSelectedTable();
                }else{
                    //console.log('kliknieto wolny stolik');
                    // if(!clickedElement.classList.contains('selected')){
                    thisBooking.resetSelectedTable();
                    thisBooking.selectedTable = tableId;
                    clickedElement.classList.add('selected');
                    //console.log('klasy kliknietego stolika: ',clickedElement.classList);
                    
                    // }
                }

            }
        });
    }

    resetSelectedTable(){
        const thisBooking = this;
        const tables = thisBooking.dom.tablesWrapper.querySelectorAll('.table');
        for(const table of tables){
            if(table.classList.contains('selected')){
                table.classList.remove('selected');
            } 
        }
        thisBooking.selectedTable = '';
    }

    initActions(){
        const thisBooking = this;
        thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);
        thisBooking.dom.form.addEventListener('submit', function(event){
            event.preventDefault();
            
            thisBooking.sendBooking();
            //console.log('send');
          });
          thisBooking.dom.startersContainer.addEventListener('click', function(event){
            const kliknietyElement = event.target;
            //console.log('clicked: ',kliknietyElement);
            if(kliknietyElement.tagName == 'INPUT' && kliknietyElement.getAttribute('type') == 'checkbox' && kliknietyElement.getAttribute('name') == 'starter'){
              const value = kliknietyElement.getAttribute('value');
              //console.log(value);
              if(kliknietyElement.checked == true){
                thisBooking.starters.push(value);
                //console.log(thisBooking.starters);
              }
              else{
                const id = thisBooking.starters.indexOf(value);
                thisBooking.starters.splice(id,id+1);
                //console.log(thisBooking.starters);
              }
            }
          });
          //console.log(thisBooking.starters);
    }

    sendBooking(){
        const thisBooking = this;
        const payload = {};
        const url = settings.db.url + '/' + settings.db.bookings;
        const date = thisBooking.datePicker.value;
       // console.log('date: ',date);
        const hour = thisBooking.hourPicker.value;
        //console.log('hour: ',hour);
        const table = thisBooking.selectedTable;
       // console.log('table: ', table);
        const duration = thisBooking.dom.hoursAmountValue.value;
       // console.log('duration: ',duration);
        const ppl = thisBooking.dom.peopleAmountValue.value;
        //console.log('people: ',ppl);
        const starters = thisBooking.starters;
       // console.log('starters: ',starters);
        const phone = thisBooking.dom.phone.value;
       // console.log('phone: ',phone);
        const address = thisBooking.dom.address.value;
       // console.log('address: ',address);
        
        if(!isNaN(ppl) && !isNaN(duration) && !isNaN(table)){
            payload.date = date;
            payload.hour = hour;
            payload.table = table;
            payload.duration = duration;
            payload.ppl = ppl;
            payload.starters = starters;
            payload.phone = phone;
            payload.address = address;
        }
        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          };
          fetch(url, options)
          .then(function(response){
            thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
            return response.json();
            
          }).then(function(parsedResponse){
            console.log('parsedResponse: ', parsedResponse);
          });
    }
}

export default Booking;