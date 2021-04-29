(function($) {
  var placeholder,
      webSocket,
      refreshInterval,
      price,
      subscribeMsg,
      formatter,
      channel;
  var priceOld = 0;
  var diff = 0;
  var status = 'normal';

  var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
      sParameterName = sURLVariables[i].split('=');

      if (sParameterName[0] === sParam) {
        return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
      }
    }

    return false;
  };

  var updatePrice = function(data) {
    price = Number.parseFloat(data.asks[0][0]).toPrecision(6);

    if (price !== priceOld) {
      diff = price - priceOld;

      if (diff == 0) {
        status = 'normal';
      }
      if (diff > 0) {
        status = 'inc';
      }
      if (diff < 0) {
        status = 'desc';
      }

      priceOld = price;
    }
  };

  var refresh = function() {
    placeholder.html(formatter.format(price));
    placeholder.attr('status', status);
  }

  var initWebsocket = function() {
    ws = new WebSocket('wss://ws.bitstamp.net');

    ws.onopen = function () {
      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = function (evt) {
      response = JSON.parse(evt.data);

      switch (response.event) {
        case 'data': {
          updatePrice(response.data);
          break;
        }
        case 'bts:request_reconnect': {
          initWebsocket();
          break;
        }
      }

    };

    ws.onclose = function () {
      initWebsocket();
    };
  };
  
  var setup = function() {
    channel = getUrlParameter('channel');

    subscribeMsg = {
      "event": "bts:subscribe",
      "data": {
        "channel": "order_book_btcusd"
      }
    };
    
    if (channel) {
      subscribeMsg.data.channel = channel;
    }
    
    formatter = new Intl.NumberFormat('en-IN', {
      minimumSignificantDigits: 5,
      maximumSignificantDigits: 5
    });
  };

  $(function() {
    placeholder = $('.price');
    setup();
    initWebsocket();

    refreshInterval = setInterval(function() {
      refresh();
    }, 1000);
  });

})(jQuery);
