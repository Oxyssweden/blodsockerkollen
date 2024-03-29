(function($) {

  var clock,
      // Grab the current date in seconds
      now = Math.floor(Date.now() / 1000),
      EVENT_LOCATION = 0, EVENT_DATE = 1, EVENT_START = 2, EVENT_END = 3, EVENT_TEXT = 4, EVENT_START_TIMESTAMP = 5, EVENT_END_TIMESTAMP = 6,
   defaultText = 'Information om diabetes och gratis blodsockerkoll av sjuksköterska på plats. OBS! Det är dock viktigt att inte äta eller dricka något på en timme före mätning. Vatten går dock bra att dricka',
      timeIcon = '          <svg role="img" class="icon" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-100 0 1200 1200" enable-background="new 0 0 1000 1000" xml:space="preserve">\n' +
          '<title>Klocka</title>\n' +
          '            <g><path d="M952.5,318.8v7.8h7.8L952.5,318.8z"/><path d="M500,54.8c60.1,0,118.4,11.8,173.3,35c53,22.4,100.6,54.5,141.5,95.4c40.9,40.9,73,88.5,95.4,141.5c23.2,54.9,35,113.2,35,173.3c0,60.1-11.8,118.4-35,173.3c-22.4,53-54.5,100.6-95.4,141.5c-40.9,40.9-88.5,73-141.5,95.4c-54.9,23.2-113.2,35-173.3,35c-60.1,0-118.4-11.8-173.3-35c-53-22.4-100.6-54.5-141.5-95.4c-40.9-40.9-73-88.5-95.4-141.5c-23.2-54.9-35-113.2-35-173.3s11.8-118.4,35-173.3c22.4-53,54.5-100.6,95.4-141.5c40.9-40.9,88.5-73,141.5-95.4C381.6,66.5,439.9,54.8,500,54.8 M500,10C229.4,10,10,229.4,10,500c0,270.6,219.4,490,490,490c270.6,0,490-219.4,490-490C990,229.4,770.6,10,500,10L500,10z"/><path d="M886.1,485.6H523.5V99.3c0-8.5-7.1-15.4-15.9-15.4h-7.8c-8.8,0-15.9,6.9-15.9,15.4v402.2c0,0,0,0,0,0v7.8c0,0,0,0,0,0v0.4c0,2,0.4,3.9,1.1,5.6c0,0.1,0.1,0.2,0.1,0.2c0.1,0.1,0.1,0.2,0.2,0.4c2.3,5.4,7.4,9.2,13.2,9.2h1.3h7.8h378.4c8.1,0,14.6-7.1,14.6-15.9v-7.8C900.7,492.7,894.1,485.6,886.1,485.6z"/></g>\n' +
          '          </svg>',
      mapIcon= '          <svg role="img" class="icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 1000 1000" enable-background="new 0 0 1000 1000" xml:space="preserve">\n' +
          '<title>Kartmarkör</title>\n' +
          '            <g><g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"><path d="M4757.1,5012.2c-783.1-50-1525.9-396.4-2091.6-971.7c-200.1-204-254-271.3-404.1-498.4c-381-571.5-556.1-1210.3-529.2-1922.3c23.1-598.4,173.2-1079.5,517.6-1647.1c67.3-111.6,710-1225.7,1429.7-2478.3C4397.2-3756.3,4991.8-4780,4997.6-4780c5.8,0,619.6,1058.3,1364.2,2353.3c742.7,1293,1406.6,2443.7,1472,2559.2c727.3,1241.1,531.1,2836.2-477.2,3877.2C6656.2,4733.1,5761.5,5077.6,4757.1,5012.2z M5315,2943.7c386.8-100,735-429.1,858.2-815.8c57.7-175.1,71.2-488.7,28.9-654.2c-134.7-540.7-586.9-921.7-1133.3-954.4C4472.3,480.7,3941.2,879,3793,1473.6c-42.3,165.5-28.9,479.1,28.9,654.2c94.3,296.3,321.3,567.6,590.7,706.2c84.7,42.3,182.8,88.5,219.4,100C4828.2,2995.6,5091.9,2999.5,5315,2943.7z"/></g></g>\n' +
          '          </svg>';

  var url, req = new XMLHttpRequest();
  //https://stackoverflow.com/questions/30082277/accessing-a-new-style-public-google-sheet-as-json
  url = 'https://sheets.googleapis.com/v4/spreadsheets/1gIU2k-9lMgLSDuMw6bWAStAG4Xzrbvb5qPHiRCMkQ0Y/values/Datum?key=AIzaSyAga6MU-zDFj6Dmn65t5reZOdtKP3Kv5tk';
  // Abusing some random parameter for cache busting
  url += '&upload_protocol=' + now;
  req.overrideMimeType("application/json");
  req.open('GET', url, true);
  req.onload  = function() {
    var jsonResponse = JSON.parse(req.responseText);
    var values = jsonResponse.values;
    var headers = values.shift();
    var events = values.map(calculateDates).filter(dropOldEvents);

    if (events[0]) { setNextEvent(events.shift()) }

    if (events[0]) {
      $('#coming_events_title').text("Kommande blodsockerkoll");
      events.map(setComingEvents);
    }

  };
  req.send(null);

  function setNextEvent(event) {
    eventNode = makeEventNode(event);
    $('#next_event').append(eventNode);
    startCountdown(now > event[EVENT_START_TIMESTAMP] ? 0 : event[EVENT_START_TIMESTAMP]);
  }


  function calculateDates(event) {
    event[EVENT_DATE] = event[EVENT_DATE].trim();
    event[EVENT_START] = event[EVENT_START] ? event[EVENT_START].trim() : event[EVENT_START];
    event[EVENT_END] = event[EVENT_END] ? event[EVENT_END].trim() : event[EVENT_END];

    var eventStart = event[EVENT_DATE] + (event[EVENT_START] ? ' ' + event[EVENT_START] : '');
    event[EVENT_START_TIMESTAMP]  = Date.parse(eventStart) / 1000;
    var eventEnd = event[EVENT_DATE] + (event[EVENT_END] ? ' ' + event[EVENT_END] : '');
    event[EVENT_END_TIMESTAMP]  = Date.parse(eventEnd) / 1000;

   // var date = new Date(dateTimestamp).toLocaleString('sv-SE', {timezone: "Europe/Stockholm"});

   // event[EVENT_START_TIMESTAMP] = moment.tz(event[EVENT_DATE] + (event[EVENT_START] ? ' ' + event[EVENT_START] : ''), "Europe/Stockholm").unix();
    //event[EVENT_END_TIMESTAMP] = moment.tz(event[EVENT_DATE] + (event[EVENT_END] ? ' ' + event[EVENT_END] : ''), "Europe/Stockholm").unix();

    return event;
  }


  function dropOldEvents(event) {
    return event[EVENT_END_TIMESTAMP] > now;
  }


  function setComingEvents(event) {
    eventNode = makeEventNode(event);
    $('#coming_events').append(eventNode)
  }


  function makeEventNode(event) {
    var options =  {
      month: 'long',
      day: 'numeric',
    };
    var dateString,
        wrapper = $('<div class="event">'),
        mapUrl = 'https://www.google.se/maps/search/'+ encodeURIComponent(event[EVENT_LOCATION]);
    dateString = (event[EVENT_START] ? event[EVENT_START].replace(':00', '') + '–' + event[EVENT_END] + ', ' : '') +
      new Intl.DateTimeFormat('sv-SE', {month: 'long', day: 'numeric'}).format(new Date(event[EVENT_START_TIMESTAMP] * 1000));

    wrapper.append($('<h3 class="event__location">').html(mapIcon + event[EVENT_LOCATION]));
    wrapper.append($('<div class="event__time">').html(timeIcon + dateString));
    wrapper.append($('<div class="event__text">').html(event[EVENT_TEXT] || defaultText));
    wrapper.append($('<a class="btn" target="_blank" href="' + mapUrl + '">Se på karta</a>'));
    return wrapper;
  }


  function startCountdown(futureDate) {
    // Calculate the difference in seconds between the future and current date
    var diff = futureDate === 0 ? 0 : futureDate - now;
    // Instantiate a coutdown FlipClock
    clock = $('.countdown').FlipClock(diff, {
      clockFace: 'DailyCounter',
      countdown: true,
      language: 'sv'
    });
  }


  function triggerCookieScripts() {
    //Ensure archaic IE ( < Edge) support
    var event, key = 'trackingApproved';
    if(typeof(Event) === "function") {
      event = new Event(key+"Event");
    }else{
      event = document.createEvent("Event");
      event.initEvent(key+"Event", true, false);
    }
    window.dispatchEvent(event);
    dataLayer = window.dataLayer || [];
    dataLayer.push({
      "event": key+"Event"
    });
  }

  if (navigator.cookieEnabled === true) {
    if (document.cookie.indexOf("cookieconsent") === -1) {
      $(document).ready(function() {
        $('#cookie-banner').delay(500).show().animate({bottom:"0px"},1000);
        $('#ok-cookie').click(function() {
          triggerCookieScripts();
          $('#cookie-banner').fadeOut("fast");
          document.cookie="cookieconsent=yes; max-age=31536000; path=/";
        });
      });
    } else {
      // Already approved
      triggerCookieScripts();
    }
  }

}(jQuery));
